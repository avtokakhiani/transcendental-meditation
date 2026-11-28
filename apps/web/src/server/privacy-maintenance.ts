import { prisma } from '@/server/db';
import { enforcePrivacyRetention, reapplyErasureLedger } from '@/server/services/privacy';
import { prunePrivacyFiles } from '@/server/privacy-files';
import { privacyOperationalLog } from '@/server/privacy-log';
import { privacyBlobEnabled } from '@/server/privacy-blob';

let running = false;
export async function runPrivacyMaintenance() {
  if (running) return;
  running = true;
  try {
    // Reapply the independent ledger before serving restored data or sending mail.
    await reapplyErasureLedger(prisma);
    const counts = await enforcePrivacyRetention(prisma);
    await prunePrivacyFiles();
    if (process.env.PRIVACY_LOCAL_BACKUPS === 'true') {
      const { ensureLocalPrivacyBackup } = await import('@/server/privacy-backups');
      await ensureLocalPrivacyBackup();
    }
    await privacyOperationalLog('maintenance_success', counts);
  } catch (error) {
    await privacyOperationalLog('maintenance_failure').catch(() => {});
    throw error;
  } finally { running = false; }
}

export async function startPrivacyMaintenance() {
  const state = globalThis as unknown as { privacyMaintenanceTimer?: NodeJS.Timeout };
  if (state.privacyMaintenanceTimer) clearInterval(state.privacyMaintenanceTimer);
  await runPrivacyMaintenance();
  // Blob reads/writes are billed per operation; hourly is ample for a 12-month retention clock.
  const interval = privacyBlobEnabled() ? 3600000 : 60000;
  const task = setInterval(() => { void runPrivacyMaintenance().catch(() => console.error('Privacy maintenance failed; launch must remain blocked until resolved.')); }, interval);
  task.unref();
  state.privacyMaintenanceTimer = task;
}
