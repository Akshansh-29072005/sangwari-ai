import networkx as nx
from typing import Dict, List, Any
from database import SessionLocal, Citizen, Relationship

def build_household_graph() -> nx.Graph:
    """
    Builds a NetworkX graph representing citizens (nodes) and their relationships (edges).
    This graph structure allows for quick traversal to find family members, which is
    vital when evaluating household requirements for schemes.
    """
    db = SessionLocal()
    citizens = db.query(Citizen).all()
    relationships = db.query(Relationship).all()
    
    G = nx.Graph()
    
    # 1. Add Nodes
    for cit in citizens:
        G.add_node(
            cit.citizen_id, 
            name=cit.name,
            gender=cit.gender,
            district=cit.district,
            is_deceased=cit.is_deceased
        )
        
    # 2. Add Edges based on recorded Relationships
    for rel in relationships:
        G.add_edge(rel.citizen_1, rel.citizen_2, relation=rel.relation_type)
        
    db.close()
    return G

def get_household_members(G: nx.Graph, citizen_id: str) -> List[Dict[str, Any]]:
    """
    Given a citizen_id, returns a list of all connected components (household members),
    by traversing the relationship graph.
    """
    if citizen_id not in G.nodes:
        return []
    
    # Find all connected nodes representing the household unit
    household_node_ids = list(nx.node_connected_component(G, citizen_id))
    
    members = []
    for node_id in household_node_ids:
        # Get node attributes
        node_attr = G.nodes[node_id]
        node_attr['citizen_id'] = node_id
        members.append(node_attr)
        
    return members

if __name__ == "__main__":
    test_graph = build_household_graph()
    print(f"Graph built with {test_graph.number_of_nodes()} nodes and {test_graph.number_of_edges()} edges.")
    
    if test_graph.number_of_nodes() > 0:
        sample_node = list(test_graph.nodes)[0]
        members = get_household_members(test_graph, sample_node)
        print(f"Household members for {sample_node}:")
        for m in members:
            # handle cases where 'name' or 'citizen_id' might not be in dict if created manually wrongly
            print(f"- {m.get('name', 'Unknown')} ({m.get('citizen_id')}) [Deceased: {m.get('is_deceased', False)}]")
