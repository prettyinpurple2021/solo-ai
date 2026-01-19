const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

async function main() {
  const pattern = 'app/api/**/*.ts';
  // Note: Windows paths might need normalization, but glob usually handles forward slashes fine.
  // We'll search in process.cwd()
  
  console.log('Searching for files matching:', pattern);
  
  const files = await glob(pattern, { cwd: process.cwd() });
  
  console.log(`Found ${files.length} files.`);
  
  let modifiedCount = 0;
  
  for (const file of files) {
    const fullPath = path.resolve(process.cwd(), file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Regex to match the comment and the export
    // Use [\s\S]*? if needed, but here we expect them close together.
    // We'll look for the specific block.
    // Handling potential variations in newlines.
    
    const regex = /\/\/ Edge runtime enabled after refactoring to jose and Neon HTTP\s+export const runtime = 'edge'/g;
    
    if (regex.test(content)) {
      const newContent = content.replace(regex, '');
      // Also clean up potential double newlines left behind
      // .replace(/\n\s*\n\s*\n/g, '\n\n'); 
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Modified: ${file}`);
        modifiedCount++;
      }
    }
  }
  
  console.log(`Total files modified: ${modifiedCount}`);
}

main().catch(console.error);
