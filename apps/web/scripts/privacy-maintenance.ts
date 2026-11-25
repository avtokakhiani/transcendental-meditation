async function main() {
  process.loadEnvFile('.env');
  if (process.argv.includes('--verify-backups')) {
    if (process.argv.includes('--backup')) throw new Error('Verification must run separately from maintenance/backup');
    const { verifyLocalPrivacyBackups } = await import('../src/server/privacy-backups');
    const result = await verifyLocalPrivacyBackups();
    console.log(`Authenticated encrypted backups verified: ${result.count}; recent: ${result.recent}. SQL restore and production readiness are separate checks.`);
    return;
  }
  const { prisma } = await import('../src/server/db');
  try {
    const { runPrivacyMaintenance } = await import('../src/server/privacy-maintenance');
    await runPrivacyMaintenance();
    if (process.argv.includes('--backup')) {
      const { ensureLocalPrivacyBackup } = await import('../src/server/privacy-backups');
      await ensureLocalPrivacyBackup(true);
    }
    console.log('Privacy maintenance completed. External provider/mailbox deletion and hosting retention still require verification.');
  } finally { await prisma.$disconnect(); }
}
main().catch(() => { console.error('Privacy maintenance failed. No connection details or submitted data printed.'); process.exitCode = 1; });
