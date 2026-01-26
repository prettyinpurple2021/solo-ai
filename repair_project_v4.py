import os
import re

def repair_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content

    # 1. Fix broken useState generics: useState<Type (null) -> useState<Type | null>(null)
    # The previous script removed | null> leaving (null) attached to Type kind of.
    # regex: useState<([a-zA-Z0-9\[\]]+)\s*\(null\)
    # Matches: useState<CollaborationTask (null)
    # Target: useState<CollaborationTask | null>(null)
    # Note: brackets might be unbalanced in regex if not careful.
    content = re.sub(r'useState<([a-zA-Z0-9_\[\]]+)\s*\(null\)', r'useState<\1 | null>(null)', content)

    # 2. Fix double colon in default value: = 'val': string -> = 'val'
    # e.g. (industry: string = 'general': string)
    # Remove : string after string literal.
    content = re.sub(r"(= '[^']+')\s*:\s*[a-zA-Z0-9_]+", r"\1", content)
    # Also for numbers? = 30: number
    content = re.sub(r"(= [0-9]+)\s*:\s*[a-zA-Z0-9_]+", r"\1", content)

    # 3. Fix double colon in optional param: ?: number: UserProgress
    # e.g. xpAmount?: number: UserProgress
    # This implies missing comma.
    # Replace : UserProgress with , arg: UserProgress
    # Regex: \?:\s*([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)
    # Replacement: ?:\1, arg_\2: \2
    content = re.sub(r'\?:\s*([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)', r'?:\1, arg_\2: \2', content)

    # 4. Fix specific case: Promise<Type  { -> Promise<Type> {
    # If v3 missed it because of newline?
    content = re.sub(r'(Promise<[a-zA-Z0-9_]+)\s+\{', r'\1> {', content)
    
    # 5. Fix import { , } cases again if any remain
    content = re.sub(r'import\s*\{\s*,', r'import { ', content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

def main():
    print("Starting repair v4...")
    for root, dirs, files in os.walk("."):
        if "node_modules" in root or ".next" in root or ".git" in root:
            continue
        for file in files:
            if file.endswith(".ts") or file.endswith(".tsx"):
                repair_file(os.path.join(root, file))
    print("Repair v4 complete.")

if __name__ == "__main__":
    main()
