#!/usr/bin/env node

/**
 * SoloBoss AI Platform - API Testing Script
 * 
 * This script tests all API endpoints to ensure they are functioning correctly.
 */

const fetch = require('node-fetch');
const fs = require('fs');

class APITesting {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    this.testResults = [];
    this.authToken = null;
  }

  /**
   * API Endpoints to Test
   */
  static ENDPOINTS = [
    // Health Checks
    {
      name: 'Health Check',
      method: 'GET',
      path: '/api/health',
      auth: false,
      expectedStatus: 200,
      priority: 'CRITICAL'
    },
    {
      name: 'Dependencies Health Check',
      method: 'GET',
      path: '/api/health/deps',
      auth: false,
      expectedStatus: 200,
      priority: 'HIGH'
    },

    // Authentication Endpoints
    {
      name: 'User Authentication',
      method: 'GET',
      path: '/api/auth/user',
      auth: true,
      expectedStatus: 200,
      priority: 'CRITICAL'
    },

    // Dashboard Endpoints
    {
      name: 'Dashboard Data',
      method: 'GET',
      path: '/api/dashboard',
      auth: true,
      expectedStatus: 200,
      priority: 'CRITICAL'
    },

    // Task Management
    {
      name: 'Get Tasks',
      method: 'GET',
      path: '/api/tasks',
      auth: true,
      expectedStatus: 200,
      priority: 'CRITICAL'
    },
    {
      name: 'Create Task',
      method: 'POST',
      path: '/api/tasks',
      auth: true,
      expectedStatus: 201,
      priority: 'CRITICAL',
      body: {
        title: 'Test Task',
        description: 'Test task description',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(Date.now() + 86400000).toISOString()
      }
    },

    // Goal Management
    {
      name: 'Get Goals',
      method: 'GET',
      path: '/api/goals',
      auth: true,
      expectedStatus: 200,
      priority: 'HIGH'
    },

    // File Management
    {
      name: 'Get Files',
      method: 'GET',
      path: '/api/briefcase',
      auth: true,
      expectedStatus: 200,
      priority: 'HIGH'
    },

    // Templates
    {
      name: 'Get Templates',
      method: 'GET',
      path: '/api/templates',
      auth: true,
      expectedStatus: 200,
      priority: 'MEDIUM'
    },

    // Profile
    {
      name: 'Get Profile',
      method: 'GET',
      path: '/api/profile',
      auth: true,
      expectedStatus: 200,
      priority: 'HIGH'
    },

    // Chat/AI Agents
    {
      name: 'Chat Endpoint',
      method: 'POST',
      path: '/api/chat',
      auth: true,
      expectedStatus: 200,
      priority: 'CRITICAL',
      body: {
        message: 'Hello, this is a test message',
        agent: 'general'
      }
    },

    // Integrations
    {
      name: 'Integrations Status',
      method: 'GET',
      path: '/api/integrations/status',
      auth: true,
      expectedStatus: 200,
      priority: 'HIGH'
    }
  ];

  /**
   * Run all API tests
   */
  async runAllTests() {
    console.log('🚀 Starting SoloBoss AI Platform API Testing...\n');
    console.log(`🌐 Base URL: ${this.baseUrl}\n`);

    const totalTests = APITesting.ENDPOINTS.length;
    console.log(`📊 Total API Tests: ${totalTests}\n`);

    for (let i = 0; i < APITesting.ENDPOINTS.length; i++) {
      const endpoint = APITesting.ENDPOINTS[i];
      await this.testEndpoint(endpoint, i + 1, totalTests);
    }

    this.generateReport();
  }

  /**
   * Test individual endpoint
   */
  async testEndpoint(endpoint, current, total) {
    console.log(`🔍 Test ${current}/${total}: ${endpoint.name}`);
    console.log(`📋 Method: ${endpoint.method} ${endpoint.path}`);
    console.log(`⚡ Priority: ${endpoint.priority}`);

    try {
      const result = await this.makeRequest(endpoint);
      
      this.testResults.push({
        ...endpoint,
        result,
        timestamp: new Date().toISOString()
      });

      if (result.success) {
        console.log(`✅ Status: ${result.status} - PASSED`);
        if (result.responseTime) {
          console.log(`⏱️  Response Time: ${result.responseTime}ms`);
        }
      } else {
        console.log(`❌ Status: ${result.status} - FAILED`);
        console.log(`📝 Error: ${result.error}`);
      }

    } catch (error) {
      console.log(`❌ Exception: ${error.message}`);
      this.testResults.push({
        ...endpoint,
        result: {
          success: false,
          status: 0,
          error: error.message
        },
        timestamp: new Date().toISOString()
      });
    }

    console.log('');
  }

  /**
   * Make HTTP request to endpoint
   */
  async makeRequest(endpoint) {
    const startTime = Date.now();
    const url = `${this.baseUrl}${endpoint.path}`;
    
    const options = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Add authentication if required
    if (endpoint.auth) {
      if (!this.authToken) {
        // For testing purposes, we'll skip auth-required endpoints if no token
        return {
          success: false,
          status: 401,
          error: 'Authentication required but no token available',
          responseTime: Date.now() - startTime
        };
      }
      options.headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Add body if provided
    if (endpoint.body) {
      options.body = JSON.stringify(endpoint.body);
    }

    try {
      const response = await fetch(url, options);
      const responseTime = Date.now() - startTime;
      
      let data;
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }

      const success = response.status === endpoint.expectedStatus;

      return {
        success,
        status: response.status,
        data,
        responseTime,
        error: success ? null : `Expected ${endpoint.expectedStatus}, got ${response.status}`
      };

    } catch (error) {
      return {
        success: false,
        status: 0,
        error: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Generate test report
   */
  generateReport() {
    console.log('📊 API TESTING REPORT');
    console.log('====================\n');

    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.result.success).length;
    const failed = this.testResults.filter(r => !r.result.success).length;
    const passRate = (passed / total * 100).toFixed(1);

    console.log(`✅ Tests Passed: ${passed}`);
    console.log(`❌ Tests Failed: ${failed}`);
    console.log(`📈 Pass Rate: ${passRate}%\n`);

    // Group by priority
    const byPriority = {
      CRITICAL: [],
      HIGH: [],
      MEDIUM: [],
      LOW: []
    };

    this.testResults.forEach(result => {
      byPriority[result.priority].push(result);
    });

    console.log('📋 Results by Priority:');
    console.log('========================\n');

    Object.entries(byPriority).forEach(([priority, tests]) => {
      if (tests.length === 0) return;
      
      const passed = tests.filter(t => t.result.success).length;
      const total = tests.length;
      
      console.log(`${priority}:`);
      console.log(`  ✅ ${passed}/${total} tests passed`);
      
      const failedTests = tests.filter(t => !t.result.success);
      if (failedTests.length > 0) {
        console.log(`  ❌ Failed tests:`);
        failedTests.forEach(test => {
          console.log(`    - ${test.name}: ${test.result.error}`);
        });
      }
      console.log('');
    });

    // Performance analysis
    this.analyzePerformance();

    // Generate recommendations
    this.generateRecommendations();
  }

  /**
   * Analyze API performance
   */
  analyzePerformance() {
    const responseTimes = this.testResults
      .filter(r => r.result.responseTime)
      .map(r => r.result.responseTime);

    if (responseTimes.length === 0) return;

    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);

    console.log('⚡ Performance Analysis:');
    console.log('=======================\n');
    console.log(`📊 Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`🚀 Fastest Response: ${minResponseTime}ms`);
    console.log(`🐌 Slowest Response: ${maxResponseTime}ms`);

    const slowEndpoints = this.testResults.filter(r => r.result.responseTime > 2000);
    if (slowEndpoints.length > 0) {
      console.log(`⚠️  Slow Endpoints (>2s):`);
      slowEndpoints.forEach(endpoint => {
        console.log(`  - ${endpoint.name}: ${endpoint.result.responseTime}ms`);
      });
    }
    console.log('');
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    console.log('💡 RECOMMENDATIONS:');
    console.log('===================\n');

    const failedTests = this.testResults.filter(r => !r.result.success);
    
    if (failedTests.length === 0) {
      console.log('🎉 All API tests passed! The API is ready for production.');
      return;
    }

    const criticalFailures = failedTests.filter(t => t.priority === 'CRITICAL');
    const highFailures = failedTests.filter(t => t.priority === 'HIGH');

    if (criticalFailures.length > 0) {
      console.log('🚨 CRITICAL API ISSUES MUST BE FIXED:');
      criticalFailures.forEach(test => {
        console.log(`  - ${test.name}: ${test.result.error}`);
      });
      console.log('');
    }

    if (highFailures.length > 0) {
      console.log('⚠️  HIGH PRIORITY API ISSUES SHOULD BE ADDRESSED:');
      highFailures.forEach(test => {
        console.log(`  - ${test.name}: ${test.result.error}`);
      });
      console.log('');
    }

    console.log('📋 API NEXT STEPS:');
    console.log('  1. Fix critical API issues');
    console.log('  2. Address high priority issues');
    console.log('  3. Optimize slow endpoints');
    console.log('  4. Add rate limiting if needed');
    console.log('  5. Implement proper error handling');
  }

  /**
   * Save test results to file
   */
  saveResults() {
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      totalTests: this.testResults.length,
      passed: this.testResults.filter(r => r.result.success).length,
      failed: this.testResults.filter(r => !r.result.success).length,
      results: this.testResults
    };

    const filename = `api-test-results-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`\n💾 API test results saved to: ${filename}`);
  }
}

// Run the API testing
if (require.main === module) {
  const apiTesting = new APITesting();
  apiTesting.runAllTests()
    .then(() => {
      apiTesting.saveResults();
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ API testing failed:', error);
      process.exit(1);
    });
}

module.exports = APITesting;
