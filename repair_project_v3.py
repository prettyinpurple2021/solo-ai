import os
import re

def repair_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content

    # 1. Fix missing closing > in generics before {
    # e.g. async func(): Promise<Type {
    # e.g. async func(): Promise<Type  {
    content = re.sub(r'(Promise<[a-zA-Z0-9_]+)\s+\{', r'\1> {', content)
    content = re.sub(r'(Promise<[a-zA-Z0-9_]+)\s*\{', r'\1> {', content) # catch no space if missed
    
    # 2. Fix specific broken signature in agent-collaboration-system.ts
    # request: string: Record -> request: string, context: Record
    content = re.sub(r'request:\s*string\s*:\s*Record', r'request: string, context: Record', content)

    # 3. Fix other broken generics in geminiService
    # Promise<CompetitorReport  { -> Promise<CompetitorReport> {
    # Already covered by #1?
    # "Promise<CompetitorReport" matches group 1.
    # "  {" matches \s+\{.
    # Replacement "\1> {" -> "Promise<CompetitorReport> {". Correct.

    # 4. Fix other double colon issues?
    # val: string: boolean -> val: string, val2: boolean
    # Regex: : type : type
    # careful not to match ternary? ternary uses ? and :
    # type definitions don't use ternary usually.
    # But in objects: key: val ? a : b.
    # So be careful. Only fix inside (...) params?
    # For now, restrict to known pattern.
    
    # 5. Fix `Promise<Unknown  {` or similar
    content = re.sub(r'(Promise<[a-zA-Z0-9_]+)\s+=>', r'\1> =>', content) # arrow functions

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

def main():
    print("Starting repair v3...")
    for root, dirs, files in os.walk("."):
        if "node_modules" in root or ".next" in root or ".git" in root:
            continue
        for file in files:
            if file.endswith(".ts") or file.endswith(".tsx"):
                repair_file(os.path.join(root, file))
    print("Repair v3 complete.")

if __name__ == "__main__":
    main()
