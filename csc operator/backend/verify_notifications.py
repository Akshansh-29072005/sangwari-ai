import urllib.request, json

def test_flow():
    base_url = "http://localhost:8000"
    
    # 1. Register Grievance
    reg_data = {
        "citizen_name": "Test Citizen",
        "mobile": "9998887776",
        "aadhaar_number": "1234-5678-9012",
        "district": "Raipur",
        "complaint_text": "Electricity issue in my area for two days."
    }
    
    req = urllib.request.Request(f"{base_url}/grievances/register", data=json.dumps(reg_data).encode(), headers={"Content-Type": "application/json"})
    resp = json.loads(urllib.request.urlopen(req).read())
    g_id = resp["grievance_id"]
    print(f"Registered grievance ID: {g_id}")
    
    # 2. Check Notification
    notifs = json.loads(urllib.request.urlopen(f"{base_url}/grievances/notifications").read())
    latest = notifs[0]
    print(f"Latest Notification Message: {latest['message']}")
    assert "registered" in latest['message'].lower()
    
    # 3. Update Status
    update_data = {"status": "Under Investigation"}
    req = urllib.request.Request(f"{base_url}/grievances/{g_id}/status", data=json.dumps(update_data).encode(), method="PUT", headers={"Content-Type": "application/json"})
    urllib.request.urlopen(req).read()
    print("Updated status to Under Investigation")
    
    # 4. Check new Notification
    notifs = json.loads(urllib.request.urlopen(f"{base_url}/grievances/notifications").read())
    latest = notifs[0]
    print(f"New Notification Message: {latest['message']}")
    assert "under investigation" in latest['message'].lower()
    
    # 5. Check tracking
    track = json.loads(urllib.request.urlopen(f"{base_url}/track?mobile=9998887776").read())
    print(f"Tracking results for mobile 9998887776: {len(track)} found")
    assert len(track) > 0
    assert track[0]['status'] == "Under Investigation"
    assert len(track[0]['notifications']) >= 2
    
    print("Verification Successful!")

if __name__ == "__main__":
    test_flow()
