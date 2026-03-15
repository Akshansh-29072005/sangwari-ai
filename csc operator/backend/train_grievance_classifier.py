import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.linear_model import LogisticRegression
import joblib
import os
import re

print("Loading SentenceTransformer model...")
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# Synthetic Training Data in Hindi, English, and Chhattisgarhi
training_data = [
    # Agriculture
    ("PM Kisan ka paisa nahi mila", "Agriculture"),
    ("My PM kisan installment is missing", "Agriculture"),
    ("khet me fertilizer nahi mil raha hai", "Agriculture"),
    ("fasal bima yojana claim pending", "Agriculture"),
    ("Mora PM kisan paisa nai aais", "Agriculture"), # Chhattisgarhi
    ("beej subsidy nahi mili", "Agriculture"),
    ("tractor loan form reject ho gaya", "Agriculture"),
    
    # Revenue
    ("income certificate pending hai", "Revenue"),
    ("caste certificate abhi tak nahi bana", "Revenue"),
    ("niwas praman patra application clear nahi hua", "Revenue"),
    ("land registry issue tehsildar office", "Revenue"),
    ("zameen ka rasid nahi mila", "Revenue"),
    ("My caste certificate application is pending for 20 days", "Revenue"),
    ("patwari not doing mutation", "Revenue"),
    ("Mora jaati praman patra nai bane he", "Revenue"), # Chhattisgarhi

    # Food & Civil Supplies
    ("ration card update nahi hua", "Food & Civil Supplies"),
    ("chawal nahi de raha hai kotedar", "Food & Civil Supplies"),
    ("BPL card pending for 2 months", "Food & Civil Supplies"),
    ("ration card mein naam jodne ka form", "Food & Civil Supplies"),
    ("Ration card name correction is delayed", "Food & Civil Supplies"),
    ("Mola ration dukan le chaur nai milis", "Food & Civil Supplies"), # Chhattisgarhi
    ("PM grib kalyan yojana ka ration nahi mila", "Food & Civil Supplies"),

    # Social Welfare
    ("widow pension abhi tak bank me nahi aayi", "Social Welfare"),
    ("old age pension band ho gaya", "Social Welfare"),
    ("divyang pension form submit kiya tha par paisa nahi mila", "Social Welfare"),
    ("Mukhyamantri pension yojana ruka hua hai", "Social Welfare"),
    ("My senior citizen pension was stopped", "Social Welfare"),
    ("Sukanya samriddhi yojana update", "Social Welfare"),
    ("Mor vidhwa pension nai aavat he", "Social Welfare"), # Chhattisgarhi

    # Education
    ("scholarship account me nahi aaya", "Education"),
    ("school uniform ka paisa pending", "Education"),
    ("college admission issue", "Education"),
    ("RTE admission problem", "Education"),
    ("school cycle yojna", "Education"),
    ("I have not received my SC/ST scholarship", "Education"),
    ("Lailaka man ke school labaris nai mile he", "Education"), # Chhattisgarhi

    # Electricity Board
    ("bijli bill bahut jyada aaya hai", "Electricity Board"),
    ("meter kharab hai badalna hai", "Electricity Board"),
    ("line kata hua hai 2 din se", "Electricity Board"),
    ("transformer jal gaya complain pending", "Electricity Board"),
    ("High electricity bill complaint", "Electricity Board"),
    ("Mor ghar ke bijli kat ge he", "Electricity Board"), # Chhattisgarhi
    ("voltage problem in our area", "Electricity Board"),

    # Public Health Engineering
    ("nal me pani nahi aa raha", "Public Health Engineering"),
    ("peene ka pani ganda hai", "Public Health Engineering"),
    ("handpump kharab hai panchayat me", "Public Health Engineering"),
    ("water supply is interrupted for last 3 days", "Public Health Engineering"),
    ("Jal jeevan mission connection not given", "Public Health Engineering"),
    ("Mor gaon me handpump bigad ge he", "Public Health Engineering"), # Chhattisgarhi

    # Transport
    ("driving license dispatch nahi hua", "Transport"),
    ("vehicle registration RC card pending", "Transport"),
    ("learning license test problem", "Transport"),
    ("RTO office is not issuing my license", "Transport"),
    ("Mor gaadi ke kaagaj nai bane he", "Transport"), # Chhattisgarhi
    ("bus permit problem", "Transport"),
]

# Convert to DataFrame
df = pd.DataFrame(training_data, columns=["text", "department"])

def preprocess_text(text):
    text = str(text).lower()
    text = re.sub(r'[^\w\s]', '', text)
    return text

print("Preprocessing text...")
df['clean_text'] = df['text'].apply(preprocess_text)

print("Generating embeddings (this may take a few seconds)...")
X_embeddings = model.encode(df['clean_text'].tolist())
y = df['department'].tolist()

print("Training Logistic Regression classifier...")
clf = LogisticRegression(random_state=42, max_iter=1000)
clf.fit(X_embeddings, y)

print("Accuracy on training data:", round(clf.score(X_embeddings, y), 2))

print("Testing with some unseen examples...")
test_queries = [
    "mera driving license ka kya hua", # Transport
    "pm kisam yojana status pending", # Agriculture
    "ration card me bacche ka naam nahi juda", # Food
    "vidhwa pension 3 mahine se nahi mili" # Social Welfare
]

test_clean = [preprocess_text(q) for q in test_queries]
test_embeds = model.encode(test_clean)
predictions = clf.predict(test_embeds)

for q, p in zip(test_queries, predictions):
    print(f"Query: '{q}' -> Predicted: {p}")

print("Saving model to disk...")
os.makedirs('models', exist_ok=True)
joblib.dump(clf, 'models/grievance_classifier.joblib')
print("Complete! Model saved to 'models/grievance_classifier.joblib'")
