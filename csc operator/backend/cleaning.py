import re

def clean_name(name: str) -> str:
    """Normalizes names by removing extra spaces, special chars, and case differences."""
    if not isinstance(name, str):
        return ""
    name = name.lower()
    name = re.sub('[^a-z ]', '', name)
    # Remove multiple spaces
    name = re.sub(' +', ' ', name)
    return name.strip()

def standardize_address(address: str) -> str:
    """Standardize addresses to lowercase and strip whitespace."""
    if not isinstance(address, str):
        return ""
    address = address.lower()
    # Simple mockup: in reality this maps village/district/state formats
    return address.strip()

def normalize_script(text: str) -> str:
    """Mock implementation of Hindi-to-Latin transliteration."""
    # Since we are mocking the datasets, we just do a basic passthrough or placeholder mapping
    # E.g. replacing common hindi text variations to standard english
    mapping = {
        "debi": "devi",
        "kumari": "kumari",
    }
    words = text.split()
    return " ".join([mapping.get(w, w) for w in words])
