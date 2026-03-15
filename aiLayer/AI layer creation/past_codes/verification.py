def validate_application(data, schema):

    errors = []

    for field, rules in schema["fields"].items():

        value = data.get(field)

        # required check
        if rules.get("required") and value is None:
            errors.append(f"{field} is required")
            continue

        if value is None:
            continue

        # type check
        if rules["type"] == "integer":
            if not isinstance(value, int):
                errors.append(f"{field} must be integer")

        if rules["type"] == "number":
            if not isinstance(value, (int,float)):
                errors.append(f"{field} must be numeric")

        if rules["type"] == "string":
            if len(value) < rules.get("min_length",0):
                errors.append(f"{field} too short")

        # min max
        if "min" in rules and value < rules["min"]:
            errors.append(f"{field} below minimum")

        if "max" in rules and value > rules["max"]:
            errors.append(f"{field} exceeds limit")

        # category validation
        if rules["type"] == "category":
            if value not in rules["allowed"]:
                errors.append(f"{field} invalid category")

    return errors

VAGUE_WORDS = ["unknown","na","none","something","many"]

def vague_detection(data):

    issues = []

    for field,value in data.items():

        if isinstance(value,str):

            if value.lower() in VAGUE_WORDS:
                issues.append(f"{field} contains vague value")

    return issues


from sklearn.ensemble import IsolationForest

model = IsolationForest(contamination=0.05)

model.fit(training_vectors)

if model.predict([features])[0] == -1:
    anomaly = True


def verify_application(data, schema):

    errors = []

    errors += validate_application(data, schema)

    errors += vague_detection(data)

    if errors:
        status = "REJECTED"
        confidence = 90 - len(errors)*5

    else:
        status = "APPROVED"
        confidence = 90

    return {

        "status": status,
        "confidence_score": confidence,
        "reasons": errors
    }