#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- Netlify Deployment Automated Check ---');

// 1. Check next.config.mjs for output: 'export'
const nextConfigPath = path.join(__dirname, '../next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  if (/output\s*:\s*['"]export['"]/.test(nextConfig)) {
    console.log('✅ next.config.mjs contains output: "export" (required for Netlify static hosting).');
  } else {
    console.warn('❌ WARNING: next.config.mjs does NOT contain output: "export". Add this for Netlify deployment!');
  }
} else {
  console.warn('⚠️ next.config.mjs not found.');
}

// 2. Check for netlify.toml
const netlifyTomlPath = path.join(__dirname, '../netlify.toml');
if (fs.existsSync(netlifyTomlPath)) {
  console.log('✅ netlify.toml configuration file exists.');
} else {
  console.warn('❌ WARNING: netlify.toml not found. This is required for Netlify deployment!');
}

// 3. Check for Vercel-specific dependencies
const packageJsonPath = path.join(__dirname, '../package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const hasVercelDeps = packageJson.dependencies && (
    packageJson.dependencies['@vercel/analytics'] ||
    packageJson.dependencies['@vercel/blob'] ||
    packageJson.dependencies['@vercel/speed-insights']
  );
  
  if (hasVercelDeps) {
    console.warn('❌ WARNING: Vercel-specific dependencies found. Remove these for Netlify deployment:');
    if (packageJson.dependencies['@vercel/analytics']) console.warn('  - @vercel/analytics');
    if (packageJson.dependencies['@vercel/blob']) console.warn('  - @vercel/blob');
    if (packageJson.dependencies['@vercel/speed-insights']) console.warn('  - @vercel/speed-insights');
  } else {
    console.log('✅ No Vercel-specific dependencies found.');
  }
} else {
  console.warn('⚠️ package.json not found.');
}

// 4. Print recommended Netlify build settings
console.log('\n--- Recommended Netlify Project Settings ---');
console.log('Build Command: npm run build');
console.log('Publish Directory: out');
console.log('Node Version: 18 (or higher)');

// 5. Reminders for manual checks
echoSection('Manual Checks');
console.log('• Test /privacy and /terms locally: http://localhost:3000/privacy and /terms');
console.log('• Test deployed URLs: https://your-netlify-domain/privacy and /terms');
console.log('• Test in incognito window and clear browser cache.');
console.log('• If issues persist, check Netlify deployment logs for errors.');
console.log('• Ensure all environment variables are set in Netlify dashboard.');

// 6. Check for /privacy and /terms pages
const privacyPage = path.join(__dirname, '../app/privacy/page.tsx');
const termsPage = path.join(__dirname, '../app/terms/page.tsx');
if (fs.existsSync(privacyPage)) {
  console.log('✅ app/privacy/page.tsx exists.');
} else {
  console.warn('❌ WARNING: app/privacy/page.tsx does NOT exist!');
}
if (fs.existsSync(termsPage)) {
  console.log('✅ app/terms/page.tsx exists.');
} else {
  console.warn('❌ WARNING: app/terms/page.tsx does NOT exist!');
}

// 7. Check footer for legal links
const footerPath = path.join(__dirname, '../components/footer/app-footer.tsx');
if (fs.existsSync(footerPath)) {
  const footerContent = fs.readFileSync(footerPath, 'utf8');
  const hasPrivacy = /href=["'`]\/privacy["'`]/.test(footerContent);
  const hasTerms = /href=["'`]\/terms["'`]/.test(footerContent);
  if (hasPrivacy && hasTerms) {
    console.log('✅ Footer contains links to /privacy and /terms.');
  } else {
    if (!hasPrivacy) console.warn('❌ WARNING: Footer does NOT contain a link to /privacy!');
    if (!hasTerms) console.warn('❌ WARNING: Footer does NOT contain a link to /terms!');
  }
} else {
  console.warn('⚠️ components/footer/app-footer.tsx not found.');
}

// 8. Check app/layout.tsx for providers
const layoutPath = path.join(__dirname, '../app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  const hasThemeProvider = /ThemeProvider/.test(layoutContent);
  const hasAuthProvider = /AuthProvider/.test(layoutContent);
  const hasVercelAnalytics = /@vercel\/analytics/.test(layoutContent);
  const hasVercelSpeedInsights = /@vercel\/speed-insights/.test(layoutContent);
  
  if (hasThemeProvider && hasAuthProvider) {
    console.log('✅ app/layout.tsx includes ThemeProvider and AuthProvider.');
  } else {
    if (!hasThemeProvider) console.warn('❌ WARNING: app/layout.tsx does NOT include ThemeProvider!');
    if (!hasAuthProvider) console.warn('❌ WARNING: app/layout.tsx does NOT include AuthProvider!');
  }
  
  if (hasVercelAnalytics || hasVercelSpeedInsights) {
    console.warn('❌ WARNING: app/layout.tsx still contains Vercel-specific imports! Remove these for Netlify deployment.');
  } else {
    console.log('✅ app/layout.tsx does not contain Vercel-specific imports.');
  }
} else {
  console.warn('⚠️ app/layout.tsx not found.');
}

function echoSection(title) {
  console.log(`\n--- ${title} ---\n`);
}
