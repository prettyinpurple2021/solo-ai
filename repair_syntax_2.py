import re
import os

def repair_files():
    log_file = 'tsc_output_3.txt'
    if not os.path.exists(log_file):
        print("Log file not found")
        # Fallback to output_2 if needed or just process all ts files? No, unsafe.
        return

    with open(log_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    files_to_process = set()
    file_re = re.compile(r"^([^\(]+)\(")
    
    for line in lines:
        m = file_re.match(line)
        if m:
            filepath = m.group(1).strip()
            if not os.path.isabs(filepath):
                 filepath = os.path.abspath(filepath)
            files_to_process.add(filepath)

    print(f"Found {len(files_to_process)} files to repair.")

    for filepath in files_to_process:
        if not os.path.exists(filepath):
            continue
            
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {filepath}: {e}")
            continue

        original_content = content

        # 1. Fix 'as' without alias in imports
        # import { A as } -> import { A }
        # import { A as, B } -> import { A, B }
        content = re.sub(r'\b(\w+)\s+as\s*(?=[\},])', r'\1', content)

        # 2. Fix string keys without values in objects 'Key', -> remove line?
        # Careful not to remove array items 'Item',
        # But 'Item' without colon is only valid in array.
        # If it was { 'Key': Value }, and Value removed -> { 'Key', } -> Invalid.
        # Use simple heuristic: if line is just whitespace "string" comma, it might be bad object prop.
        # But it could be array.
        # We can't distinguish easily without parsing.
        # But if it generated error TS1005 ':' expected, it's likely object.
        # We will count on manual fix or later passes for tricky ones, but let's try to catch obvious ones.
        # Maybe look for "Key" , at end of line.
        # content = re.sub(r'^\s*[\'"][^\'"]+[\'"]\s*,\s*$', '', content, flags=re.MULTILINE) 
        # Risky for arrays. Skip for now.
        
        # 3. Orphaned colons before punctuation (Value removed, colon left)
        # : , -> ,
        # : } -> }
        # : ) -> )
        # : ; -> ; (in interfaces)
        content = re.sub(r':\s*(?=[\,\}\)\;])', '', content)
        
        # 4. Orphaned types (Basic)
        # ( : Type ) -> ( )
        # ( : Type , -> ( ,
        # , : Type , -> , , (which becomes ,)
        # , : Type ) -> , ) (which becomes ))
        # Match colon, space, type words/chars, lookahead for punctuation.
        # Allow A[] and A<B> and A.B
        # This regex is still tricky but let's try to catch common simple ones.
        # Type chars: \w \. \[ \] \< \>
        # We want to match : TypeStr until , or ) or } or ; or =
        # But guard against matching values like { key: value }
        
        # Look for colon preceded by punctuation (meaning prop name missing)
        # (params) context: ( : type
        content = re.sub(r'(?<=[\(\,])\s*:\s*[\w\.<>\[\]\s\|&]+(?=[\,\)\=\{])', '', content)

        # 5. Cleanup punctuation combos
        content = re.sub(r',\s*,', ',', content)
        content = re.sub(r'\(\s*,', '(', content)
        content = re.sub(r',\s*\)', ')', content)
        content = re.sub(r'\{\s*,', '{', content)
        content = re.sub(r',\s*\}', '}', content)
        
        # 6. Weird arrow function leftovers: : () => void
        # if param name missing: ( : () => void )
        content = re.sub(r'(?<=[\(\,])\s*:\s*\([^)]*\)\s*=>\s*[\w\.<>\[\]]+(?=[\,\)\=])', '', content)
        
        # 7. Lines that are just a comma (from removal of items)
        content = re.sub(r'^\s*,\s*$', '', content, flags=re.MULTILINE)
        
        # 8. Lines that are just a colon (from removal of keys?)
        content = re.sub(r'^\s*:\s*$', '', content, flags=re.MULTILINE)
        
        # 9. Double semicolons ;;
        content = re.sub(r';\s*;', ';', content)

        if content != original_content:
            print(f"Repaired {filepath}")
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

if __name__ == '__main__':
    repair_files()
