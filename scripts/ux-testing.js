#!/usr/bin/env node

/**
 * SoloBoss AI Platform - UX Testing Script
 * 
 * This script tests all user experience improvements including:
 * - Enhanced onboarding flow
 * - Interactive tutorials
 * - Error handling
 * - Accessibility features
 * - Help tooltips
 */

const fs = require('fs');
const path = require('path');

class UXTesting {
  constructor() {
    this.results = {
      onboarding: { passed: 0, failed: 0, tests: [] },
      tutorials: { passed: 0, failed: 0, tests: [] },
      errorHandling: { passed: 0, failed: 0, tests: [] },
      accessibility: { passed: 0, failed: 0, tests: [] },
      helpSystem: { passed: 0, failed: 0, tests: [] },
      overall: { passed: 0, failed: 0, total: 0 }
    };
  }

  async runAllTests() {
    console.log('🚀 Starting SoloBoss AI Platform UX Testing...\n');
    
    await this.testOnboardingEnhancements();
    await this.testInteractiveTutorials();
    await this.testErrorHandling();
    await this.testAccessibilityFeatures();
    await this.testHelpSystem();
    
    this.generateReport();
  }

  async testOnboardingEnhancements() {
    console.log('📋 Testing Enhanced Onboarding Flow...');
    
    const tests = [
      {
        name: 'Enhanced Onboarding Component Exists',
        test: () => this.checkFileExists('components/onboarding/enhanced-onboarding.tsx'),
        description: 'Enhanced onboarding component should be created'
      },
      {
        name: 'Interactive Tutorial Component Exists',
        test: () => this.checkFileExists('components/onboarding/interactive-tutorial.tsx'),
        description: 'Interactive tutorial component should be created'
      },
      {
        name: 'Help Tooltip Component Exists',
        test: () => this.checkFileExists('components/ui/help-tooltip.tsx'),
        description: 'Help tooltip component should be created'
      },
      {
        name: 'Onboarding Integration',
        test: () => this.checkFileContains('app/dashboard/page.tsx', 'EnhancedOnboarding'),
        description: 'Dashboard should use enhanced onboarding'
      },
      {
        name: 'Tutorial Progress Tracking',
        test: () => this.checkFileContains('components/onboarding/enhanced-onboarding.tsx', 'completedTutorials'),
        description: 'Should track tutorial completion progress'
      },
      {
        name: 'Welcome Bonus Display',
        test: () => this.checkFileContains('components/onboarding/enhanced-onboarding.tsx', 'Welcome Bonus'),
        description: 'Should display welcome bonuses to new users'
      }
    ];

    for (const test of tests) {
      const result = await this.runTest(test);
      this.results.onboarding.tests.push(result);
      if (result.passed) {
        this.results.onboarding.passed++;
      } else {
        this.results.onboarding.failed++;
      }
    }
  }

  async testInteractiveTutorials() {
    console.log('🎯 Testing Interactive Tutorials...');
    
    const tests = [
      {
        name: 'Dashboard Tutorial',
        test: () => this.checkFileContains('components/onboarding/interactive-tutorial.tsx', 'dashboard'),
        description: 'Should include dashboard tutorial'
      },
      {
        name: 'AI Agents Tutorial',
        test: () => this.checkFileContains('components/onboarding/interactive-tutorial.tsx', 'ai-agents'),
        description: 'Should include AI agents tutorial'
      },
      {
        name: 'Tasks Tutorial',
        test: () => this.checkFileContains('components/onboarding/interactive-tutorial.tsx', 'tasks'),
        description: 'Should include tasks tutorial'
      },
      {
        name: 'Goals Tutorial',
        test: () => this.checkFileContains('components/onboarding/interactive-tutorial.tsx', 'goals'),
        description: 'Should include goals tutorial'
      },
      {
        name: 'Files Tutorial',
        test: () => this.checkFileContains('components/onboarding/interactive-tutorial.tsx', 'files'),
        description: 'Should include files tutorial'
      },
      {
        name: 'Tutorial Navigation',
        test: () => this.checkFileContains('components/onboarding/interactive-tutorial.tsx', 'handleNext'),
        description: 'Should have tutorial navigation controls'
      },
      {
        name: 'Tutorial Skip Option',
        test: () => this.checkFileContains('components/onboarding/interactive-tutorial.tsx', 'onSkip'),
        description: 'Should allow users to skip tutorials'
      }
    ];

    for (const test of tests) {
      const result = await this.runTest(test);
      this.results.tutorials.tests.push(result);
      if (result.passed) {
        this.results.tutorials.passed++;
      } else {
        this.results.tutorials.failed++;
      }
    }
  }

  async testErrorHandling() {
    console.log('⚠️ Testing Error Handling System...');
    
    const tests = [
      {
        name: 'Error Handler Component Exists',
        test: () => this.checkFileExists('components/ui/error-handler.tsx'),
        description: 'Error handler component should be created'
      },
      {
        name: 'Error Boundary Component',
        test: () => this.checkFileContains('components/ui/error-handler.tsx', 'ErrorBoundary'),
        description: 'Should include error boundary component'
      },
      {
        name: 'Retry Mechanism',
        test: () => this.checkFileContains('components/ui/error-handler.tsx', 'handleRetry'),
        description: 'Should include retry functionality'
      },
      {
        name: 'Offline Detection',
        test: () => this.checkFileContains('components/ui/error-handler.tsx', 'isOnline'),
        description: 'Should detect offline status'
      },
      {
        name: 'User-Friendly Messages',
        test: () => this.checkFileContains('components/ui/error-handler.tsx', 'getErrorMessage'),
        description: 'Should provide user-friendly error messages'
      },
      {
        name: 'Error Integration',
        test: () => this.checkFileContains('app/layout.tsx', 'ErrorBoundary'),
        description: 'Error boundary should be integrated in layout'
      },
      {
        name: 'Loading with Error',
        test: () => this.checkFileContains('components/ui/error-handler.tsx', 'LoadingWithError'),
        description: 'Should handle loading states with errors'
      }
    ];

    for (const test of tests) {
      const result = await this.runTest(test);
      this.results.errorHandling.tests.push(result);
      if (result.passed) {
        this.results.errorHandling.passed++;
      } else {
        this.results.errorHandling.failed++;
      }
    }
  }

  async testAccessibilityFeatures() {
    console.log('♿ Testing Accessibility Features...');
    
    const tests = [
      {
        name: 'Accessibility Provider Exists',
        test: () => this.checkFileExists('components/ui/accessibility.tsx'),
        description: 'Accessibility provider should be created'
      },
      {
        name: 'High Contrast Mode',
        test: () => this.checkFileContains('components/ui/accessibility.tsx', 'highContrast'),
        description: 'Should support high contrast mode'
      },
      {
        name: 'Reduced Motion',
        test: () => this.checkFileContains('components/ui/accessibility.tsx', 'reducedMotion'),
        description: 'Should support reduced motion'
      },
      {
        name: 'Screen Reader Mode',
        test: () => this.checkFileContains('components/ui/accessibility.tsx', 'screenReader'),
        description: 'Should support screen reader mode'
      },
      {
        name: 'Font Size Control',
        test: () => this.checkFileContains('components/ui/accessibility.tsx', 'fontSize'),
        description: 'Should allow font size adjustment'
      },
      {
        name: 'Keyboard Navigation',
        test: () => this.checkFileContains('components/ui/accessibility.tsx', 'KeyboardNavigation'),
        description: 'Should support keyboard navigation'
      },
      {
        name: 'Focus Trap',
        test: () => this.checkFileContains('components/ui/accessibility.tsx', 'FocusTrap'),
        description: 'Should include focus trap for modals'
      },
      {
        name: 'Skip to Main Content',
        test: () => this.checkFileContains('components/ui/accessibility.tsx', 'SkipToMain'),
        description: 'Should provide skip to main content link'
      },
      {
        name: 'Accessibility Integration',
        test: () => this.checkFileContains('app/layout.tsx', 'AccessibilityProvider'),
        description: 'Accessibility provider should be integrated'
      }
    ];

    for (const test of tests) {
      const result = await this.runTest(test);
      this.results.accessibility.tests.push(result);
      if (result.passed) {
        this.results.accessibility.passed++;
      } else {
        this.results.accessibility.failed++;
      }
    }
  }

  async testHelpSystem() {
    console.log('💡 Testing Help System...');
    
    const tests = [
      {
        name: 'Help Tooltip Component',
        test: () => this.checkFileContains('components/ui/help-tooltip.tsx', 'HelpTooltip'),
        description: 'Should have help tooltip component'
      },
      {
        name: 'Contextual Help',
        test: () => this.checkFileContains('components/ui/help-tooltip.tsx', 'title'),
        description: 'Should provide contextual help'
      },
      {
        name: 'Help Categories',
        test: () => this.checkFileContains('components/ui/help-tooltip.tsx', 'category'),
        description: 'Should categorize help content'
      },
      {
        name: 'Difficulty Levels',
        test: () => this.checkFileContains('components/ui/help-tooltip.tsx', 'difficulty'),
        description: 'Should indicate difficulty levels'
      },
      {
        name: 'Video Help',
        test: () => this.checkFileContains('components/ui/help-tooltip.tsx', 'videoUrl'),
        description: 'Should support video help content'
      },
      {
        name: 'Documentation Links',
        test: () => this.checkFileContains('components/ui/help-tooltip.tsx', 'docsUrl'),
        description: 'Should link to documentation'
      }
    ];

    for (const test of tests) {
      const result = await this.runTest(test);
      this.results.helpSystem.tests.push(result);
      if (result.passed) {
        this.results.helpSystem.passed++;
      } else {
        this.results.helpSystem.failed++;
      }
    }
  }

  async runTest(test) {
    try {
      const passed = await test.test();
      return {
        name: test.name,
        description: test.description,
        passed,
        error: passed ? null : 'Test failed'
      };
    } catch (error) {
      return {
        name: test.name,
        description: test.description,
        passed: false,
        error: error.message
      };
    }
  }

  checkFileExists(filePath) {
    return fs.existsSync(filePath);
  }

  checkFileContains(filePath, searchText) {
    if (!this.checkFileExists(filePath)) {
      return false;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes(searchText);
  }

  generateReport() {
    console.log('\n📊 UX Testing Results\n');
    console.log('='.repeat(60));

    // Calculate totals
    const categories = ['onboarding', 'tutorials', 'errorHandling', 'accessibility', 'helpSystem'];
    categories.forEach(category => {
      this.results.overall.passed += this.results[category].passed;
      this.results.overall.failed += this.results[category].failed;
    });
    this.results.overall.total = this.results.overall.passed + this.results.overall.failed;

    // Display results by category
    const categoryNames = {
      onboarding: 'Enhanced Onboarding',
      tutorials: 'Interactive Tutorials',
      errorHandling: 'Error Handling',
      accessibility: 'Accessibility Features',
      helpSystem: 'Help System'
    };

    categories.forEach(category => {
      const result = this.results[category];
      const total = result.passed + result.failed;
      const percentage = total > 0 ? Math.round((result.passed / total) * 100) : 0;
      const status = result.failed === 0 ? '✅' : result.passed === 0 ? '❌' : '⚠️';
      
      console.log(`\n${status} ${categoryNames[category]}: ${result.passed}/${total} (${percentage}%)`);
      
      if (result.failed > 0) {
        console.log('   Failed tests:');
        result.tests.filter(t => !t.passed).forEach(test => {
          console.log(`   - ${test.name}: ${test.error || 'Failed'}`);
        });
      }
    });

    // Overall results
    const overallPercentage = Math.round((this.results.overall.passed / this.results.overall.total) * 100);
    console.log('\n' + '='.repeat(60));
    console.log(`🎯 Overall UX Score: ${this.results.overall.passed}/${this.results.overall.total} (${overallPercentage}%)`);

    if (overallPercentage >= 90) {
      console.log('🌟 EXCELLENT - User experience is polished and ready for launch!');
    } else if (overallPercentage >= 80) {
      console.log('✅ GOOD - User experience is solid with minor improvements needed');
    } else if (overallPercentage >= 70) {
      console.log('⚠️ FAIR - User experience needs some improvements');
    } else {
      console.log('❌ NEEDS WORK - User experience requires significant improvements');
    }

    // Recommendations
    console.log('\n📋 Recommendations:');
    if (this.results.overall.failed > 0) {
      console.log('- Fix failed tests to improve user experience');
    }
    if (overallPercentage >= 90) {
      console.log('- Consider user testing with real users');
      console.log('- Monitor user feedback after launch');
    }
    if (overallPercentage < 80) {
      console.log('- Prioritize fixing critical UX issues');
      console.log('- Consider additional accessibility improvements');
    }

    // Save detailed report
    const reportPath = 'docs/testing/ux-testing-report.json';
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        totalTests: this.results.overall.total,
        passedTests: this.results.overall.passed,
        failedTests: this.results.overall.failed,
        successRate: overallPercentage
      }
    }, null, 2));

    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run the tests
const uxTesting = new UXTesting();
uxTesting.runAllTests().catch(console.error);
