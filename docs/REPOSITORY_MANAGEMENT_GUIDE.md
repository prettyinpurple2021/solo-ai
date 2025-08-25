# Repository Management Guide

## How to Check for Multiple Repositories

If you're unsure whether you have multiple repositories for the same project, follow this systematic approach:

### 1. Search GitHub Thoroughly

#### Basic Repository Search
```bash
# In browser, go to GitHub and search for:
your-username/solo-boss
your-username/v0-solo
org:your-username solo-boss

# Check your repositories page
https://github.com/your-username?tab=repositories
```

#### Advanced GitHub Search
```bash
# Search across all GitHub
site:github.com "solo-boss-ai-platform"
site:github.com your-username "solo boss"

# Check for private repositories
# Log in and visit: https://github.com/settings/repositories
```

### 2. Audit Your Local Development Environment

#### Find All Local Repositories
```bash
# Search your entire system for git repositories
find ~ -name ".git" -type d 2>/dev/null | head -20

# Search for directories with project name
find ~ -name "*solo*boss*" -type d 2>/dev/null
find ~ -name "*v0*solo*" -type d 2>/dev/null

# Check common development directories
ls -la ~/Desktop/
ls -la ~/Documents/
ls -la ~/Projects/
ls -la ~/Code/
ls -la ~/Development/
```

#### Check Git Configurations
```bash
# Check global git config
git config --global --list

# Check for multiple SSH keys (different accounts)
ls -la ~/.ssh/
cat ~/.ssh/config 2>/dev/null

# Check git credentials
git credential-manager-core get
```

### 3. Review Browser History

#### Check Bookmarks and History
- Search browser bookmarks for "solo-boss" or "v0"
- Check browser history for GitHub URLs
- Look for Google Cloud, or other deployment platform URLs

#### Common Development URLs to Check
```
http://localhost:3000
https://console.cloud.google.com/
```

### 4. Check Other Git Hosting Services

#### GitLab
```
https://gitlab.com/your-username
```

#### Bitbucket
```
https://bitbucket.org/your-username/
```

#### Azure DevOps
```
https://dev.azure.com/your-organization/
```

## How to Merge Repositories (If Needed)

### Scenario: You Found a Second Repository

If you discover you actually have two repositories for the same project:

#### Option 1: Merge Using Git (Recommended)

```bash
# 1. Navigate to your main repository
cd /path/to/main/repository

# 2. Create a backup branch
git checkout -b backup-before-merge
git push origin backup-before-merge

# 3. Add the second repository as a remote
git remote add secondary https://github.com/username/other-repo.git
# OR for local repository:
git remote add secondary /path/to/local/repository

# 4. Fetch the secondary repository
git fetch secondary

# 5. Create a new branch for merging
git checkout main
git checkout -b merge-secondary

# 6. Merge the repositories
git merge secondary/main --allow-unrelated-histories

# 7. Resolve any merge conflicts
# Edit conflicted files manually
git add .
git commit -m "Merge secondary repository"

# 8. Push the merged result
git push origin merge-secondary

# 9. Create a Pull Request to review changes
```

#### Option 2: Manual File Merge

```bash
# 1. Create comparison directory
mkdir ~/repository-comparison
cd ~/repository-comparison

# 2. Clone both repositories
git clone https://github.com/user/repo1.git repo1
git clone https://github.com/user/repo2.git repo2

# 3. Compare directories
diff -r repo1/ repo2/ > differences.txt

# 4. Identify unique files and changes
# Review differences.txt to understand what's different

# 5. Copy unique files to main repository
cp repo2/unique-file.txt ~/main-repo/
cp -r repo2/unique-directory/ ~/main-repo/

# 6. Commit changes to main repository
cd ~/main-repo
git add .
git commit -m "Add files from secondary repository"
```

### Option 3: Archive Strategy

If one repository is outdated:

```bash
# 1. Create archive of secondary repository
cd /path/to/secondary/repository
tar -czf ../soloboss-archive-$(date +%Y%m%d).tar.gz .

# 2. Document what was archived
echo "Archived secondary repository on $(date)" > ARCHIVE_LOG.md
echo "Location: ../soloboss-archive-$(date +%Y%m%d).tar.gz" >> ARCHIVE_LOG.md

# 3. Add archive documentation to main repository
mv ARCHIVE_LOG.md /path/to/main/repository/
cd /path/to/main/repository
git add ARCHIVE_LOG.md
git commit -m "Document archived secondary repository"
```

## Preventing Repository Confusion

### 1. Use Consistent Naming
```bash
# Good naming pattern
project-name-frontend
project-name-backend
project-name-mobile

# Avoid confusing names
project-name-main
project-name-backup
project-name-copy
```

### 2. Organize Your Development Directory
```bash
# Create clear project structure
~/Projects/
├── soloboss-ai-platform/          # Main repository
├── soloboss-ai-platform-backup/   # Clearly labeled backup
└── soloboss-ai-platform-experiments/  # Experimental work
```

### 3. Use Git Remotes Properly
```bash
# Add multiple deployment targets as remotes
git remote add origin https://github.com/user/main-repo.git
git remote add staging https://github.com/user/staging-repo.git
git remote add backup https://github.com/user/backup-repo.git

# Check your remotes
git remote -v
```

### 4. Document Your Repository Strategy
Create a `REPOSITORY_STRUCTURE.md` file:

```markdown
# Repository Structure

## Main Repository
- **URL**: https://github.com/username/v0-solo-boss-ai-platform
- **Purpose**: Production codebase
- **Branch Strategy**: main, development, feature/*

## Related Repositories
- None (all code is in main repository)

## Deployment Targets
- **Production**: https://your-domain.com
- **Staging**: https://staging.your-domain.com

## Archive
- No archived repositories
```

## Best Practices

### ✅ Do
- Use one repository per project when possible
- Create clear branch strategies
- Document your repository structure
- Use descriptive commit messages
- Tag releases appropriately

### ❌ Don't
- Create multiple repositories for the same project
- Use confusing naming conventions
- Leave repositories without documentation
- Mix different projects in one repository
- Forget to document archive decisions

## When Multiple Repositories Make Sense

### Valid Reasons for Multiple Repositories
1. **Microservices Architecture**
   - `project-frontend`
   - `project-api`
   - `project-mobile`

2. **Different Programming Languages**
   - `project-web` (JavaScript)
   - `project-ml` (Python)
   - `project-ios` (Swift)

3. **Different Teams/Organizations**
   - Company repository
   - Open source fork
   - Client-specific customization

### Invalid Reasons
- "Backup" repositories
- "Old" vs "new" versions
- Different deployment environments
- Experimental features (use branches instead)

---

*Use this guide to maintain clean, organized repositories and avoid confusion.*