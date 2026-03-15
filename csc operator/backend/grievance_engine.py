import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
import pickle
import os

MODEL_PATH = "grievance_model.pkl"

class GrievanceEngine:
    def __init__(self):
        self.pipeline = None
        self.is_trained = False
        self._load_or_train()

    def _load_or_train(self):
        if os.path.exists(MODEL_PATH):
            try:
                with open(MODEL_PATH, "rb") as f:
                    self.pipeline = pickle.load(f)
                self.is_trained = True
                print("Loaded existing Grievance NLP model.")
                return
            except Exception as e:
                print(f"Failed to load model: {e}")
                pass
        
        print("Training new Grievance NLP model...")
        self.train_model()

    def train_model(self):
        try:
            df = pd.read_csv("datasets/grievances_dataset.csv")
            if df.empty or 'complaint_text' not in df.columns:
                raise ValueError("Dataset missing or invalid.")
            
            # Use 'category' if available, otherwise 'department' as the label to predict
            df['target'] = df['category'] if 'category' in df.columns else df['department']
            
            # Some labels might be rare, but LinearSVC is robust
            X = df['complaint_text'].dropna()
            # Align Y with X drops
            df_filtered = df.loc[X.index]
            y = df_filtered['target']

            # Simple TF-IDF + Fast Linear SVM pipeline
            self.pipeline = Pipeline([
                ('tfidf', TfidfVectorizer(ngram_range=(1, 2), max_features=10000)),
                ('clf', LinearSVC(random_state=42, max_iter=2000))
            ])
            
            self.pipeline.fit(X, y)
            self.is_trained = True
            
            with open(MODEL_PATH, "wb") as f:
                pickle.dump(self.pipeline, f)
            print("Grievance NLP model trained successfully.")

        except Exception as e:
            print(f"Error training NLP model: {e}")
            self.is_trained = False

    def predict_category(self, text: str):
        if not self.is_trained or not self.pipeline:
            return "General", 0.0
            
        try:
            pred = self.pipeline.predict([text])[0]
            
            # Confidence approximation for LinearSVC (distance from decision boundary)
            decision = self.pipeline.decision_function([text])
            confidence = float(min(1.0, max(0.0, abs(decision[0].max()) / 2.0 + 0.5)))
            
            return pred, confidence
        except Exception as e:
            print(f"Prediction error: {e}")
            return "General", 0.0

# Singleton instance
engine = GrievanceEngine()

def classify_complaint(text: str):
    category, confidence = engine.predict_category(text)
    return category, confidence

if __name__ == "__main__":
    cat, conf = classify_complaint("Crop insurance claim rejected")
    print(f"Test -> Category: {cat}, Confidence: {conf:.2f}")
