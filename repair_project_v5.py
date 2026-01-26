import os
import re

def repair_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content

    # 1. Fix "import, {"
    content = re.sub(r'import,\s*\{', r'import {', content)

    # 2. Fix unclosed generics at end of line (e.g. Promise<string\n)
    # Be careful not to match Promise<string,
    # Match Promise<Word followed by newline or ; or , or } or )
    content = re.sub(r'(Promise<[a-zA-Z0-9_]+)(\s*)$', r'\1>\2', content, flags=re.MULTILINE)
    # Also Match Promise<Word\n
    content = re.sub(r'(Promise<[a-zA-Z0-9_]+)(\r?\n)', r'\1>\2', content)

    # 3. Fix createContext broken generic: createContext<Type (null) -> createContext<Type | null>(null)
    content = re.sub(r'createContext<([a-zA-Z0-9_]+)\s*\(null\)', r'createContext<\1 | null>(null)', content)
    # Also createContext<Type | undefined (null) -> createContext<Type | undefined>(null)
    # The error log said: React.Context<SidebarContext  | undefined\n
    # Missing >
    content = re.sub(r'(React\.Context<[a-zA-Z0-9_]+\s*\|\s*undefined)(\s*)$', r'\1>\2', content, flags=re.MULTILINE)
    content = re.sub(r'(React\.Context<[a-zA-Z0-9_]+\s*\|\s*undefined)(\r?\n)', r'\1>\2', content)

    # 4. Fix specific: executeRecaptcha: (action: string) => Promise<string
    # Covered by rule 2?
    
    # 5. Fix "import, { useState,}" (trailing comma inside)
    # v1 fixed { , } but "import," is outside. rule 1 covers it.

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

def main():
    print("Starting repair v5...")
    for root, dirs, files in os.walk("."):
        if "node_modules" in root or ".next" in root or ".git" in root:
            continue
        for file in files:
            if file.endswith(".ts") or file.endswith(".tsx"):
                repair_file(os.path.join(root, file))
    print("Repair v5 complete.")

if __name__ == "__main__":
    main()
