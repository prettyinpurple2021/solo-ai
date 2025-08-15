// Script to verify crypto module availability during build
console.log('Checking crypto module availability...');

try {
  const crypto = require('crypto');
  console.log('✅ Crypto module loaded successfully');
  
  // Test basic crypto functionality
  const hash = crypto.createHash('sha256').update('test').digest('hex');
  console.log('✅ Crypto hash function works:', hash);
  
  // Check JWT dependencies
  const jwt = require('jsonwebtoken');
  console.log('✅ JWT module loaded successfully');
  
  console.log('All critical modules loaded successfully. Build should proceed without errors.');
} catch (error) {
  console.error('❌ Error loading crypto or JWT modules:', error);
  process.exit(1);
}
