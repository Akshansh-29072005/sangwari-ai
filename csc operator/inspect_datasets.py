import pandas as pd
import json

datasets = [
    "backend/datasets/citizens_master.csv",
    "backend/datasets/scheme_rules.csv",
    "backend/datasets/schemes.csv",
    "backend/datasets/scheme_applications.csv"
]

out = {}
for ds in datasets:
    try:
        df = pd.read_csv(ds)
        out[ds] = {
            "columns": df.columns.tolist(),
            "first_row": df.head(1).to_dict('records')
        }
    except Exception as e:
        out[ds] = str(e)
        
with open('dataset_info.json', 'w') as f:
    json.dump(out, f, indent=2, default=str)
