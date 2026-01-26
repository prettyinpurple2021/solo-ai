import os
import re

def repair_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content

    # 1. Fix "const { error: }" -> "const { error }"
    # Regex: curly brace open, content, key: }
    # Global: ([a-zA-Z0-9_]+)\s*:\s*\} -> \1 }
    # Be careful not to match object literal { key: } which is invalid anyway unless value missing.
    content = re.sub(r'([a-zA-Z0-9_]+)\s*:\s*\}', r'\1 }', content)
    
    # 2. Fix "import { ... as, ... }" -> "import { ... , ... }"
    # remove "as" if followed by comma.
    content = re.sub(r'\s+as\s*,', r',', content)
    # also "as }" -> "}"
    content = re.sub(r'\s+as\s*\}', r' }', content)

    # 3. Fix "(: any," or "(: string," (lowercase types in params)
    # v2 regex was: r',\s*:\s*([A-Z][a-zA-Z0-9\.]*)'
    # new regex: r',\s*:\s*([a-zA-Z0-9_]+)'
    # replace with: , arg_$1: $1
    content = re.sub(r',\s*:\s*([a-zA-Z0-9_]+)', r', arg_\1: \1', content)
    
    # 4. Fix "import, {" again?
    # Ensure no leading comma.
    content = re.sub(r'import\s*,\s*\{', r'import {', content)

    # 5. Fix double commas ",,"
    content = re.sub(r',,', r',', content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

def main():
    print("Starting repair v7...")
    for root, dirs, files in os.walk("."):
        if "node_modules" in root or ".next" in root or ".git" in root:
            continue
        for file in files:
            if file.endswith(".ts") or file.endswith(".tsx"):
                repair_file(os.path.join(root, file))
    print("Repair v7 complete.")

if __name__ == "__main__":
    main()
