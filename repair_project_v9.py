import os
import re

def repair_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content

    # 1. Fix "param: type: type" (double type annotation)
    # e.g. frequencyValue: string: string -> frequencyValue: string
    # Regex: : type : type (where type is same word)
    # Match: :\s*([a-zA-Z0-9_]+)\s*:\s*\1
    content = re.sub(r':\s*([a-zA-Z0-9_]+)\s*:\s*\1', r': \1', content)

    # 2. Fix duplicate argument names in function lines
    # e.g. calculatePayPalRevenue(connection, arg_Date, arg_Date)
    # We process line by line.
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        # Find all "arg_Type" patterns
        matches = list(re.finditer(r'(arg_[a-zA-Z0-9_]+)', line))
        if len(matches) > 1:
            seen = {}
            # We need to replace duplicates.
            # Convert line to chars to edit in place or string manipulation?
            # Easier: replace tokens if they appear multiple times.
            # But we must be careful with positions.
            
            # Simple approach: Reconstruct the line? Slower.
            # Let's count specific arg names.
            # If "arg_Date" count > 1.
            # Replace first instance, ignore. Replace second with arg_Date_2.
            
            # Find all unique arg names in this line
            arg_names = set(m.group(1) for m in matches)
            for name in arg_names:
                count = line.count(name)
                if count > 1:
                    # We have duplicates.
                    # Replace occurences one by one?
                    # "arg_Date ... arg_Date"
                    # We want "arg_Date ... arg_Date_2 ... arg_Date_3"
                    
                    # Regex sub with callback?
                    wrapper = {"counter": 1}
                    def repl(m):
                        c = wrapper["counter"]
                        wrapper["counter"] += 1
                        if c == 1:
                            return name
                        return f"{name}_{c}"
                    
                    # Use re.sub but only for this specific name on this line
                    # Escape name for regex
                    pattern = re.escape(name)
                    # Use word boundary to match exact arg name?
                    # arg_Date matches arg_Date.
                    # arg_Date vs arg_Date_foo.
                    pattern = r'\b' + pattern + r'\b'
                    line = re.sub(pattern, repl, line)
        new_lines.append(line)
    
    content = '\n'.join(new_lines)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

def main():
    print("Starting repair v9...")
    for root, dirs, files in os.walk("."):
        if "node_modules" in root or ".next" in root or ".git" in root:
            continue
        for file in files:
            if file.endswith(".ts") or file.endswith(".tsx"):
                repair_file(os.path.join(root, file))
    print("Repair v9 complete.")

if __name__ == "__main__":
    main()
