import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

async function main() {
  process.loadEnvFile('.env');
  const { prisma } = await import('../src/server/db');
  try {
    const { runPrivacyMaintenance } = await import('../src/server/privacy-maintenance');
    await runPrivacyMaintenance();
    if (process.argv.includes('--backup')) {
      const { ensureLocalPrivacyBackup } = await import('../src/server/privacy-backups');
      await ensureLocalPrivacyBackup(true);
    }
    if (process.argv.includes('--verify-backups')) {
      const { decryptBackup } = await import('../src/server/privacy-backups');
      const { privacyStorageDirectory } = await import('../src/server/privacy-files');
      const directory = path.join(privacyStorageDirectory(), 'backups');
      let count = 0;
      for (const name of await readdir(directory)) {
        if (!/^learntm-backup-[\w-]+\.enc$/.test(name)) continue;
        const plaintext = decryptBackup(await readFile(path.join(directory, name)));
        if (!plaintext.length) throw new Error('Empty backup');
        count++;
      }
      console.log(`Authenticated encrypted backups verified: ${count}`);
    }
    console.log('Privacy maintenance completed. External provider/mailbox deletion and hosting retention still require verification.');
  } finally { await prisma.$disconnect(); }
}
main().catch(() => { console.error('Privacy maintenance failed. No connection details or submitted data printed.'); process.exitCode = 1; });
