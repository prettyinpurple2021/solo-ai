// Mock API responses for static export
export const mockApiResponses = {
  '/api/compliance/policies': {
    success: true,
    policies: [
      { id: 1, name: 'Privacy Policy', status: 'active' },
      { id: 2, name: 'Terms of Service', status: 'active' },
      { id: 3, name: 'Cookie Policy', status: 'draft' }
    ]
  },
  '/api/compliance/history': {
    success: true,
    history: [
      { id: 1, action: 'Policy Generated', timestamp: new Date().toISOString(), status: 'completed' },
      { id: 2, action: 'Compliance Scan', timestamp: new Date().toISOString(), status: 'completed' }
    ]
  },
  '/api/compliance/scan': {
    success: true,
    scanResults: {
      score: 85,
      issues: [],
      recommendations: ['Update privacy policy', 'Review data retention']
    }
  },
  '/api/newsletter': {
    success: true,
    message: 'Newsletter subscription successful!'
  },
  '/api/generate-logo': {
    success: true,
    logoUrl: '/images/placeholder-logo.svg'
  },
  '/api/brand/save': {
    success: true,
    message: 'Brand settings saved successfully'
  },
  '/api/brand/export': {
    success: true,
    downloadUrl: '/brand-export.zip'
  },
  '/api/projects': {
    success: true,
    projects: [
      { id: 1, name: 'Project Alpha', status: 'active' },
      { id: 2, name: 'Project Beta', status: 'completed' }
    ]
  }
}

export const mockFetch = async (url: string, _options?: RequestInit) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const mockResponse = mockApiResponses[url as keyof typeof mockApiResponses]
  
  if (mockResponse) {
    return {
      ok: true,
      json: async () => mockResponse,
      status: 200
    } as Response
  }
  
  // Default error response
  return {
    ok: false,
    json: async () => ({ error: 'API not available in static export' }),
    status: 404
  } as Response
}
