import re
import os

def fix_files():
    log_file = 'tsc_output.txt'
    if not os.path.exists(log_file):
        print("Log file not found")
        return

    with open(log_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Map file -> set of unused vars
    unused_map = {}
    
    # Valid formats: file.ts(1,1): error ... OR file.ts:1:1 - error ...
    ts6133_re = re.compile(r"([^\(:]+?)[\(:](\d+)[,\d]*[\):]:?\s*(?:-\s*)?error TS6133: '([^']+)' is declared")
    
    # Regex for TS6192 (All imports unused)
    ts6192_re = re.compile(r"([^\(:]+?)[\(:](\d+)[,\d]*[\):]:?\s*(?:-\s*)?error TS6192:")

    for line in lines:
        m = ts6133_re.search(line)
        if m:
            filepath, lineno, varname = m.groups()
            filepath = filepath.strip()
            # Normalize path
            if not os.path.isabs(filepath):
                 filepath = os.path.abspath(filepath)
            
            if filepath not in unused_map:
                unused_map[filepath] = []
            unused_map[filepath].append({'line': int(lineno), 'var': varname, 'type': 'single'})
            continue

        m2 = ts6192_re.search(line)
        if m2:
            filepath, lineno = m2.groups()
            filepath = filepath.strip()
            if not os.path.isabs(filepath):
                 filepath = os.path.abspath(filepath)
            
            if filepath not in unused_map:
                unused_map[filepath] = []
            unused_map[filepath].append({'line': int(lineno), 'type': 'all'})

    # Process files
    for filepath, errors in unused_map.items():
        if not os.path.exists(filepath):
            print(f"File not found: {filepath}")
            continue
            
        print(f"Processing {filepath}")
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.readlines()
        except Exception as e:
            print(f"Error reading {filepath}: {e}")
            continue

        # Sort errors by line descending to avoid index shifting if we delete lines
        # But for 'single', we act on the same line.
        # Ensure we don't modify the same line multiple times conflictingly.
        
        # Group by line
        line_errors = {}
        for err in errors:
            ln = err['line']
            if ln not in line_errors:
                line_errors[ln] = []
            line_errors[ln].append(err)

        modified = False
        
        # Process lines from bottom to top?
        # Actually, line numbers are 1-based.
        sorted_lines = sorted(line_errors.keys(), reverse=True)
        
        for ln in sorted_lines:
            idx = ln - 1
            if idx >= len(content):
                continue
            
            line_errs = line_errors[ln]
            original_line = content[idx]
            new_line = original_line

            # Check for 'all' type
            is_all = any(e['type'] == 'all' for e in line_errs)
            if is_all:
                # Remove the entire import statement (or Replace with empty line to keep line numbers valid matching other errors?)
                # If we remove line, other errors in this file referring to lower lines might break if we rely on line numbers.
                # But here we are processing one batch. 
                # If I remove line 5, line 100 becomes 99.
                # But my error list has line 100.
                # So I should generally avoiding changing line count if possible, or process bottom up.
                # Since I'm processing bottom up, removing lines is SAFE for higher up lines.
                # BUT, removing line 5 affects line 100? No, checking 100 first (bottom up).
                # Wait: 100 is processed. Then 5 is processed.
                # So changing 100 doesn't affect 5. Changing 5 doesn't affect 100's processing since it's already done?
                # Yes. Process bottom up.
                
                # Removing line:
                # content[idx] = "" # Empty line
                # OR delete it.
                # If I delete it, I must be careful.
                # Just replace with empty string to be safe and maintain file structure for now.
                content[idx] = "\n" 
                modified = True
                continue

            # Handle 'single' vars
            vars_to_remove = [e['var'] for e in line_errs if e['type'] == 'single']
            if not vars_to_remove:
                continue

            # Try to regex replace imports
            # import { A, B, C } from ...
            # Remove B
            
            # Simple approach: remove the word from the line if it looks like an import specifier.
            # Be careful not to remove substrings.
            
            for var in vars_to_remove:
                # Regex: comma? whitespace? var whitespace? comma?
                # We want to remove 'var' from '{ ... }'.
                
                # Strategy: 
                # 1. Check if line has this variable.
                # 2. replace `, var` or `var,` or `var`
                
                # Case 1: `import { logger, logInfo } ...` -> rm `logger, ` -> `import { logInfo } ...`
                # Case 2: `import { logInfo, logger } ...` -> rm `, logger` -> `import { logInfo } ...`
                # Case 3: `import { logger } ...` -> rm `logger` -> `import { }` (which is technically TS6192 often, but sometimes not caught).
                
                # Regex must match word boundary
                pattern = r'(?<=[\{\,])\s*\b' + re.escape(var) + r'\b\s*,?'  # Matches ` logger,`
                
                # Try replacing ` logger,`
                subbed = re.sub(pattern, '', new_line)
                
                if subbed == new_line:
                    # Try `, logger`
                    pattern2 = r',?\s*\b' + re.escape(var) + r'\b(?=\s*[\}\,])'
                    subbed = re.sub(pattern2, '', new_line)
                
                new_line = subbed

            # Cleanup empty braces import { } often left over?
            # Or if line became `import { } from ...`
            # Re-check.
            if new_line != original_line:
                # Fix double commas or trailing commas if regex failed slightly
                # Not standard but maybe ok.
                # If `import { } from ...` -> remove line?
                if re.search(r'import\s*\{\s*\}\s*from', new_line):
                    new_line = "\n"
                
                content[idx] = new_line
                modified = True

        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.writelines(content)

if __name__ == '__main__':
    fix_files()
