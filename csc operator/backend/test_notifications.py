import requests
import json

BASE_URL = "http://localhost:8000"

def test_notifications():
    print("1. Fetching candidates...")
    r = requests.get(f"{BASE_URL}/eligible-candidates")
    data = r.json()['data']
    
    # Find Sunita Yadav (ID 1004) for Scheme 2
    sunita = next((c for c in data if c['citizen_id'] == 1004 and c['scheme_id'] == 2), None)
    if not sunita:
        print("FAIL: Sunita Yadav not found in eligible list")
        return
        
    print(f"Sunita Notified before: {sunita['notified']}")
    
    print("2. Sending individual notification...")
    r_send = requests.post(f"{BASE_URL}/notifications/send", json={
        "citizen_id": 1004,
        "scheme_id": 2,
        "message": "Custom test message for Sunita"
    })
    print(f"Send Response: {r_send.json()}")
    
    print("3. Verifying status change...")
    r_after = requests.get(f"{BASE_URL}/eligible-candidates")
    sunita_after = next((c for c in r_after.json()['data'] if c['citizen_id'] == 1004 and c['scheme_id'] == 2), None)
    print(f"Sunita Notified after: {sunita_after['notified']}")
    
    print("4. Testing broadcast for Scheme 2 (Widow Pension)...")
    r_broad = requests.post(f"{BASE_URL}/notifications/broadcast", json={"scheme_id": 2})
    print(f"Broadcast Response: {r_broad.json()}")

test_notifications()
