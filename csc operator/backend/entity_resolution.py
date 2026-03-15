import pandas as pd
from rapidfuzz import fuzz
from rapidfuzz.distance import Levenshtein
from database import SessionLocal, Citizen
from typing import List, Tuple

def calculate_similarity_score(cit1: Citizen, cit2: Citizen) -> float:
    """
    Calculates a composite similarity score between two Citizen records.
    Considers Name (Fuzzy Match), Address (Fuzzy Match), and District (Exact Match).
    Returns a score between 0 and 100.
    """
    # Exact District match is a strong feature, differing districts reduce likelihood heavily
    district_score = 100 if cit1.district == cit2.district else 0

    # Name similarity using RapidFuzz
    name_score = fuzz.ratio(cit1.name, cit2.name)

    # Address similarity
    addr_score = fuzz.token_sort_ratio(cit1.address, cit2.address)

    # Weighted Average
    # Name: 50%, Address: 30%, District: 20%
    composite_score = (name_score * 0.5) + (addr_score * 0.3) + (district_score * 0.2)
    return composite_score

def resolve_entities():
    """
    A naive entity resolution strategy (O(N^2) for simplicity in demo).
    Iterates through all citizens, calculates similarity scores,
    and identifies duplicates/matches above a threshold (e.g., 85%).
    In reality, we would use blocking/indexing before pairwise comparison.
    """
    db = SessionLocal()
    citizens = db.query(Citizen).all()
    
    matches: List[Tuple[Citizen, Citizen, float]] = []
    threshold = 80.0
    
    print(f"Starting Entity Resolution for {len(citizens)} citizens...")

    for i in range(len(citizens)):
        for j in range(i + 1, len(citizens)):
            cit1 = citizens[i]
            cit2 = citizens[j]
            score = calculate_similarity_score(cit1, cit2)
            
            if score >= threshold:
                matches.append((cit1, cit2, score))
                print(f"Match found: {cit1.name} <-> {cit2.name} (Score: {score:.2f})")
                
                # In a real system, we assign them the same `global_id` or merge records.
                # Here we are just logging the discovery of potential matches.
    
    db.close()
    print(f"Entity Resolution completed. Found {len(matches)} potential merges.")
    return matches

if __name__ == "__main__":
    resolve_entities()
