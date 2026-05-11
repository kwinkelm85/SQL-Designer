import pandas as pd
import numpy as np
import analyze_sequences

print("Loading data...")
source_file = 'DA_DESCRIBE JUSTIN.xlsx'
df = pd.read_excel(source_file, sheet_name='Packages')

res = analyze_sequences.analyze_sheet(df, 'Packages')
presence_matrix = res[0]
priv_matrix = res[5]

print("Total unique packages:", len(presence_matrix))

for db in ['DEVJ', 'SIJ']:
    if db in presence_matrix.columns:
        ex = (presence_matrix[db] == 'Exists').sum()
        ms = (presence_matrix[db] == 'Missing').sum()
        gr = 0
        if priv_matrix is not None and not priv_matrix.empty and db in priv_matrix.columns:
            gr = (priv_matrix[db] == 'Missing').sum()
            
        print(f"\n[{db}]")
        print(f"Exists objects: {ex}")
        print(f"Missing objects: {ms}")
        print(f"Missing grants: {gr}")
        print(f"Total DDL statements: {ms + gr}")
        print(f"Consistency: {(ex / len(presence_matrix))*100:.1f}%")
