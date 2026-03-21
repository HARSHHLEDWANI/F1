"""
Populate track images from Wikipedia API
"""
import os
import json
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import requests

load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

# Wikipedia API headers
HEADERS = {
    "User-Agent": "F1-Predictor (https://f1predictor.app)",
}

# Map of track names to Wikipedia page titles for better image fetching
TRACK_WIKIPEDIA_NAMES = {
    "Bahrain International Circuit": "Bahrain International Circuit",
    "Albert Park Grand Prix Circuit": "Albert Park Grand Prix Circuit",
    "Baku City Circuit": "Baku City Circuit",
    "Circuit de Barcelona-Catalunya": "Circuit de Barcelona-Catalunya",
    "Hungaroring": "Hungaroring",
    "Monaco Grand Prix": "Circuit de Monaco",
    "Autodromo di Monza": "Autodromo Nazionale di Monza",
    "Silverstone Circuit": "Silverstone Circuit",
    "Hockenheimring": "Hockenheimring",
    "Belgian Grand Prix": "Circuit de Spa-Francorchamps",
    "Red Bull Ring": "Red Bull Ring",
    "Autodromo José María de los Reyes": "Istanbul Park",
    "Suzuka Circuit": "Suzuka Circuit",
    "Marina Bay Street Circuit": "Marina Bay Street Circuit",
    "Singapore Grand Prix": "Marina Bay Street Circuit",
    "Lazio Lake Circuit": "Lazio",
    "Las Vegas Grand Prix": "Las Vegas Grand Prix",
    "Circuit of the Americas": "Circuit of the Americas",
    "Autodromo Hermanos Rodríguez": "Autodromo Hermanos Rodríguez",
    "Interlagos": "Autódromo José Carlos Pace",
    "Yas Marina Circuit": "Yas Marina Circuit",
}

def get_track_image_from_wikipedia(track_name: str) -> str or None:
    """Fetch track image from Wikipedia"""
    try:
        # Use mapped Wikipedia name if available
        wiki_name = TRACK_WIKIPEDIA_NAMES.get(track_name, track_name)
        
        params = {
            "action": "query",
            "format": "json",
            "titles": wiki_name,
            "prop": "pageimages",
            "piprop": "original",
            "redirects": "1",
            "origin": "*",
        }
        
        response = requests.get(
            "https://en.wikipedia.org/w/api.php",
            params=params,
            headers=HEADERS,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            pages = data.get("query", {}).get("pages", {})
            for page in pages.values():
                if "original" in page:
                    return page["original"]["source"]
        
        # Fallback: try adding "Circuit" or "Grand Prix"
        if "Circuit" not in track_name and "Grand Prix" not in track_name:
            for suffix in [" Circuit", " Grand Prix"]:
                params["titles"] = track_name + suffix
                response = requests.get(
                    "https://en.wikipedia.org/w/api.php",
                    params=params,
                    headers=HEADERS,
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    pages = data.get("query", {}).get("pages", {})
                    for page in pages.values():
                        if "original" in page:
                            return page["original"]["source"]
        
        return None
    except Exception as e:
        print(f"  Error fetching image for {track_name}: {str(e)}")
        return None

def main():
    """Populate track images"""
    with engine.begin() as connection:
        # Get all circuits
        result = connection.execute(
            text("SELECT id, name, image_url FROM circuits ORDER BY name")
        )
        circuits = result.fetchall()
        
        print(f"Processing {len(circuits)} circuits...\n")
        
        updated_count = 0
        for circuit_id, circuit_name, existing_image_url in circuits:
            # Skip if already has image
            if existing_image_url:
                print(f"✓ {circuit_name}: Already has image")
                continue
            
            print(f"⏳ {circuit_name}: Fetching image...", end=" ")
            
            # Fetch image
            image_url = get_track_image_from_wikipedia(circuit_name)
            
            if image_url:
                # Update database
                connection.execute(
                    text("UPDATE circuits SET image_url = :url WHERE id = :id"),
                    {"url": image_url, "id": circuit_id}
                )
                print(f"✓")
                updated_count += 1
            else:
                print(f"✗ (No image found)")
        
        print(f"\n✓ Updated {updated_count} circuit images")

if __name__ == "__main__":
    main()
