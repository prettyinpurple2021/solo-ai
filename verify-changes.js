const fs = require('fs');
const path = require('path');

console.log('Verifying button text changes...\n');

const files = [
  'app/pricing/page.tsx',
  'app/features/page.tsx',
  'components/shared/shared-landing-page.tsx'
];

let allTestsPassed = true;

files.forEach(filePath => {
  console.log(`Checking ${filePath}...`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const hasStartForFree = content.includes('Start for free');
    const hasStartFreeTrial = content.includes('Start Free Trial');
    
    if (hasStartForFree && !hasStartFreeTrial) {
      console.log('  ✅ Correctly updated - contains "Start for free", no "Start Free Trial"');
    } else if (hasStartFreeTrial) {
      console.log('  ❌ Still contains "Start Free Trial"');
      allTestsPassed = false;
    } else if (!hasStartForFree) {
      console.log('  ⚠️  No button text found in this file');
    }
  } catch (error) {
    console.log(`  ❌ Error reading file: ${error.message}`);
    allTestsPassed = false;
  }
});

console.log('\n' + '='.repeat(50));
if (allTestsPassed) {
  console.log('✅ All tests passed! Button text has been successfully updated.');
} else {
  console.log('❌ Some tests failed. Please review the changes.');
}

console.log('='.repeat(50));