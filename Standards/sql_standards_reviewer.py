import sys
import re
import argparse
from pathlib import Path

# Data Architecture Standards Checks for Oracle (v5.9)

AUDIT_COLUMNS = {'ent_dtm', 'ent_user_id', 'upd_dtm', 'upd_user_id'}
LEGACY_AUDIT_COLUMNS = {'ent_dt', 'ent_user_id', 'upd_dt', 'upd_user_id'}

def check_table_name(table_name, line_num):
    violations = []
    if len(table_name) > 30:
        violations.append(f"Line {line_num}: Table name '{table_name}' exceeds 30 characters.")
    
    upper_name = table_name.upper()
    if upper_name.endswith('TABLE') or upper_name.endswith('FILE'):
        violations.append(f"Line {line_num}: Table name '{table_name}' must not include physical constructs like 'TABLE' or 'FILE'.")
        
    return violations

def check_view_name(view_name, line_num):
    violations = []
    if len(view_name) > 30:
        violations.append(f"Line {line_num}: View name '{view_name}' exceeds 30 characters.")
    
    if not view_name.upper().endswith('_VW'):
        violations.append(f"Line {line_num}: View name '{view_name}' must be suffixed with '_VW'.")
        
    return violations

def check_column_name(col_name, line_num):
    violations = []
    if len(col_name) > 30:
        violations.append(f"Line {line_num}: Column name '{col_name}' exceeds 30 characters.")
    return violations

def check_constraint_name(constraint_name, constraint_type, line_num):
    violations = []
    upper_name = constraint_name.upper()
    
    pk_pattern = re.compile(r'^.*_PK$')
    fk_pattern = re.compile(r'^.*_FK(\d+)?$')
    uk_pattern = re.compile(r'^.*_UK(\d+)?$')
    ck_pattern = re.compile(r'^.*_CK(\d+)?$')
    
    if 'PRIMARY KEY' in constraint_type:
        if not pk_pattern.match(upper_name):
            violations.append(f"Line {line_num}: Primary key constraint '{constraint_name}' must end with '_PK'.")
    elif 'FOREIGN KEY' in constraint_type:
        if not fk_pattern.match(upper_name):
            violations.append(f"Line {line_num}: Foreign key constraint '{constraint_name}' must end with '_FK' or '_FKn'.")
    elif 'UNIQUE' in constraint_type:
        if not uk_pattern.match(upper_name):
            violations.append(f"Line {line_num}: Unique key constraint '{constraint_name}' must end with '_UK' or '_UKn'.")
    elif 'CHECK' in constraint_type:
        if not ck_pattern.match(upper_name):
            violations.append(f"Line {line_num}: Check constraint '{constraint_name}' must end with '_CK' or '_CKn'.")
            
    return violations

def review_sql_file(file_path):
    violations = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
         print(f"Error reading file {file_path}: {e}")
         return

    # Remove single line comments
    content_no_comments = re.sub(r'--.*$', '', content, flags=re.MULTILINE)
    # Remove block comments
    content_no_comments = re.sub(r'/\*.*?\*/', '', content_no_comments, flags=re.DOTALL)
    
    lines = content_no_comments.split('\n')
    
    in_table = False
    current_table = ""
    current_table_columns = set()
    table_start_line = 0
    
    for i, line in enumerate(lines, 1):
        line = line.strip()
        if not line:
            continue
            
        # Match CREATE TABLE
        create_table_match = re.match(r'CREATE\s+TABLE\s+([A-Za-z0-9_]+)', line, re.IGNORECASE)
        if create_table_match:
            table_name = create_table_match.group(1)
            violations.extend(check_table_name(table_name, i))
            in_table = True
            current_table = table_name
            current_table_columns = set()
            table_start_line = i
            continue
            
        # Match CREATE VIEW
        create_view_match = re.search(r'CREATE\s+(?:OR\s+REPLACE\s+)?VIEW\s+([A-Za-z0-9_]+)', line, re.IGNORECASE)
        if create_view_match:
            view_name = create_view_match.group(1)
            violations.extend(check_view_name(view_name, i))
            continue
            
        # Match end of table definition
        if in_table and (line.startswith(')') or line.startswith(');') or line == ')'):
            lower_cols = {c.lower() for c in current_table_columns}
            
            if not (AUDIT_COLUMNS.issubset(lower_cols) or LEGACY_AUDIT_COLUMNS.issubset(lower_cols)):
                missing = AUDIT_COLUMNS - lower_cols
                violations.append(f"Line {table_start_line}: Table '{current_table}' is missing required audit columns: {', '.join(missing)}")
                
            in_table = False
            current_table = ""
            current_table_columns = set()
            continue
            
        # Parse columns and embedded constraints inside CREATE TABLE
        if in_table:
            constraint_match = re.match(r'(?:[,]?[ \t]*)?CONSTRAINT\s+([A-Za-z0-9_]+)\s+(PRIMARY KEY|FOREIGN KEY|UNIQUE|CHECK)', line, re.IGNORECASE)
            if constraint_match:
                c_name = constraint_match.group(1)
                c_type = constraint_match.group(2).upper()
                violations.extend(check_constraint_name(c_name, c_type, i))
            else:
                # Basic column extraction
                # Removing leading commas and quotes
                clean_line = line.lstrip(',').strip()
                parts = clean_line.split()
                if parts:
                    first_token = parts[0].strip('",')
                    if first_token.upper() not in ['PRIMARY', 'FOREIGN', 'UNIQUE', 'CHECK', 'CONSTRAINT']:
                        current_table_columns.add(first_token)
                        violations.extend(check_column_name(first_token, i))
                        
        # Match ALTER TABLE constraints
        alter_table_match = re.search(r'ALTER\s+TABLE\s+[A-Za-z0-9_]+\s+ADD\s+(?:CONSTRAINT\s+)?([A-Za-z0-9_]+)\s+(PRIMARY KEY|FOREIGN KEY|UNIQUE|CHECK)', line, re.IGNORECASE)
        if alter_table_match:
            c_name = alter_table_match.group(1)
            c_type = alter_table_match.group(2).upper()
            violations.extend(check_constraint_name(c_name, c_type, i))

    if not violations:
        print(f"[PASS] File {file_path.name} conforms to the data architecture standards.")
    else:
        print(f"[FAIL] Found {len(violations)} standard violations in {file_path.name}:\n")
        for v in violations:
            print("- " + v)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Review SQL DDL against Ministry Data Architecture Standards.')
    parser.add_argument('sql_file', type=str, help='Path to the SQL file to review.')
    args = parser.parse_args()
    
    file_path = Path(args.sql_file)
    if not file_path.exists():
        print(f"Error: File {file_path} not found.")
        sys.exit(1)
        
    review_sql_file(file_path)
