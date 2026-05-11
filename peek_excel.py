import pandas as pd
import sys

def main():
    try:
        df = pd.read_excel('DA_DESCRIBE JUSTIN Sequence Data (2026-03-24).xlsx', sheet_name='Sheet6')
        with open('sheet6_structure.txt', 'w', encoding='utf-8') as f:
            f.write("COLUMNS:\n")
            for col in df.columns:
                f.write(f"- {col}\n")
            f.write("\nHEAD (First 2 rows):\n")
            f.write(df.head(2).to_csv(index=False))
        print("Done")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
