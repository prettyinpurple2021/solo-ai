const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'lib', 'shared', 'db', 'schema');

const files = fs.readdirSync(dir);
for (const file of files) {
  if (file.endsWith('.ts')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove the import statement
    content = content.replace(/import \{ v4 as uuidv4 \} from 'uuid';\r?\n?/g, '');
    
    // Replace the function calls
    content = content.replace(/uuidv4\(\)/g, 'crypto.randomUUID()');
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}
