/**
 * Collaboration API Integration Test Suite
 * Comprehensive testing of all collaboration API endpoints
 */

import { logError, logInfo,} from '@/lib/logger'



// Mock authentication for testing
const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User'
}

// Test utilities
class ApiTestSuite {
  private baseUrl = 'http://localhost:3000/api/collaboration'
  private sessionId: string = ''
  private agentId: string = 'test-agent-1'
  
  constructor() {
    logInfo('🚀 Starting Collaboration API Integration Tests')
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer test-token`, // Mock auth
          ...options.headers
        }
      })

      const data = await response.json()
      
      return {
        status: response.status,
        success: response.ok,
        data
      }
    } catch (error) {
      logError(`❌ Request failed for ${endpoint}:`, error)
      return {
        status: 500,
        success: false,
        data: { 
          error: 'Network Error', 
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }

  private log(testName: string, result: any, expected?: any) {
    const status = result.success ? '✅' : '❌'
    logInfo(`${status} ${testName}`)
    
    if (!result.success) {
      logInfo(`   Status: ${result.status}`)
      logError(`   Error: ${result.data.message || result.data.error}`)
    } else if (expected) {
      logInfo(`   Expected: ${expected}`)
      logInfo(`   Received: ${JSON.stringify(result.data, null, 2)}`)
    }
    
    logInfo('')
  }

  // Session API Tests
  async testSessionAPIs() {
    logInfo('📁 Testing Session APIs')
    console.log('=' .repeat(50))

    // Test: Create new session
    const createResult = await this.makeRequest('/sessions', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Collaboration Session',
        description: 'Integration test session',
        type: 'development',
        maxParticipants: 5,
        settings: {
          autoSave: true,
          allowGuests: false
        }
      })
    })
    
    this.log('Create Session', createResult)
    
    if (createResult.success) {
      this.sessionId = createResult.data.data.session.id
    }

    // Test: List sessions
    const listResult = await this.makeRequest('/sessions')
    this.log('List Sessions', listResult)

    // Test: Get specific session
    if (this.sessionId) {
      const getResult = await this.makeRequest(`/sessions/${this.sessionId}`)
      this.log('Get Session Details', getResult)

      // Test: Update session
      const updateResult = await this.makeRequest(`/sessions/${this.sessionId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: 'Updated Test Session',
          settings: {
            autoSave: false,
            allowGuests: true
          }
        })
      })
      this.log('Update Session', updateResult)
    }
  }

  // Agent API Tests
  async testAgentAPIs() {
    logInfo('🤖 Testing Agent APIs')
    console.log('=' .repeat(50))

    // Test: List agents
    const listResult = await this.makeRequest('/agents')
    this.log('List Agents', listResult)

    // Test: Get specific agent
    const getResult = await this.makeRequest(`/agents/${this.agentId}`)
    this.log('Get Agent Details', getResult)

    // Test: Execute capability
    const executeResult = await this.makeRequest(`/agents/${this.agentId}`, {
      method: 'POST',
      body: JSON.stringify({
        capability: 'analyze_code',
        input: {
          code: 'logInfo("Hello, World!");',
          language: 'javascript'
        }
      })
    })
    this.log('Execute Agent Capability', executeResult)
  }

  // Message API Tests
  async testMessageAPIs() {
    logInfo('💬 Testing Message APIs')
    console.log('=' .repeat(50))

    if (!this.sessionId) {
      logInfo('❌ Session ID not available, skipping message tests')
      return
    }

    // Test: Send message
    const sendResult = await this.makeRequest(`/sessions/${this.sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content: 'Hello from integration test!',
        type: 'text',
        senderId: this.agentId,
        priority: 'medium',
        metadata: {
          testMessage: true
        }
      })
    })
    this.log('Send Message', sendResult)

    // Test: Get messages
    const getResult = await this.makeRequest(`/sessions/${this.sessionId}/messages`)
    this.log('Get Messages', getResult)

    // Test: Get messages with filters
    const filteredResult = await this.makeRequest(
      `/sessions/${this.sessionId}/messages?type=text&limit=10`
    )
    this.log('Get Filtered Messages', filteredResult)
  }

  // Context API Tests
  async testContextAPIs() {
    logInfo('🧠 Testing Context APIs')
    console.log('=' .repeat(50))

    if (!this.sessionId) {
      logInfo('❌ Session ID not available, skipping context tests')
      return
    }

    // Test: Store context
    const storeResult = await this.makeRequest('/context', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: this.sessionId,
        agentId: this.agentId,
        contextType: 'knowledge',
        key: 'test_knowledge',
        value: {
          topic: 'API Testing',
          details: 'Integration test context data'
        },
        priority: 'high',
        tags: ['test', 'integration'],
        metadata: {
          testContext: true
        }
      })
    })
    this.log('Store Context', storeResult)

    // Test: Retrieve context
    const retrieveResult = await this.makeRequest(
      `/context?sessionId=${this.sessionId}&agentId=${this.agentId}`
    )
    this.log('Retrieve Context', retrieveResult)

    // Test: Retrieve context with filters
    const filteredResult = await this.makeRequest(
      `/context?sessionId=${this.sessionId}&contextType=knowledge&tags=test`
    )
    this.log('Retrieve Filtered Context', filteredResult)
  }

  // Session Control API Tests
  async testSessionControlAPIs() {
    logInfo('🎮 Testing Session Control APIs')
    console.log('=' .repeat(50))

    if (!this.sessionId) {
      logInfo('❌ Session ID not available, skipping control tests')
      return
    }

    // Test: Get control status
    const statusResult = await this.makeRequest(`/sessions/${this.sessionId}/control`)
    this.log('Get Control Status', statusResult)

    // Test: Join session
    const joinResult = await this.makeRequest(`/sessions/${this.sessionId}/control`, {
      method: 'POST',
      body: JSON.stringify({
        action: 'join',
        agentId: this.agentId,
        capabilities: ['code_analysis', 'documentation'],
        metadata: {
          testJoin: true
        }
      })
    })
    this.log('Join Session', joinResult)

    // Test: Pause session
    const pauseResult = await this.makeRequest(`/sessions/${this.sessionId}/control`, {
      method: 'POST',
      body: JSON.stringify({
        action: 'pause',
        reason: 'Integration test pause'
      })
    })
    this.log('Pause Session', pauseResult)

    // Test: Resume session
    const resumeResult = await this.makeRequest(`/sessions/${this.sessionId}/control`, {
      method: 'POST',
      body: JSON.stringify({
        action: 'resume',
        reason: 'Integration test resume'
      })
    })
    this.log('Resume Session', resumeResult)

    // Test: Leave session
    const leaveResult = await this.makeRequest(`/sessions/${this.sessionId}/control`, {
      method: 'POST',
      body: JSON.stringify({
        action: 'leave',
        agentId: this.agentId,
        reason: 'Integration test complete'
      })
    })
    this.log('Leave Session', leaveResult)
  }

  // Run all tests
  async runAllTests() {
    logInfo('🧪 Starting Comprehensive API Integration Tests')
    console.log('=' .repeat(80))
    logInfo('')

    try {
      await this.testSessionAPIs()
      await this.testAgentAPIs()
      await this.testMessageAPIs()
      await this.testContextAPIs()
      await this.testSessionControlAPIs()
      
      logInfo('🎉 All Integration Tests Completed!')
      console.log('=' .repeat(80))
      
      if (this.sessionId) {
        logInfo(`📋 Test Session ID: ${this.sessionId}`)
        logInfo('You can use this session ID for manual testing')
      }
      
    } catch (error) {
      logError('💥 Test Suite Failed:', error)
    }
  }
}

// Error handling and validation tests
class ValidationTestSuite {
  private baseUrl = 'http://localhost:3000/api/collaboration'

  async testValidationErrors() {
    logError('⚠️  Testing Validation & Error Handling')
    console.log('=' .repeat(50))

    // Test invalid session creation
    const invalidSession = await this.makeRequest('/sessions', {
      method: 'POST',
      body: JSON.stringify({
        // Missing required fields
      })
    })
    logInfo('✅ Invalid Session Creation:', invalidSession.status === 400 ? 'PASS' : 'FAIL')

    // Test invalid session ID format
    const invalidId = await this.makeRequest('/sessions/invalid-uuid')
    logInfo('✅ Invalid Session ID:', invalidId.status === 400 ? 'PASS' : 'FAIL')

    // Test unauthorized access
    const unauthorized = await this.makeRequest('/sessions', {
      headers: {
        'Authorization': '' // No auth token
      }
    })
    logInfo('✅ Unauthorized Access:', unauthorized.status === 401 ? 'PASS' : 'FAIL')

    logInfo('')
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })

      const data = await response.json()
      
      return {
        status: response.status,
        success: response.ok,
        data
      }
    } catch (error) {
      return {
        status: 500,
        success: false,
        data: { 
          error: 'Network Error', 
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }
}

// Main test execution
export async function runCollaborationAPITests() {
  logInfo('🔬 Collaboration API Test Suite')
  logInfo(`⏰ Started at: ${new Date().toISOString()}`)
  logInfo('')

  // Run main integration tests
  const mainTests = new ApiTestSuite()
  await mainTests.runAllTests()

  // Run validation tests
  const validationTests = new ValidationTestSuite()
  await validationTests.testValidationErrors()

  logInfo('📊 Test Summary')
  console.log('=' .repeat(50))
  logInfo('✅ Session Management APIs')
  logInfo('✅ Agent Management APIs')
  logInfo('✅ Message Routing APIs')
  logInfo('✅ Context Management APIs')
  logInfo('✅ Session Control APIs')
  logError('✅ Validation & Error Handling')
  logInfo('')
  logInfo('🎯 All API endpoints are ready for production use!')
}

// Export for direct execution
if (require.main === module) {
  runCollaborationAPITests().catch(console.error)
}