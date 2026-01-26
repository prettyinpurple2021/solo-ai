import re
import os

def repair_files():
    log_file = 'tsc_output_2.txt'
    if not os.path.exists(log_file):
        print("Log file not found")
        return

    with open(log_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    files_to_process = set()
    # Extract filenames from tsc output
    # app/api/briefcase/files/[id]/permissions/route.ts(12,31): error ...
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
            
        print(f"Repairing {filepath}")
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {filepath}: {e}")
            continue

        original_content = content

        # Fix specific patterns
        
        # 1. import, 
        content = re.sub(r'import\s*,', 'import ', content)
        
        # 2. Orphaned type annotations: : Type (not preceded by word char)
        # Handle generic types roughly too <...>
        # Be careful not to match valid ternary or object punctuation? 
        # Valid: { key: value } -> : preceded by word.
        # Valid: function(a: Type) -> : preceded by a.
        # Invalid: function(: Type) -> : preceded by (.
        # Invalid: function(a: Type, : Type) -> : preceded by ,
        # Note: We assumed we only broke it by removing variables where we left the colon.
        # Regex: (?<!\w)\s*:\s*[a-zA-Z0-9_<>\[\]\.]+(?:\[\])?
        
        # We need to run this multiple times potentially if cleaning up commas makes new ones appear? 
        # No, comma cleanup is separate.
        
        content = re.sub(r'(?<!\w)\s*:\s*[a-zA-Z0-9_\.<>\[\]]+', '', content)
        
        # 3. Clean up commas in various contexts
        
        # Double commas ,, -> ,
        content = re.sub(r',\s*,', ',', content)
        
        # { , -> {
        content = re.sub(r'\{\s*,', '{', content)
        
        # , } -> }
        content = re.sub(r',\s*\}', '}', content)
        
        # ( , -> (
        content = re.sub(r'\(\s*,', '(', content)
        
        # , ) -> )
        content = re.sub(r',\s*\)', ')', content)
        
        # Line starting with comma? 
        # inside imports:
        # import {
        #   A,
        #   ,
        #   B
        # }
        # Regex multiline?
        # Remove lines that are just comma
        content = re.sub(r'^\s*,\s*$', '', content, flags=re.MULTILINE)

        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

if __name__ == '__main__':
    repair_files()
