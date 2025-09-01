import { queueProcessor } from './scraping-queue-processor'

let isStarted = false

/**
 * Initialize the scraping queue processor
 * This should be called when the application starts
 */
export async function initializeScrapingSystem(): Promise<void> {
  if (isStarted) {
    console.log('Scraping system already initialized')
    return
  }

  try {
    console.log('Initializing scraping system...')
    
    // Start the queue processor
    await queueProcessor.start()
    
    isStarted = true
    console.log('Scraping system initialized successfully')
    
    // Handle graceful shutdown
    process.on('SIGTERM', gracefulShutdown)
    process.on('SIGINT', gracefulShutdown)
    
  } catch (error) {
    console.error('Failed to initialize scraping system:', error)
    throw error
  }
}

/**
 * Graceful shutdown of the scraping system
 */
function gracefulShutdown(signal: string): void {
  console.log(`Received ${signal}, shutting down scraping system gracefully...`)
  
  try {
    queueProcessor.stop()
    isStarted = false
    console.log('Scraping system shut down successfully')
    process.exit(0)
  } catch (error) {
    console.error('Error during scraping system shutdown:', error)
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