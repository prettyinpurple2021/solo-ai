# Scraping Scheduler and Queue System

## Overview

The Scraping Scheduler and Queue System is a comprehensive background job processing system designed to monitor competitor websites, social media, and other data sources at scheduled intervals. It provides intelligent scheduling, retry mechanisms, and performance monitoring for competitive intelligence gathering.

## Architecture

### Core Components

1. **ScrapingScheduler** (`lib/database-scraping-scheduler.ts`)
   - Manages individual scraping jobs
   - Handles job scheduling and execution
   - Implements retry logic with exponential backoff
   - Stores results and intelligence data

2. **ScrapingQueueProcessor** (`lib/scraping-queue-processor.ts`)
   - Processes job queues with concurrency limits
   - Creates default monitoring jobs for competitors
   - Manages job frequencies based on threat levels
   - Provides health monitoring and statistics

3. **Database Schema**
   - `scraping_jobs`: Stores job definitions and scheduling information
   - `scraping_job_results`: Stores execution results and performance metrics

### Job Types

- **website**: Monitor main website changes
- **pricing**: Track pricing page updates
- **products**: Monitor product/feature changes
- **jobs**: Track job postings and hiring patterns
- **social**: Monitor social media activity

### Frequency Types

- **interval**: Run every X minutes
- **cron**: Use cron expressions for complex scheduling
- **manual**: One-time or manually triggered jobs

## API Endpoints

### Job Management

```typescript
// Get scraping statistics
GET /api/competitors/scraping

// Create a new scraping job
POST /api/competitors/scraping
{
  "competitorId": 1,
  "jobType": "website",
  "url": "https://example.com",
  "priority": "medium",
  "frequencyType": "interval",
  "frequencyValue": "360",
  "config": {
    "changeDetection": {
      "enabled": true,
      "threshold": 5
    }
  }
}

// Get jobs for a specific competitor
GET /api/competitors/[id]/scraping

// Create default monitoring jobs
POST /api/competitors/[id]/scraping
{
  "domain": "example.com",
  "socialMediaHandles": {
    "linkedin": "https://linkedin.com/company/example",
    "twitter": "https://twitter.com/example"
  }
}

// Update job frequencies based on threat level
PUT /api/competitors/[id]/scraping
{
  "threatLevel": "high"
}

// Delete all jobs for a competitor
DELETE /api/competitors/[id]/scraping
```

### Individual Job Management

```typescript
// Get job details and results
GET /api/competitors/scraping/[jobId]

// Pause or resume a job
PATCH /api/competitors/scraping/[jobId]
{
  "action": "pause" // or "resume"
}

// Delete a job
DELETE /api/competitors/scraping/[jobId]
```

### Health Monitoring

```typescript
// Get system health status
GET /api/competitors/scraping/health

// Restart the scraping system
POST /api/competitors/scraping/health
{
  "action": "restart"
}
```

## Usage Examples

### Creating a Basic Website Monitor

```typescript
import { queueProcessor } from '@/lib/scraping-queue-processor'

const jobId = await queueProcessor.addJob({
  competitorId: 1,
  userId: 'user123',
  jobType: 'website',
  url: 'https://competitor.com',
  priority: 'medium',
  frequencyType: 'interval',
  frequencyValue: '360', // 6 hours
  config: {
    changeDetection: {
      enabled: true,
      threshold: 5 // 5% change threshold
    },
    respectRobotsTxt: true
  }
})
```

### Setting Up Default Monitoring

```typescript
const jobIds = await queueProcessor.createDefaultJobs(
  competitorId,
  userId,
  {
    domain: 'competitor.com',
    socialMediaHandles: {
      linkedin: 'https://linkedin.com/company/competitor',
      twitter: 'https://twitter.com/competitor'
    }
  }
)
```

### Adjusting Monitoring Frequency

```typescript
// Increase monitoring frequency for high-threat competitors
await queueProcessor.updateJobFrequencies(
  competitorId,
  userId,
  'high' // Doubles the monitoring frequency
)
```

## Configuration Options

### Job Configuration

```typescript
interface ScrapingJobConfig {
  changeDetection?: {
    enabled: boolean
    threshold: number // percentage change to trigger alert
    ignoreSelectors?: string[] // CSS selectors to ignore
  }
  selectors?: {
    content?: string[] // CSS selectors for content extraction
    pricing?: string[] // CSS selectors for pricing data
    products?: string[] // CSS selectors for product information
  }
  headers?: Record<string, string> // Custom HTTP headers
  timeout?: number // Request timeout in milliseconds
  retryDelay?: number // Custom retry delay
  respectRobotsTxt?: boolean // Whether to respect robots.txt
}
```

### Priority Levels

- **critical**: Highest priority, most frequent monitoring
- **high**: High priority, increased frequency
- **medium**: Normal priority, standard frequency
- **low**: Lower priority, reduced frequency

### Threat Level Impact on Frequency

- **critical**: 4x more frequent monitoring
- **high**: 2x more frequent monitoring
- **medium**: Standard frequency
- **low**: 0.5x frequency (half as often)

## Performance Considerations

### Concurrency Limits

- Maximum 5 concurrent scraping jobs
- Jobs are processed in chunks to prevent system overload
- Priority-based job ordering

### Retry Logic

- Exponential backoff: 2^retryCount minutes (max 60 minutes)
- Jitter added to prevent thundering herd problems
- Maximum 3 retry attempts per job

### Resource Management

- Connection pooling for database operations
- Timeout handling for long-running scrapes
- Memory-efficient processing of large datasets

## Monitoring and Debugging

### Health Checks

```typescript
// Get system health
const health = queueProcessor.getHealthStatus()
console.log(health)
// {
//   isRunning: true,
//   processingInterval: 30000,
//   maxConcurrentJobs: 5,
//   uptime: 3600
// }
```

### Queue Statistics

```typescript
// Get queue statistics
const stats = await queueProcessor.getQueueStats()
console.log(stats)
// {
//   total: 25,
//   pending: 5,
//   running: 2,
//   completed: 15,
//   failed: 2,
//   paused: 1
// }
```

### Job Results

Each job execution creates a result record with:
- Success/failure status
- Execution time
- Changes detected
- Error messages (if failed)
- Retry count

## Error Handling

### Common Error Scenarios

1. **Rate Limiting**: Automatic retry with exponential backoff
2. **Network Timeouts**: Configurable timeout with retry
3. **Website Blocking**: Respect robots.txt and implement delays
4. **Invalid URLs**: Validation before job creation
5. **Database Errors**: Transaction rollback and error logging

### Graceful Degradation

- Failed jobs are retried up to maximum attempts
- System continues processing other jobs if some fail
- Health monitoring alerts for system-wide issues
- Automatic cleanup of expired job results

## Security Considerations

### Ethical Scraping

- Respects robots.txt by default
- Implements rate limiting to avoid overloading target sites
- Only collects publicly available information
- Configurable delays between requests

### Data Protection

- User authentication required for all operations
- Jobs are isolated by user ID
- Sensitive data is encrypted in storage
- Automatic data expiration for compliance

## Deployment

### Initialization

```typescript
import { initializeScrapingSystem } from '@/lib/scraping-startup'

// Start the scraping system when your app starts
await initializeScrapingSystem()
```

### Environment Variables

No additional environment variables required - uses existing database configuration.

### Monitoring

- Health check endpoint for load balancer integration
- Metrics collection for performance monitoring
- Error logging for debugging and alerting

## Testing

Run the test suite:

```bash
npm test lib/__tests__/scraping-scheduler.test.ts
```

The test suite covers:
- Job creation and scheduling
- Retry logic and error handling
- Queue processing and concurrency
- Health monitoring and statistics
- Configuration validation