import { logError, logInfo,} from '@/lib/logger'
import { queueProcessor } from './scraping-queue-processor'


let isStarted = false

/**
 * Initialize the scraping queue processor
 * This should be called when the application starts
 */
export async function initializeScrapingSystem(): Promise<void> {
  if (isStarted) {
    logInfo('Scraping system already initialized')
    return
  }

  try {
    logInfo('Initializing scraping system...')
    
    // Start the queue processor
    await queueProcessor.start()
    
    isStarted = true
    logInfo('Scraping system initialized successfully')
    
    // Handle graceful shutdown
    process.on('SIGTERM', gracefulShutdown)
    process.on('SIGINT', gracefulShutdown)
    
  } catch (error) {
    logError('Failed to initialize scraping system:', error)
    throw error
  }
}

/**
 * Graceful shutdown of the scraping system
 */
function gracefulShutdown(signal: string): void {
  logInfo(`Received ${signal}, shutting down scraping system gracefully...`)
  
  try {
    queueProcessor.stop()
    isStarted = false
    logInfo('Scraping system shut down successfully')
    process.exit(0)
  } catch (error) {
    logError('Error during scraping system shutdown:', error)
    process.exit(1)
  }
}

/**
 * Check if the scraping system is running
 */
export function isScrapingSystemRunning(): boolean {
  return isStarted
}

/**
 * Get scraping system health status
 */
export function getScrapingSystemHealth(): {
  isRunning: boolean
  processor: any
} {
  return {
    isRunning: isStarted,
    processor: isStarted ? queueProcessor.getHealthStatus() : null
  }
}
