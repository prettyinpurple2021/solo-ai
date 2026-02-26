import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(__dirname, '..', 'src')

function renameFileIfExists(oldPath, newPath) {
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath)
    console.log(`Renamed ${path.basename(oldPath)} to ${path.basename(newPath)}`)
  }
}

renameFileIfExists(
  path.join(srcDir, 'components', 'ui', 'boss-button.tsx'),
  path.join(srcDir, 'components', 'ui', 'cyber-button.tsx')
)
renameFileIfExists(
  path.join(srcDir, 'components', 'ui', 'boss-card.tsx'),
  path.join(srcDir, 'components', 'ui', 'cyber-card.tsx')
)

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f)
    let isDirectory = fs.statSync(dirPath).isDirectory()
    if (isDirectory) {
      walkDir(dirPath, callback)
    } else {
      if (f.match(/\.(ts|tsx|js|jsx|css|md)$/)) {
        callback(dirPath)
      }
    }
  })
}

const replacements = [
  { regex: /boss-card/g, replace: 'cyber-card' },
  { regex: /boss-button/g, replace: 'cyber-button' },
  { regex: /boss-heading/g, replace: 'cyber-heading' },
  { regex: /girlboss-badge/g, replace: 'elite-badge' },
  { regex: /BossCard/g, replace: 'CyberCard' },
  { regex: /BossButton/g, replace: 'CyberButton' },
  { regex: /solobossai\.fun/gi, replace: 'solosuccess.ai' },
  { regex: /solobossai/gi, replace: 'solosuccess' },
  { regex: /\bBoss Babe\b/g, replace: 'Founder' },
  { regex: /\bboss babe\b/g, replace: 'founder' },
  { regex: /\bBosses\b/g, replace: 'Founders' },
  { regex: /\bbosses\b/g, replace: 'founders' },
  { regex: /\bBoss\b/g, replace: 'Founder' },
  { regex: /\bboss\b/g, replace: 'founder' }
]

let updatedCount = 0

walkDir(srcDir, function(filePath) {
  let initial = fs.readFileSync(filePath, 'utf8')
  let content = initial

  replacements.forEach(r => {
    content = content.replace(r.regex, r.replace)
  })

  if (content !== initial) {
    fs.writeFileSync(filePath, content, 'utf8')
    console.log(`Updated ${filePath.replace(srcDir, '')}`)
    updatedCount++
  }
})

console.log(`\nRebrand complete. Updated ${updatedCount} files.`)
