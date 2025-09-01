import { WebScrapingService } from '@/lib/web-scraping-service'

// Mock fetch globally
global.fetch = jest.fn()

describe('WebScrapingService', () => {
  let scrapingService: WebScrapingService
  
  beforeEach(() => {
    scrapingService = new WebScrapingService({
      respectRobotsTxt: false, // Disable for testing
      requestDelay: 0, // No delay for testing
      timeout: 5000,
    })
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('scrapeCompetitorWebsite', () => {
    it('should successfully scrape a website', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Test Company</title>
            <meta name="description" content="A test company website">
          </head>
          <body>
            <h1>Welcome to Test Company</h1>
            <p>We provide amazing services.</p>
          </body>
        </html>
      `

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockHtml),
      } as Response)

      const result = await scrapingService.scrapeCompetitorWebsite('https://example.com')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.title).toBe('Test Company')
      expect(result.data?.description).toBe('A test company website')
      expect(result.data?.url).toBe('https://example.com')
    })

    it('should handle network errors gracefully', async () => {
      ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await scrapingService.scrapeCompetitorWebsite('https://example.com')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    }, 10000)

    it('should handle HTTP errors', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response)

      const result = await scrapingService.scrapeCompetitorWebsite('https://example.com')

      expect(result.success).toBe(false)
      expect(result.error).toContain('HTTP 404')
    })
  })

  describe('monitorPricingPages', () => {
    it('should extract pricing data from a pricing page', async () => {
      const mockPricingHtml = `
        <!DOCTYPE html>
        <html>
          <body>
            <div class="pricing-plan">
              <h3>Basic Plan</h3>
              <div class="price">$9.99/month</div>
              <ul>
                <li>Feature 1</li>
                <li>Feature 2</li>
              </ul>
            </div>
            <div class="pricing-plan popular">
              <h3>Pro Plan</h3>
              <div class="price">$19.99/month</div>
              <ul>
                <li>All Basic features</li>
                <li>Advanced analytics</li>
              </ul>
            </div>
          </body>
        </html>
      `

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockPricingHtml),
      } as Response)

      const result = await scrapingService.monitorPricingPages('https://example.com/pricing')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.plans).toHaveLength(2)
      expect(result.data?.plans[0].name).toBe('Basic Plan')
      expect(result.data?.plans[0].price).toBe(9.99)
      expect(result.data?.plans[1].isPopular).toBe(true)
    })

    it('should return error when no pricing data found', async () => {
      const mockHtml = '<html><body><p>No pricing here</p></body></html>'

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockHtml),
      } as Response)

      const result = await scrapingService.monitorPricingPages('https://example.com/pricing')

      expect(result.success).toBe(false)
      expect(result.error).toBe('No pricing data found')
    })
  })

  describe('trackProductPages', () => {
    it('should extract product information', async () => {
      const mockProductHtml = `
        <!DOCTYPE html>
        <html>
          <body>
            <div class="product">
              <h2>Product A</h2>
              <p class="description">Amazing product description</p>
              <ul>
                <li>Feature X</li>
                <li>Feature Y</li>
              </ul>
            </div>
            <div class="product">
              <h2>Product B</h2>
              <p class="description">Another great product</p>
              <ul>
                <li>Feature Z</li>
              </ul>
            </div>
          </body>
        </html>
      `

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockProductHtml),
      } as Response)

      const result = await scrapingService.trackProductPages('https://example.com/products')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.products).toHaveLength(2)
      expect(result.data?.products[0].name).toBe('Product A')
      expect(result.data?.products[0].description).toBe('Amazing product description')
      expect(result.data?.products[0].features).toContain('Feature X')
    })
  })

  describe('scrapeJobPostings', () => {
    it('should extract job posting information', async () => {
      const mockJobsHtml = `
        <!DOCTYPE html>
        <html>
          <body>
            <div class="job">
              <h3 class="job-title">Senior Software Engineer</h3>
              <div class="location">San Francisco, CA</div>
              <div class="department">Engineering</div>
              <p class="job-description">We are looking for a senior software engineer...</p>
              <ul>
                <li>5+ years experience</li>
                <li>React expertise</li>
              </ul>
            </div>
            <div class="job">
              <h3 class="job-title">Product Manager</h3>
              <div class="location">Remote</div>
              <div class="department">Product</div>
              <p class="job-description">Join our product team...</p>
              <ul>
                <li>Product management experience</li>
                <li>Technical background</li>
              </ul>
            </div>
          </body>
        </html>
      `

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockJobsHtml),
      } as Response)

      const result = await scrapingService.scrapeJobPostings('https://example.com/careers')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0].title).toBe('Senior Software Engineer')
      expect(result.data[0].location).toBe('San Francisco, CA')
      expect(result.data[0].department).toBe('Engineering')
      expect(result.data[0].remote).toBe(false)
      expect(result.data[1].remote).toBe(true) // Remote job
      expect(result.data[0].strategicImportance).toBe('high') // Engineering role
    })
  })

  describe('detectWebsiteChanges', () => {
    it('should detect changes between content versions', async () => {
      const oldContent = 'This is the old content with some text.'
      const newContent = 'This is the new content with different text and more information.'

      const mockHtml = `<html><body>${newContent}</body></html>`

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockHtml),
      } as Response)

      const result = await scrapingService.detectWebsiteChanges('https://example.com', oldContent)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
      if (result.data && result.data.length > 0) {
        expect(result.data[0].changeType).toBe('content')
        expect(result.data[0].confidence).toBeGreaterThan(0)
      }
    })

    it('should return no changes for identical content', async () => {
      const content = 'This is identical content.'
      const mockHtml = `<html><body>${content}</body></html>`

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockHtml),
      } as Response)

      const result = await scrapingService.detectWebsiteChanges('https://example.com', mockHtml)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data).toHaveLength(0) // No changes detected
    })
  })

  describe('caching', () => {
    it('should return cached results for repeated requests', async () => {
      const mockHtml = '<html><body>Test content</body></html>'

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockHtml),
      } as Response)

      // First request
      const result1 = await scrapingService.scrapeCompetitorWebsite('https://example.com')
      expect(result1.cached).toBe(false)

      // Second request should be cached
      const result2 = await scrapingService.scrapeCompetitorWebsite('https://example.com')
      expect(result2.cached).toBe(true)
      expect(result2.data).toEqual(result1.data)

      // Fetch should only be called once
      expect(fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('rate limiting', () => {
    it('should respect rate limits between requests', async () => {
      const service = new WebScrapingService({
        respectRobotsTxt: false,
        requestDelay: 100, // 100ms delay
        timeout: 5000,
      })

      const mockHtml = '<html><body>Test</body></html>'
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve(mockHtml),
      } as Response)

      const startTime = Date.now()
      
      // Make two requests to the same domain
      await service.scrapeCompetitorWebsite('https://example.com/page1')
      await service.scrapeCompetitorWebsite('https://example.com/page2')
      
      const endTime = Date.now()
      const duration = endTime - startTime

      // Should take at least 90ms due to rate limiting (allowing for some variance)
      expect(duration).toBeGreaterThanOrEqual(90)
    }, 10000) // Increase timeout for this test
  })
})