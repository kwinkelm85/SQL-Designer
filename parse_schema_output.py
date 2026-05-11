import re
import csv
import sys
import os

def parse_output(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # We want to build a master list of all objects and their status in each DB
    # We will store objects in a dictionary:
    # objects[object_type][object_name] = {'DB1': status1, 'DB2': status2, 'Notes': notes}
    
    comparisons = []
    
    current_db1 = None
    current_db2 = None
    current_schema = None
    current_obj_type = None
    current_section = None
    
    # Regexes
    # COMPARING Sequences in JUSTIN@DEVJ vs JUSTIN@TSTJ
    re_comparing = re.compile(r'^COMPARING\s+(.*?)\s+in\s+([^@]+)@([^\s]+)\s+vs\s+[^@]+@([^\s]+)')
    
    # I) Sequences in JUSTIN@DEVJ but not in JUSTIN@TSTJ
    re_section_1 = re.compile(r'^I\)\s+.*')
    re_section_2 = re.compile(r'^II\)\s+.*')
    re_section_3 = re.compile(r'^III\)\s+.*')
    
    # ... FOUND: Sequence JR_REOB_SEQ
    re_found = re.compile(r'^\.\.\.\s+FOUND:\s+([^\s]+)\s+(.*)$')
    
    # ... Sequence MY_SEQ   1 columns in DEVJ, and    2 in TSTJ.
    re_diff = re.compile(r'^\.\.\.\s+([^\s]+)\s+([^\s]+)\s+(\d+)\s+.*in\s+([^,]+),\s+and\s+(\d+)\s+in\s+(.*)\.')
    
    for line in lines:
        line = line.strip()
        
        m_comp = re_comparing.match(line)
        if m_comp:
            current_obj_type = m_comp.group(1)
            current_schema = m_comp.group(2)
            current_db1 = m_comp.group(3)
            current_db2 = m_comp.group(4)
            current_section = None
            continue
            
        if re_section_1.match(line):
            current_section = 1
            continue
        elif re_section_2.match(line):
            current_section = 2
            continue
        elif re_section_3.match(line):
            current_section = 3
            continue
            
        if current_section == 1:
            m_found = re_found.match(line)
            if m_found:
                obj_name = m_found.group(2).strip()
                comparisons.append({
                    'Schema': current_schema,
                    'Object Type': m_found.group(1).upper() if m_found.group(1) else current_obj_type,
                    'Object Name': obj_name,
                    'Status': f'Exists in {current_db1} only',
                    'DB1': current_db1,
                    'DB2': current_db2,
                    'Notes': f'Missing in {current_db2}'
                })
        elif current_section == 2:
            m_found = re_found.match(line)
            if m_found:
                obj_name = m_found.group(2).strip()
                comparisons.append({
                    'Schema': current_schema,
                    'Object Type': m_found.group(1).upper() if m_found.group(1) else current_obj_type,
                    'Object Name': obj_name,
                    'Status': f'Exists in {current_db2} only',
                    'DB1': current_db1,
                    'DB2': current_db2,
                    'Notes': f'Missing in {current_db1}'
                })
        elif current_section == 3:
            m_diff = re_diff.match(line)
            if m_diff:
                obj_type = m_diff.group(1)
                obj_name = m_diff.group(2)
                count1 = m_diff.group(3)
                db1 = m_diff.group(4)
                count2 = m_diff.group(5)
                db2 = m_diff.group(6)
                
                comparisons.append({
                    'Schema': current_schema,
                    'Object Type': obj_type.upper(),
                    'Object Name': obj_name,
                    'Status': 'Differs',
                    'DB1': current_db1,
                    'DB2': current_db2,
                    'Notes': f'{count1} children in {db1}, {count2} children in {db2}'
                })

    return comparisons

def write_csv(comparisons, output_path):
    if not comparisons:
        print("No differences found or unable to parse.")
        return
        
    fieldnames = ['Schema', 'Object Type', 'Object Name', 'DB1', 'DB2', 'Status', 'Notes']
    
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for comp in comparisons:
            writer.writerow(comp)
            
    print(f"Successfully wrote {len(comparisons)} rows to {output_path}")

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(script_dir, 'Schema Comparison Output.txt')
    output_file = os.path.join(script_dir, 'Schema_Comparison_Table.csv')
    
    if os.path.exists(input_file):
        comps = parse_output(input_file)
        write_csv(comps, output_file)
    else:
        print(f"Error: {input_file} not found.")
