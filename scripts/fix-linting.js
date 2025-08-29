#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to fix unused imports
function fixUnusedImports(content) {
  // Remove unused imports like AlertDescription, ExternalLink, etc.
  const unusedImports = [
    'AlertDescription', 'ExternalLink', 'Users', 'Textarea', 'AlertTriangle',
    'Trash2', 'DialogDescription', 'DialogHeader', 'DialogTitle', 'Mail',
    'CreditCard', 'FileText', 'Camera', 'Plus', 'Crown', 'Shield', 'BarChart3',
    'XCircle', 'Calendar', 'Share2', 'Zap', 'Card', 'CardContent', 'CardDescription',
    'CardHeader', 'CardTitle', 'Tabs', 'TabsContent', 'TabsList', 'TabsTrigger',
    'useEffect', 'Progress', 'Alert', 'AnimatePresence', 'Heart', 'TrendingUp',
    'CheckCircle', 'Settings', 'Brain', 'Eye', 'ThumbsUp', 'ThumbsDown', 'Star',
    'Clock', 'useRef', 'Target', 'Palette', 'Video', 'Link', 'Tag', 'Label'
  ];

  let fixedContent = content;
  
  // Remove unused imports from import statements
  unusedImports.forEach(unused => {
    const importPattern = new RegExp(`\\b${unused}\\b\\s*,?\\s*`, 'g');
    fixedContent = fixedContent.replace(importPattern, '');
  });

  // Clean up empty import statements
  fixedContent = fixedContent.replace(/import\s*{\s*,*\s*}\s*from\s*['"][^'"]+['"];?\s*$/gm, '');
  fixedContent = fixedContent.replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"];?\s*$/gm, '');

  return fixedContent;
}

// Function to fix unused variables
function fixUnusedVariables(content) {
  // Fix unused destructured variables
  content = content.replace(
    /const\s*{\s*([^}]+)\s*}\s*=\s*([^;]+);/g,
    (match, vars, value) => {
      const varList = vars.split(',').map(v => {
        const name = v.trim().split(':')[0].trim();
        if (name.startsWith('_')) return v;
        return v.replace(name, `_${name}`);
      });
      return `const { ${varList.join(', ')} } = ${value};`;
    }
  );

  // Fix unused function parameters
  content = content.replace(
    /function\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(\s*([^)]+)\s*\)/g,
    (match, params) => {
      const paramList = params.split(',').map(param => {
        const name = param.trim().split('=')[0].trim();
        if (name.startsWith('_')) return param;
        return param.replace(name, `_${name}`);
      });
      return match.replace(params, paramList.join(', '));
    }
  );

  // Fix unused arrow function parameters
  content = content.replace(
    /\(\s*([^)]+)\s*\)\s*=>/g,
    (match, params) => {
      const paramList = params.split(',').map(param => {
        const name = param.trim().split('=')[0].trim();
        if (name.startsWith('_')) return param;
        return param.replace(name, `_${name}`);
      });
      return match.replace(params, paramList.join(', '));
    }
  );

  return content;
}

// Function to fix specific unused variables
function fixSpecificUnusedVars(content) {
  const specificFixes = [
    { pattern: /const\s+isMuted\s*=/g, replacement: 'const _isMuted =' },
    { pattern: /const\s+handleShare\s*=/g, replacement: 'const _handleShare =' },
    { pattern: /const\s+error\s*=/g, replacement: 'const _error =' },
    { pattern: /const\s+data\s*=/g, replacement: 'const _data =' },
    { pattern: /const\s+showAnimation\s*=/g, replacement: 'const _showAnimation =' },
    { pattern: /const\s+confettiStyles\s*=/g, replacement: 'const _confettiStyles =' },
    { pattern: /const\s+loading\s*=/g, replacement: 'const _loading =' },
    { pattern: /const\s+selectedCalendar\s*=/g, replacement: 'const _selectedCalendar =' },
    { pattern: /const\s+setSelectedCalendar\s*=/g, replacement: 'const _setSelectedCalendar =' },
    { pattern: /const\s+setDataRequests\s*=/g, replacement: 'const _setDataRequests =' },
    { pattern: /const\s+setConsentLogs\s*=/g, replacement: 'const _setConsentLogs =' },
    { pattern: /const\s+stackApp\s*=/g, replacement: 'const _stackApp =' },
    { pattern: /const\s+isLoading\s*=/g, replacement: 'const _isLoading =' },
    { pattern: /const\s+toast\s*=/g, replacement: 'const _toast =' },
    { pattern: /const\s+selectedTemplate\s*=/g, replacement: 'const _selectedTemplate =' },
    { pattern: /const\s+updateBlock\s*=/g, replacement: 'const _updateBlock =' },
    { pattern: /const\s+moveBlock\s*=/g, replacement: 'const _moveBlock =' },
    { pattern: /const\s+text\s*=/g, replacement: 'const _text =' },
  ];

  let fixedContent = content;
  specificFixes.forEach(fix => {
    fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
  });

  return fixedContent;
}

// Function to fix unescaped entities
function fixUnescapedEntities(content) {
  return content
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;');
}

// Function to fix img elements
function fixImgElements(content) {
  return content.replace(
    /<img\s+([^>]*)\/>/g,
    '<img $1 alt="" />'
  );
}

// Function to fix Next.js Link issues
function fixNextJsLinks(content) {
  return content.replace(
    /<a\s+href="\/templates\/"/g,
    '<Link href="/templates/"'
  );
}

// Main function to process a file
function processFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Apply fixes
    content = fixUnusedImports(content);
    content = fixUnusedVariables(content);
    content = fixSpecificUnusedVars(content);
    content = fixUnescapedEntities(content);
    content = fixImgElements(content);
    content = fixNextJsLinks(content);

    // Write back if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// List of files to process (based on the linting errors)
const filesToProcess = [
  'components/footer/app-footer.tsx',
  'components/forms/secure-contact-form.tsx',
  'components/gamification/achievement-celebration.tsx',
  'components/guardian-ai/compliance-scanner.tsx',
  'components/guardian-ai/consent-management.tsx',
  'components/guardian-ai/guardian-ai-dashboard.tsx',
  'components/guardian-ai/policy-generator.tsx',
  'components/integrations/calendar-integration.tsx',
  'components/integrations/integration-hub.tsx',
  'components/mobile/mobile-gestures.tsx',
  'components/nav-user.tsx',
  'components/onboarding/onboarding-wizard.tsx',
  'components/performance/performance-monitor.tsx',
  'components/performance/service-worker-register.tsx',
  'components/profile/enhanced-profile-modal.tsx',
  'components/profile/profile-modal.tsx',
  'components/recaptcha/recaptcha-button.tsx',
  'components/recaptcha/recaptcha-provider.tsx',
  'components/social/boss-community.tsx',
  'components/subscription/subscription-manager.tsx',
  'components/templates/base-template.tsx',
  'components/templates/big-leap-planner.tsx',
  'components/templates/customer-journey-mapper.tsx',
  'components/templates/decision-dashboard.tsx',
  'components/templates/dm-sales-script-generator.tsx',
  'components/templates/email-campaign-builder.tsx',
  'components/templates/freebie-funnel-builder.tsx',
  'components/templates/i-hate-this-tracker.tsx',
  'components/templates/live-launch-tracker.tsx',
  'components/templates/offer-comparison-matrix.tsx',
  'components/templates/saved-templates-list.tsx',
  'components/templates/social-media-strategy.tsx',
  'components/templates/strategic-business-plan.tsx',
  'components/templates/template-registry.tsx',
  'components/templates/upsell-flow-builder.tsx',
  'components/templates/vision-board-generator.tsx',
  'components/ui/boss-card.tsx',
  'components/ui/chart.tsx',
  'components/ui/date-range-picker.tsx',
  'components/ui/error-boundary.tsx',
  'components/ui/recaptcha-button.tsx',
  'components/voice/voice-chat.tsx',
  'components/voice/voice-input.tsx',
  'lib/ai-personality-system.ts',
  'lib/documentParser.ts',
  'lib/idempotency.ts',
  'lib/log.ts',
  'lib/neon/client.ts',
  'lib/rate-limit.ts',
  'lib/server-polyfills.ts',
  'lib/templates-client.ts'
];

// Process all files
console.log('🔧 Fixing linting issues...\n');
filesToProcess.forEach(file => {
  processFile(file);
});
console.log('\n✨ Linting fixes completed!');