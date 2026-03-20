/**
 * Jest global teardown: release server pg pool if any suite touched `server/db`.
 * Keeps `npm test` from lingering on open handles when the Express DB layer is loaded.
 */
export default async function globalTeardown(): Promise<void> {
  try {
    const { closeServerDatabasePool } = await import('../../server/db/index');
    await closeServerDatabasePool();
  } catch {
    // Pool may never have been initialized; import may fail in edge CI layouts.
  }
}
