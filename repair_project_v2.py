import os
import re

def repair_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content

    # 1. Fix missing param name in signature: (req: Type, : ResType) -> (req: Type, res: ResType)
    # Pattern: , : Type
    # We replace with , arg_N: Type. 
    # But to be safe, we can try to infer common names or just use placeholders.
    # Case: ((req: express.Request,: express.Response
    content = re.sub(r',\s*:\s*express\.Response', r', res: express.Response', content)
    content = re.sub(r',\s*:\s*NextFunction', r', next: NextFunction', content)
    # Generic case: , : Type -> , arg: Type
    content = re.sub(r',\s*:\s*([A-Z][a-zA-Z0-9\.]*)', r', arg_\1: \1', content)
    
    # 2. Fix broken generics where type was removed
    # e.g. Promise< | null> -> Promise<any>
    # My previous script removed | null>, leaving Promise<
    # So look for Type< at end of word boundary?
    # e.g. : Promise<,
    content = re.sub(r':\s*Promise<\s*,', r': Promise<any,', content)
    # e.g. : Promise<) or : Promise<; or : Promise<}
    # This is hard.
    
    # 3. Fix "Identifier Expected" at start of file or lines.
    # If lines look like: "  Crown," (from import list that corrupted)
    # But imports are usually inside { }.
    # If "import {" line is valid, but subsequent lines are just names.
    # Logic in v1 fixed imports.
    
    # 4. Fix specific files found in error log
    # app/dashboard/agents/page.tsx error TS1128.
    
    # Fix import { , A } again (in case v1 missed some)
    content = re.sub(r'import\s*\{\s*,', r'import { ', content)

    # 5. Fix arrow functions broken by previous scripts?
    # No, v1 didn't break arrow functions.
    
    # 6. Fix "Declaration or statement expected" often means `const` keyword missing or garbage.
    # e.g. " , Crown" -> "// , Crown"
    # Lines starting with comma?
    content = re.sub(r'^\s*,.*$', r'// \g<0>', content, flags=re.MULTILINE)

    if content != original_content:
        # Cleanup "arg_express.Response" -> "arg_express_Response" (invalid identifier char .)
        content = content.replace("arg_express.Response", "res") 
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

def main():
    print("Starting repair v2...")
    for root, dirs, files in os.walk("."):
        if "node_modules" in root or ".next" in root or ".git" in root:
            continue
        for file in files:
            if file.endswith(".ts") or file.endswith(".tsx"):
                repair_file(os.path.join(root, file))
    print("Repair v2 complete.")

if __name__ == "__main__":
    main()
