import os
import re

def repair_types(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in root:
            continue
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                
                # 1. Remove broken generic trailers like '| null>' or '>' after function signature
                # e.g. async func() | null>
                content = re.sub(r'(\))\s*\|\s*null\s*>', r'\1', content)
                content = re.sub(r'(\))\s*>', r'\1', content)
                
                # 2. Remove broken generic args like '?, any>' or ', any>' at end of signature
                content = re.sub(r'(\?|\w)\s*,?\s*any\s*>', r'\1', content)
                
                # 3. Fix orphaned '?' in params e.g. 'val: any,?'
                content = re.sub(r',\s*\?', '', content)
                
                # 4. Fix missing param name e.g. '(id: string, : Type)' -> '(id: string, arg_fixed: Type)'
                content = re.sub(r',\s*:', ', arg_fixed:', content)
                
                # 5. Fix 'const =' or 'let =' (lines completely broken)
                # Comment them out
                content = re.sub(r'^(\s*(const|let|var)\s+=\s+.*)$', r'// \1', content, flags=re.MULTILINE)
                
                # 6. Fix 'const , ...'
                content = re.sub(r'^(\s*(const|let|var)\s+,.*)$', r'// \1', content, flags=re.MULTILINE)

                # 7. Fix '?, ]>' or similar leftovers from generics
                content = re.sub(r'\?,\s*\]\s*>', '', content)

                if content != original_content:
                    print(f"Repaired types in: {filepath}")
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)

if __name__ == "__main__":
    repair_types(".")
