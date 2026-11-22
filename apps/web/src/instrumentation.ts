export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NEXT_PHASE !== 'phase-production-build') {
    const { startPrivacyMaintenance } = await import('@/server/privacy-maintenance');
    await startPrivacyMaintenance();
  }
}
