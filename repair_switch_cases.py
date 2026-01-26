import os
import re

def repair_switches(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in root:
            continue
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Repairs:
                # 1. case 'val' <JSX -> case 'val': return <JSX
                # 2. case 'val' 'str' -> case 'val': return 'str'
                # 3. case "val" ...
                
                # Pattern 1: JSX start
                # case '...' <
                new_content = re.sub(
                    r"(case\s+['\"].*?['\"]\s*)(<[A-Z][a-zA-Z0-9]*)",
                    r"\1: return \2",
                    content
                )
                
                # Pattern 2: String literal start (e.g. 'bg-red...')
                # case '...' 'class...'
                # Avoid touching : or return if present
                # Use careful lookbehind/lookahead involves parsing
                # Regex: case '...' '...' (quote followed by quote)
                new_content = re.sub(
                    r"(case\s+['\"].*?['\"]\s*)(['\"])",
                    r"\1: return \2",
                    new_content
                )
                
                if new_content != content:
                    print(f"Repaired switches in: {filepath}")
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)

if __name__ == "__main__":
    repair_switches(".")
