import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import os

def create_synthetic_data(num_samples=1000):
    departments = ["Agriculture", "Food Supply", "Revenue", "PHE", "Health", "Education", "Panchayat", "Police"]
    
    # Mapping departments to specific complaint types for realism
    complaint_types = {
        "Agriculture": ["crop insurance", "pm kisan delay", "fertilizer shortage", "seed quality"],
        "Food Supply": ["ration card update", "ration shop closed", "quality of rice"],
        "Revenue": ["land record correction", "income certificate delay", "caste certificate issue"],
        "PHE": ["water supply issue", "handpump repair", "pipeline leakage"],
        "Health": ["hospital staff absence", "medicine shortage", "ambulance delay"],
        "Education": ["teacher absence", "scholarship delay", "school building repair"],
        "Panchayat": ["nrega wage delay", "panchayat fund issue", "street light repair"],
        "Police": ["station not registering fir", "patrolling issue", "traffic problem"]
    }
    
    districts = ["Raipur", "Bilaspur", "Durg", "Bastar", "Korba", "Raigarh", "Surguja", "Rajnandgaon", "Janjgir-Champa"]
    
    # Base SLA days in days
    base_sla = {
        "Agriculture": 7,
        "Food Supply": 3,
        "Revenue": 5,
        "PHE": 2,
        "Health": 1,
        "Education": 4,
        "Panchayat": 6,
        "Police": 2
    }
    
    data = []
    
    np.random.seed(42)
    
    for _ in range(num_samples):
        department = np.random.choice(departments)
        category = np.random.choice(complaint_types[department])
        district = np.random.choice(districts)
        
        # Calculate resolution days based on base SLA + some noise + penalty for certain districts
        days = base_sla[department]
        
        # Add random noise (normal distribution)
        noise = np.random.normal(loc=0.0, scale=1.5)
        
        # District penalty (rural districts might take longer)
        if district in ["Bastar", "Surguja"]:
            noise += 2.0
            
        resolution_days = max(1, int(round(days + noise))) # Ensure at least 1 day
        
        data.append({
            "complaint_type": category,
            "department": department,
            "district": district,
            "resolution_time_days": resolution_days
        })
        
    return pd.DataFrame(data)

def train_and_save_model():
    print("Generating synthetic dataset for SLA prediction...")
    df = create_synthetic_data(2000)
    
    X = df[["complaint_type", "department", "district"]]
    y = df["resolution_time_days"]
    
    print("Building model pipeline...")
    # Preprocessor for categorical features
    categorical_features = ["complaint_type", "department", "district"]
    categorical_transformer = OneHotEncoder(handle_unknown="ignore")
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", categorical_transformer, categorical_features)
        ]
    )
    
    # Define the Random Forest Regressor model
    model = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("regressor", RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Regressor model...")
    model.fit(X_train, y_train)
    
    # Evaluate score
    score = model.score(X_test, y_test)
    print(f"Model R^2 Score on test set: {score:.4f}")
    
    # Save the model
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/sla_model.joblib")
    print("Model saved successfully to models/sla_model.joblib")

if __name__ == "__main__":
    train_and_save_model()
