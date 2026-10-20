import { PrismaClient } from '@prisma/client';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { sanitizeRichHtml } from '../src/server/sanitize';

/** Explicit editorial update of one existing CMS article; never part of startup or seeding. */
async function main() {
  if (!existsSync('prisma/schema.prisma')) throw new Error('Run this command from apps/web.');
  if (existsSync('.env')) process.loadEnvFile('.env');
  const db = new PrismaClient();
  try {
    const post = await db.post.findUnique({ where: { slug: 'ra-aris-transtsendentuli-meditatsia' } });
    if (post === null) throw new Error('The existing TM introduction article was not found. No article was created.');
    const html = sanitizeRichHtml(await readFile(resolve('content/what-is-tm.ka.html'), 'utf8'));
    if (/<(?:h1|iframe|video|audio|embed|object)\b/i.test(html)) throw new Error('Unexpected heading or media in article content.');
    if (html === post.content && post.contentFormat === 'html') {
      process.stdout.write('The existing TM introduction article is already up to date.\n');
      return;
    }
    const backupDirectory = await mkdtemp(join(tmpdir(), 'learntm-what-is-tm-'));
    await writeFile(join(backupDirectory, 'article-before.json'), JSON.stringify({
      id: post.id, slug: post.slug, content: post.content, contentFormat: post.contentFormat, updatedAt: post.updatedAt,
    }, null, 2), 'utf8');
    const updated = await db.post.updateMany({
      where: { id: post.id, updatedAt: post.updatedAt },
      data: { content: html, contentFormat: 'html' },
    });
    if (updated.count !== 1) throw new Error('The article changed while preparing the update. No content was overwritten.');
    process.stdout.write(`Updated the existing TM introduction article. Original content backed up to ${backupDirectory}.\n`);
  } finally {
    await db.$disconnect();
  }
}

void main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : 'Article update failed.'}\n`);
  process.exitCode = 1;
});
