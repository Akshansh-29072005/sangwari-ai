import pandas as pd
import os

citizens_path = r"c:\Users\ASUS\Desktop\csc operator\backend\datasets\citizens_master.csv"
apps_path = r"c:\Users\ASUS\Desktop\csc operator\backend\datasets\scheme_applications.csv"

# Update Citizens
df = pd.read_csv(citizens_path)

# Ensure marital_status column exists
if 'marital_status' not in df.columns:
    df['marital_status'] = 'Married' # Default to Married

# Case 1: Citizen 1001 (Ramesh Kumar) - Eligible for Old Age Pension
# Age is 68, Income is 50495. Just ensure it's < 200,000 and not gov emp.
# He is already Farmer, 50495. He should be eligible.
# I'll lower his income just to be safe.
df.loc[df['citizen_id'] == 1001, 'annual_income'] = 45000

# Case 2: Citizen 1004 (Sunita Yadav) - Eligible for Widow Pension
# Rule: Female, Widow, Income < 180,000, Age 18-79.
# Her age is 81. Let's make her 75.
df.loc[df['citizen_id'] == 1004, 'age'] = 75
df.loc[df['citizen_id'] == 1004, 'marital_status'] = 'Widow'
df.loc[df['citizen_id'] == 1004, 'annual_income'] = 120000

# Case 3: Citizen 1002 (Hemant Kosare 1) - Eligible for Scholarship
# Rule: Student, Income < 300,000, Age 14-28.
# He is age 25. Let's make him Student.
df.loc[df['citizen_id'] == 1002, 'occupation'] = 'Student'
df.loc[df['citizen_id'] == 1002, 'annual_income'] = 150000

# Case 4: Citizen 1009 (Mahesh Sahu) - Eligible for Family Assistance (Scheme 5)
# Rule: Farmer/Labour/Unemployed, Income < 150,000, Age >= 18.
# He is age 69, Carpenter (not in rules). Let's make him Labour.
df.loc[df['citizen_id'] == 1009, 'occupation'] = 'Labour'
df.loc[df['citizen_id'] == 1009, 'annual_income'] = 85000

df.to_csv(citizens_path, index=False)
print("Updated citizens_master.csv")

# Update Applications
df_apps = pd.read_csv(apps_path)

# Mark Citizen 1001 as "already enrolled" for Scheme 1
# We need to add a row if it doesn't exist, or update.
# 1001 is not in the first few lines, let's see if he is in the file.
if 1001 not in df_apps['citizen_id'].values:
    new_row = {
        'application_id': df_apps['application_id'].max() + 1,
        'citizen_id': 1001,
        'scheme_id': 1,
        'application_data_json': '{"note": "Auto-enrolled for demo"}',
        'approval_confidence': 95,
        'status': 'approved'
    }
    df_apps = pd.concat([df_apps, pd.DataFrame([new_row])], ignore_index=True)
else:
    df_apps.loc[(df_apps['citizen_id'] == 1001) & (df_apps['scheme_id'] == 1), 'status'] = 'approved'

df_apps.to_csv(apps_path, index=False)
print("Updated scheme_applications.csv")
