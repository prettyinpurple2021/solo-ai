#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

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

function echoSection(title) {
  console.log(`\n--- ${title} ---`);
}

console.log('\n--- Automated check complete. ---');