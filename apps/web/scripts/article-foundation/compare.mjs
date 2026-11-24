/* global createImageBitmap, OffscreenCanvas, fetch */
import assert from 'node:assert/strict';
import console from 'node:console';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { artifacts, db, hash, json, sourceInventory, reviewedSourceChanges } from './local.mjs';

// Chromium GPU image/gradient rasterization varies slightly across separate sessions.
// A 10/255 channel tolerance is used only alongside exact DOM/content/geometry/source checks.
const channelTolerance = 10;
const maximumRasterOutliers = 50;
const browser = await chromium.launch({ channel: 'chrome' });
const report = { channelTolerance, maximumRasterOutliers, screenshots: [], errors: [], identicalDomInventories: 0, existingSourceFilesPreserved: 0, reviewedSourceChanges: [] };
try {
  const before = path.join(artifacts, 'before'), after = path.join(artifacts, 'after');
  const page = await browser.newPage();
  for (const file of (await readdir(before)).filter(file => file.endsWith('.png'))) {
    const [left, right] = await Promise.all([readFile(path.join(before, file)), readFile(path.join(after, file))]);
    let result = { differentPixels: 0, pixelsOverTolerance: 0, maximumChannelDelta: 0 };
    if (hash(left) !== hash(right)) result = await page.evaluate(async ([left, right, tolerance]) => {
      async function decode(data) {
        const image = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob());
        const canvas = new OffscreenCanvas(image.width, image.height), ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        return { width: image.width, height: image.height, data: ctx.getImageData(0, 0, image.width, image.height).data };
      }
      const [a, b] = await Promise.all([decode(left), decode(right)]);
      if (a.width !== b.width || a.height !== b.height) return { dimensionsChanged: true, before: [a.width, a.height], after: [b.width, b.height] };
      let differentPixels = 0, pixelsOverTolerance = 0, maximumChannelDelta = 0;
      for (let i = 0; i < a.data.length; i += 4) {
        let delta = 0;
        for (let j = 0; j < 4; j++) delta = Math.max(delta, Math.abs(a.data[i + j] - b.data[i + j]));
        if (delta > 0) differentPixels++;
        if (delta > tolerance) pixelsOverTolerance++;
        maximumChannelDelta = Math.max(maximumChannelDelta, delta);
      }
      return { differentPixels, pixelsOverTolerance, maximumChannelDelta };
    }, [left.toString('base64'), right.toString('base64'), channelTolerance]);
    report.screenshots.push({ file, ...result });
    if (result.dimensionsChanged || result.pixelsOverTolerance > maximumRasterOutliers) report.errors.push(`Visual mismatch: ${file}`);
  }
  const inventory = JSON.parse(await readFile(path.join(artifacts, 'inventory.json'), 'utf8'));
  for (const route of inventory.routes) for (const width of inventory.widths) {
    const name = `${route === '/' ? 'home' : route.slice(1).replaceAll('/', '__')}-${width}.json`;
    const [a, b] = await Promise.all([readFile(path.join(before, name)), readFile(path.join(after, name))]);
    if (hash(a) !== hash(b)) report.errors.push(`DOM/content/geometry mismatch: ${name}`);
    else report.identicalDomInventories++;
  }
  const sources = await sourceInventory();
  const reviewed = await reviewedSourceChanges();
  for (const [file, digest] of Object.entries(inventory.sources)) {
    if (sources[file] !== digest && Object.hasOwn(reviewed,file) && reviewed[file] === (sources[file]??null)) report.reviewedSourceChanges.push(file);
    else if (sources[file] !== digest) report.errors.push(`Unreviewed source/asset changed: ${file}`);
    else report.existingSourceFilesPreserved++;
  }
  await json(path.join(artifacts, 'visual-verification.json'), report);
  assert.deepEqual(report.errors, [], 'See visual-verification.json; never update baseline to hide a failure');
  console.log(`${report.screenshots.length} screenshots passed at ${channelTolerance}/255 channel tolerance and <=${maximumRasterOutliers} raster outliers; ${report.identicalDomInventories} exact DOM/content/metadata/geometry matches; ${report.existingSourceFilesPreserved} original source/assets unchanged.`);
} finally { await browser.close(); await db.$disconnect(); }
