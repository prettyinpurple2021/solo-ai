import os
import re

def repair_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content

    # 1. Fix "import, {" or "import , {"
    # v5 used r'import,\s*\{'.
    # Maybe it is "import , {"?
    content = re.sub(r'import\s*,\s*\{', r'import {', content)
    # Also "import, {" (no space)
    content = re.sub(r'import,\s*\{', r'import {', content)

    # 2. Fix useState<... (null) -> useState<... | null>(null)
    # Handle complex types including braces and newlines.
    # We use non-greedy matching for content inside <...>.
    # But nested <> might be tricky.
    # Pattern: useState< (CONTENT) (null)
    # We rely on (null) being the anchor.
    # We search for useState< ... (null)
    # Regex: useState<((?:[^>]+|>(?!(\s*\(null\))))+)>\s*\(null\)
    # This is getting complex.
    # Simpler: match useState< and then scan until >\s*(null).
    # Python re doesn't support recursive matching.
    # But since the error cases are specific:
    # case 1: useState<{ ... } (null)
    # case 2: useState<Type (null)
    
    # Generic fix for " (null)" after >
    # This assumes the previous repair removed "| null".
    # So we look for >\s*(null) and try to insert | null inside.
    # But we need to find the matching <.
    # This is hard with regex.
    
    # Specific fix for the errors seen:
    # "useState<{ x: number; y: number; time: number } (null)"
    content = re.sub(r'(useState<\{[^}]+\})\s*\(null\)', r'\1 | null>(null)', content)
    
    # "useState<{ ... } (null)" (multiline)
    # Dotall mode?
    match = re.search(r'(useState<\{.*?\}\s*)\(null\)', content, re.DOTALL)
    if match:
        content = re.sub(r'(useState<\{.*?\}\s*)\(null\)', r'\1 | null>(null)', content, flags=re.DOTALL)

    # 3. Fix missing delimiters in type definitions inside voice-task-creator properties
    # title: string\n description: string
    # Replace keys that don't end with , or ;
    # Regex: (^[ \t]*[a-zA-Z0-9_]+:\s*[a-zA-Z0-9_\|']+)$ (multiline)
    # Add comma.
    # But ensure we are inside a type def? Risky global replace.
    # Limit to "voice-task-creator.tsx" if possible?
    # Or just target lines that look like properties in interface.
    if "voice-task-creator.tsx" in filepath:
         # simple heuristic: line ends with "string" or "number" or "'low'" etc and no comma/semi
         content = re.sub(r'(: (string|number|boolean|any|"[^"]+"|\'[^\']+\'))(\s*)$', r'\1,\2', content, flags=re.MULTILINE)
         # Also union types
         content = re.sub(r'(: [a-zA-Z0-9_\|\s\']+)(\s*)$', r'\1,\2', content, flags=re.MULTILINE)
         # Clean up double commas if any
         content = re.sub(r',,', r',', content)

    # 4. Fix specific: const [isOnline, setIsOnline] = useState(true) error "Expected ',' got 'setIsOnline'"
    # Logic: Maybe "const [isOnline setIsOnline]"?
    # If comma invalid?
    # Error: "import, { useState,} from 'react'"
    # If line 2 is bad, line 94 `useState` might be undefined or broken?
    # The error "Expected ','" might be because `useState` usage text is corrupted.
    # If line 2 is fixed (rule 1), line 94 might be fine.

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

def main():
    print("Starting repair v6...")
    for root, dirs, files in os.walk("."):
        if "node_modules" in root or ".next" in root or ".git" in root:
            continue
        for file in files:
            if file.endswith(".ts") or file.endswith(".tsx"):
                repair_file(os.path.join(root, file))
    print("Repair v6 complete.")

if __name__ == "__main__":
    main()
