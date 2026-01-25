import { logError, logInfo,} from '@/lib/logger'
import { notificationJobQueue } from './notification-job-queue'


// Job processor configuration
const PROCESSOR_CONFIG = {
  // Check for jobs every 30 seconds
  intervalMs: 30000,
  // Auto-start only if explicitly enabled by env and on server
  autoStart: (process.env.ENABLE_NOTIFICATION_PROCESSOR === 'true'),
  // Enable verbose logging
  enableLogging: true
}

let processorStarted = false

/**
 * Initialize and start the notification job processor
 */
export async function initializeNotificationProcessor(): Promise<void> {
  if (processorStarted) {
    logInfo('Notification processor already started')
    return
  }

  try {
    // Initialize the job queue
    await notificationJobQueue.initialize()
    
    // Start the processor
    notificationJobQueue.startProcessor(PROCESSOR_CONFIG.intervalMs)
    
    processorStarted = true
    
    if (PROCESSOR_CONFIG.enableLogging) {
      logInfo('✅ Notification job processor initialized and started')
      logInfo(`   - Interval: ${PROCESSOR_CONFIG.intervalMs / 1000}s`)
      logInfo(`   - Environment: ${process.env.NODE_ENV}`)
      
      // Log initial stats
      const stats = await notificationJobQueue.getStats()
      logInfo(`   - Pending jobs: ${stats.pending}`)
      logInfo(`   - Processing jobs: ${stats.processing}`)
      logInfo(`   - Total jobs: ${stats.total}`)
    }

    // Set up cleanup job (runs once per day)
    if (process.env.NODE_ENV === 'production') {
      setInterval(async () => {
        try {
          const deletedCount = await notificationJobQueue.cleanup(30)
          if (deletedCount > 0 && PROCESSOR_CONFIG.enableLogging) {
            logInfo(`🧹 Cleaned up ${deletedCount} old notification jobs`)
          }
        } catch (error) {
          logError('Error during job cleanup:', error)
        }
      }, 24 * 60 * 60 * 1000) // 24 hours
    }

  } catch (error) {
    logError('❌ Failed to initialize notification processor:', error)
    throw error
  }
}

/**
 * Stop the notification job processor
 */
export function stopNotificationProcessor(): void {
  notificationJobQueue.stopProcessor()
  processorStarted = false
  logInfo('🛑 Notification job processor stopped')
}

/**
 * Get processor status
 */
export function getProcessorStatus(): { started: boolean, config: typeof PROCESSOR_CONFIG } {
  return {
    started: processorStarted,
    config: PROCESSOR_CONFIG
  }
}

// Auto-start in production (with delay to allow environment setup)
if (typeof window === 'undefined' && PROCESSOR_CONFIG.autoStart) {
  // Only run on server-side with a small delay
  setTimeout(() => {
    initializeNotificationProcessor().catch(error => {
      logError('Failed to auto-start notification processor:', error)
    })
  }, 1000) // 1 second delay
}
