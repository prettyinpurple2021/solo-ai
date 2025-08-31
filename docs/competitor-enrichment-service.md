# Competitor Profile Enrichment Service

The Competitor Profile Enrichment Service automatically enhances competitor profiles by gathering data from public sources and performing intelligent analysis.

## Features

### 1. Company Information Extraction
- Extracts company details from websites and business directories
- Gathers description, industry, headquarters, founding year, and employee count
- Identifies products and services offered

### 2. Social Media Handle Discovery
- Discovers and validates social media profiles across platforms:
  - LinkedIn (company pages and individual profiles)
  - Twitter/X
  - Facebook
  - Instagram
  - YouTube
- Validates URLs using platform-specific patterns

### 3. Key Personnel Identification
- Identifies key executives and team members
- Maps roles and responsibilities
- Discovers LinkedIn profiles and previous company experience
- Focuses on C-level executives and founders

### 4. Threat Level Assessment
- Algorithmic assessment based on multiple factors:
  - Company size (employee count)
  - Funding stage and amount
  - Market overlap with user's business
  - Product portfolio diversity
  - Social media presence
  - Leadership team quality

## API Endpoints

### Individual Competitor Enrichment
```
POST /api/competitors/{id}/enrich
```

**Request Body:**
```json
{
  "userBusinessDomain": "AI-powered business automation software",
  "enableWebScraping": true,
  "enableSocialMediaDiscovery": true,
  "enablePersonnelMapping": true,
  "enableThreatAssessment": true
}
```

**Response:**
```json
{
  "competitor": {
    // Updated competitor profile
  },
  "enrichment": {
    "success": true,
    "confidence": 0.85,
    "sources": ["company_website", "social_media_discovery", "personnel_mapping", "threat_assessment"],
    "warnings": [],
    "fieldsUpdated": ["description", "industry", "socialMediaHandles", "keyPersonnel", "threatLevel"]
  }
}
```

### Check Enrichment Status
```
GET /api/competitors/{id}/enrich
```

**Response:**
```json
{
  "competitorId": 123,
  "competitorName": "TechCorp Solutions",
  "enrichmentStatus": {
    "hasBeenEnriched": true,
    "lastEnrichmentDate": "2024-01-15T10:30:00Z",
    "enrichmentScore": 85,
    "missingFields": ["products"],
    "availableFields": ["socialMediaHandles", "keyPersonnel", "competitiveAdvantages"]
  },
  "recommendations": {
    "shouldEnrich": false,
    "priority": "low",
    "estimatedDuration": "2-5 minutes",
    "benefits": [
      "Automated threat level assessment",
      "Social media handle discovery",
      "Key personnel identification",
      "Competitive advantage analysis"
    ]
  }
}
```

### Batch Enrichment
```
POST /api/competitors/enrich
```

**Request Body:**
```json
{
  "competitorIds": [123, 456, 789],
  "userBusinessDomain": "AI-powered business automation software",
  "enableWebScraping": true,
  "enableSocialMediaDiscovery": true,
  "enablePersonnelMapping": true,
  "enableThreatAssessment": true,
  "continueOnError": true
}
```

**Response:**
```json
{
  "batchId": "batch_1642248600000",
  "summary": {
    "total": 3,
    "processed": 3,
    "successful": 2,
    "failed": 1,
    "successRate": 67
  },
  "results": [
    {
      "competitorId": 123,
      "competitorName": "TechCorp Solutions",
      "success": true,
      "confidence": 0.85,
      "sources": ["company_website", "social_media_discovery"],
      "fieldsUpdated": ["description", "socialMediaHandles"],
      "warnings": []
    }
  ],
  "completedAt": "2024-01-15T10:35:00Z"
}
```

### Enrichment Statistics
```
GET /api/competitors/enrich
```

**Response:**
```json
{
  "statistics": {
    "total": 10,
    "enriched": 7,
    "needsEnrichment": 3,
    "averageEnrichmentScore": 72,
    "lastEnrichmentDate": "2024-01-15T10:30:00Z",
    "recommendations": [
      {
        "competitorId": 456,
        "competitorName": "Startup Rival",
        "priority": "high",
        "reason": "Never been enriched"
      }
    ]
  },
  "batchLimits": {
    "maxCompetitorsPerBatch": 10,
    "rateLimitPerHour": 12,
    "estimatedTimePerCompetitor": "30-60 seconds"
  }
}
```

## Threat Level Assessment Algorithm

The threat level is calculated based on a scoring system:

### Scoring Factors
- **Company Size**: 5-30 points based on employee count
- **Funding Stage**: 10-40 points (seed to IPO)
- **Market Overlap**: 0-20 points based on industry similarity
- **Product Portfolio**: 0-25 points based on number of active products
- **Social Media Presence**: 0-8 points based on platform count
- **Key Personnel**: 0-15 points based on executive team quality

### Threat Level Mapping
- **Critical**: 80+ points
- **High**: 60-79 points
- **Medium**: 30-59 points
- **Low**: 0-29 points

## Automatic Enrichment

When creating a new competitor with a domain, the system automatically triggers background enrichment if:
- Description is missing
- Industry is not specified
- Headquarters is unknown
- Employee count is not provided
- No key personnel are listed
- No social media handles are provided

## Rate Limiting

- Individual enrichment: 5 requests per minute
- Batch enrichment: 2 requests per 5 minutes
- Enrichment status checks: No rate limit

## Data Sources

### Current Implementation (Simulated)
- Mock website scraping with realistic data patterns
- Simulated social media discovery
- Mock personnel identification
- Algorithmic threat assessment

### Production Implementation (Future)
- Web scraping with Puppeteer/Playwright
- Social media APIs (LinkedIn, Twitter, etc.)
- Business directory APIs
- Public company databases
- News and media monitoring

## Configuration Options

```typescript
interface EnrichmentConfig {
  enableWebScraping: boolean          // Extract data from company websites
  enableSocialMediaDiscovery: boolean // Discover social media handles
  enablePersonnelMapping: boolean     // Identify key personnel
  enableThreatAssessment: boolean     // Calculate threat levels
  respectRateLimit: boolean           // Respect API rate limits
  maxRetries: number                  // Maximum retry attempts
}
```

## Error Handling

The service handles errors gracefully:
- **Rate Limiting**: Respects API limits and provides appropriate error messages
- **Invalid URLs**: Validates and filters out invalid social media URLs
- **Network Failures**: Retries with exponential backoff
- **Data Quality**: Validates extracted data before storage
- **Partial Failures**: Continues processing other enrichment types if one fails

## Security and Ethics

- Only collects publicly available information
- Respects robots.txt and website crawling policies
- Implements rate limiting to avoid overwhelming target servers
- Validates and sanitizes all collected data
- Provides transparency about data sources and collection methods

## Usage Examples

### Enrich Single Competitor
```typescript
// Enrich a specific competitor
const response = await fetch('/api/competitors/123/enrich', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userBusinessDomain: 'AI-powered business automation',
    enableThreatAssessment: true
  })
})

const result = await response.json()
console.log(`Enrichment confidence: ${result.enrichment.confidence}`)
```

### Batch Enrich Multiple Competitors
```typescript
// Enrich multiple competitors at once
const response = await fetch('/api/competitors/enrich', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    competitorIds: [123, 456, 789],
    userBusinessDomain: 'AI-powered business automation',
    continueOnError: true
  })
})

const result = await response.json()
console.log(`Success rate: ${result.summary.successRate}%`)
```

### Check Enrichment Status
```typescript
// Check if competitor needs enrichment
const response = await fetch('/api/competitors/123/enrich')
const status = await response.json()

if (status.recommendations.shouldEnrich) {
  console.log(`Priority: ${status.recommendations.priority}`)
  console.log(`Estimated duration: ${status.recommendations.estimatedDuration}`)
}
```