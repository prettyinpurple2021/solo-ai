#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

console.log('--- Vercel Deployment Automated Check ---');

// 1. Check next.config.mjs for output: 'export'
const nextConfigPath = path.join(__dirname, '../next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  if (/output\s*:\s*['"]export['"]/.test(nextConfig)) {
    console.warn('❌ WARNING: next.config.mjs contains output: "export". Remove this for dynamic routing to work on Vercel!');
  } else {
    console.log('✅ next.config.mjs does NOT contain output: "export".');
  }
} else {
  console.warn('⚠️ next.config.mjs not found.');
}

// 2. Check for vercel.json and catch-all redirect
const vercelJsonPath = path.join(__dirname, '../vercel.json');
if (fs.existsSync(vercelJsonPath)) {
  const vercelJson = fs.readFileSync(vercelJsonPath, 'utf8');
  if (/"source"\s*:\s*"\/(\\\.\*|\(\.\*\))"\s*,\s*"destination"\s*:\s*"\/"/.test(vercelJson)) {
    console.warn('❌ WARNING: vercel.json contains a catch-all redirect to "/". This will break dynamic routes like /privacy and /terms!');
  } else {
    console.log('✅ vercel.json does NOT contain a catch-all redirect to "/".');
  }
} else {
  console.log('✅ No vercel.json file found (default behavior is safe).');
}

// 3. Print recommended Vercel build settings
console.log('\n--- Recommended Vercel Project Settings ---');
console.log('Framework Preset: Next.js');
console.log('Build Command: npm run build');
console.log('Output Directory: .next');

// 4. Reminders for manual checks
echoSection('Manual Checks');
console.log('• Test /privacy and /terms locally: http://localhost:3000/privacy and /terms');
console.log('• Test deployed URLs: https://your-vercel-domain/privacy and /terms');
console.log('• Test in incognito window and clear browser cache.');
console.log('• If issues persist, check Vercel deployment logs for errors.');

// 5. Check for /privacy and /terms pages
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

// 6. Check footer for legal links
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

// 7. Check app/layout.tsx for providers and analytics
const layoutPath = path.join(__dirname, '../app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  const hasThemeProvider = /ThemeProvider/.test(layoutContent);
  const hasAuthProvider = /AuthProvider/.test(layoutContent);
  const hasAnalytics = /Analytics/.test(layoutContent);
  const hasSpeedInsights = /SpeedInsights/.test(layoutContent);
  if (hasThemeProvider && hasAuthProvider && hasAnalytics && hasSpeedInsights) {
    console.log('✅ app/layout.tsx includes ThemeProvider, AuthProvider, Analytics, and SpeedInsights.');
  } else {
    if (!hasThemeProvider) console.warn('❌ WARNING: app/layout.tsx does NOT include ThemeProvider!');
    if (!hasAuthProvider) console.warn('❌ WARNING: app/layout.tsx does NOT include AuthProvider!');
    if (!hasAnalytics) console.warn('❌ WARNING: app/layout.tsx does NOT include Analytics!');
    if (!hasSpeedInsights) console.warn('❌ WARNING: app/layout.tsx does NOT include SpeedInsights!');
  }
} else {
  console.warn('⚠️ app/layout.tsx not found.');
}

function echoSection(title) {
  console.log(`\n--- ${title} ---\n`);
}