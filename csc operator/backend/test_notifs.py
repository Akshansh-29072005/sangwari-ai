import requests
import time

BASE_URL = "http://localhost:8000"

def test_trigger():
    print("1. Registering a test Application...")
    app_data = {
        "citizen_name": "Demo Citizen",
        "mobile_number": "9876543210",
        "service_type": "Caste Certificate",
        "operator_id": "CSC-TEST-001"
    }
    r = requests.post(f"{BASE_URL}/applications/register", json=app_data)
    print(f"Response: {r.status_code}, {r.json()}")

    time.sleep(1)

    print("\n2. Registering a test Grievance...")
    grv_data = {
        "citizen_name": "Demo Citizen",
        "mobile": "9876543210",
        "category": "Education",
        "description": "Shortage of computer labs in government school.",
        "district": "Raipur"
    }
    r = requests.post(f"{BASE_URL}/complaint/register", json=grv_data)
    print(f"Response: {r.status_code}, {r.json()}")
    grv_id = r.json().get("grievance_id")

    time.sleep(1)

    print(f"\n3. Escalating the Grievance {grv_id}...")
    escalate_data = {
        "status": "Escalated",
        "remarks": "SLA breach detected in Raipur Education department."
    }
    r = requests.put(f"{BASE_URL}/grievances/{grv_id}/status", json=escalate_data)
    print(f"Response: {r.status_code}, {r.json()}")

if __name__ == "__main__":
    test_trigger()
