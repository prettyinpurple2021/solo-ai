/**
 * Jest global teardown
 * Ensures all resources are cleaned up after tests complete
 */

module.exports = async () => {
  // Clean up any singleton instances that might be keeping the process alive
  try {
    // Force cleanup of any remaining timers
    const { clearAllTimers } = require('@jest/environment')
    if (clearAllTimers) {
      clearAllTimers()
    }
  } catch (error) {
    // Jest environment might not be available
  }

  // Clean up any database connections
  try {
    // If database client exists, close connections
    const { db } = require('./db')
    if (db && typeof db.end === 'function') {
      await db.end()
    }
  } catch (error) {
    // Database might be mocked or not available
  }

  // Clean up any fetch mocks
  try {
    if (global.fetch && global.fetch.mockRestore) {
      global.fetch.mockRestore()
    }
  } catch (error) {
    // Fetch might not be mocked
  }

  // Force garbage collection if available
  if (global.gc) {
    global.gc()
  }

  // Give a small delay to ensure all cleanup operations complete
  await new Promise(resolve => setTimeout(resolve, 100))
}