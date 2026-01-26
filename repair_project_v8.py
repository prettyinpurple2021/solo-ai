import os
import re

def repair_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content

    # 1. Fix broken ternaries in objects (missing else)
    # e.g. unlocked: analytics ? analytics.current_streak >= 10,
    # Regex: key: cond ? val,
    # We look for ? without : before ,
    # This is hard to do perfectly with regex, but for these specific cases:
    # Match: ? [^:,]+ ,
    # Be careful of nested structures.
    # Case 1: learning/page.tsx
    # unlocked: analytics ? analytics.current_streak >= 10,
    if "learning/page.tsx" in filepath.replace("\\", "/"):
        content = re.sub(r'(unlocked: analytics \? [^,]+)(,)', r'\1 : false\2', content)
    
    # Case 2: api/opportunities/route.ts
    # isArchived: validatedParams.isArchived ? validatedParams.isArchived === 'true' }
    if "api/opportunities/route.ts" in filepath.replace("\\", "/"):
         content = re.sub(r'(isArchived: [^?]+\? [^}]+)(\})', r'\1 : false\2', content)

    # 2. Fix userId: string: string
    # In src/lib/competitive-intelligence-context.ts
    if "competitive-intelligence-context.ts" in filepath.replace("\\", "/"):
        content = re.sub(r'userId:\s*string\s*:\s*string', r'userId: string, context: string', content)
    
    # General fix for ternaries ending with } or , without : ??
    # Too risky globally.

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

def main():
    print("Starting repair v8...")
    for root, dirs, files in os.walk("."):
        if "node_modules" in root or ".next" in root or ".git" in root:
            continue
        for file in files:
            if file.endswith(".ts") or file.endswith(".tsx"):
                repair_file(os.path.join(root, file))
    print("Repair v8 complete.")

if __name__ == "__main__":
    main()
