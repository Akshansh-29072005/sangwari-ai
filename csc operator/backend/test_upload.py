import requests
import os
import json

base_url = "http://localhost:8000"
citizen_id = "1234"

docs = [
    ("aadhaar", r"C:\Users\ASUS\Desktop\test_documents\identity_card.png"),
    ("ration_card", r"C:\Users\ASUS\Desktop\test_documents\household_card.png"),
    ("income_certificate", r"C:\Users\ASUS\Desktop\test_documents\income_certificate.png")
]

print("--- Uploading Documents ---")
for doc_type, file_path in docs:
    with open(file_path, "rb") as f:
        files = {"file": (os.path.basename(file_path), f, "image/png")}
        data = {"citizen_id": citizen_id, "document_type": doc_type}
        
        response = requests.post(f"{base_url}/documents/upload", data=data, files=files)
        print(f"Upload {doc_type}: {response.status_code}")
        print(response.json())

print("\n--- Running Verification ---")
verify_data = {"citizen_id": citizen_id}
verify_response = requests.post(f"{base_url}/documents/verify", data=verify_data)
print(f"Verify Status: {verify_response.status_code}")
print(json.dumps(verify_response.json(), indent=2))
