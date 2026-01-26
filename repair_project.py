import os
import re

def repair_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content

    # 1. Fix Broken Imports: import { , A, , B } from ...
    # Remove leading comma after {
    content = re.sub(r'(import\s*\{)\s*,', r'\1', content)
    # Remove trailing comma before } (optional, but good for cleanliness, though valid in JS)
    # Remove double commas
    content = re.sub(r',(\s*,)+', r',', content)
    
    # 2. Fix Broken Parameters/Tuples: (a, , b)
    # This is risky inside string literals, but we assume code.
    # We can try to match inside () more carefully if needed.
    # For now, double commas removal works for (,,) too.
    
    # 3. Fix 'const ,' or 'let ,' (declarations with missing first var)
    # e.g. const , x = ... -> // const , x = ...
    # This is hard to fix perfectly, commenting out is safest.
    content = re.sub(r'^(\s*(const|let|var)\s+,.*)$', r'// \1', content, flags=re.MULTILINE)
    
    # 4. Fix 'const =' (missing identifier)
    # e.g. const = val; or const =;
    # Matches 'const' followed by whitespace and '='
    content = re.sub(r'^(\s*(const|let|var)\s+=\s+.*)$', r'// \1', content, flags=re.MULTILINE)

    # 5. Fix Broken Types specific patterns
    # | null> at end of line or before {
    content = re.sub(r'\|\s*null\s*>', r'', content)
    
    # 6. Fix 'import { } from' (empty imports) - optional, valid but useless.
    
    # 7. Fix orphaned '?' in params e.g. 'val: any,?'
    content = re.sub(r',\s*\?', '', content)

    # 8. Fix 'val: ,' or 'val: ;' (missing type) -> 'val: any,'
    content = re.sub(r':\s*,', r': any,', content)
    # Check for 'val: )' -> 'val: any)'
    content = re.sub(r':\s*\)', r': any)', content)
    # Check for 'val: ;' -> 'val: any;'
    content = re.sub(r':\s*;', r': any;', content)

    # 9. Fix 'param: : Type' -> 'param: Type' (double colon)
    content = re.sub(r':\s*:\s*', r': ', content)

    # 10. Fix 'import ... , }' -> leading comma issue in close?
    # Handled by double comma fix? 
    # { a, , } -> { a, } (valid)
    # { , a } -> { a } (fixed by rule 1 for imports, but generally { , } is invalid object literal key)
    # Fix { , } globally? 
    # Match [{(\[]\s*, -> Remove comma.
    content = re.sub(r'([\{\(\[])\s*,', r'\1', content)

    if content != original_content:
        # print(f"Repaired: {filepath}")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

def main():
    print("Starting repair...")
    for root, dirs, files in os.walk("."):
        if "node_modules" in root or ".next" in root or ".git" in root:
            continue
        for file in files:
            if file.endswith(".ts") or file.endswith(".tsx"):
                repair_file(os.path.join(root, file))
    print("Repair complete.")

if __name__ == "__main__":
    main()
