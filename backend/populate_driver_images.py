"""
Populate driver images from Wikipedia API
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

def get_driver_image_from_wikipedia(given_name: str, family_name: str) -> str or None:
    """Fetch driver image from Wikipedia"""
    try:
        # Try full name with Formula One context
        search_term = f"{given_name} {family_name} Formula One"
        
        params = {
            "action": "query",
            "format": "json",
            "titles": search_term,
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
        
        # Fallback: try just the name
        params["titles"] = f"{given_name} {family_name}"
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
        print(f"  Error fetching image for {given_name} {family_name}: {str(e)}")
        return None

def main():
    """Populate driver images"""
    with engine.begin() as connection:
        # Get all drivers
        result = connection.execute(
            text("SELECT id, given_name, family_name, image_url FROM drivers ORDER BY family_name")
        )
        drivers = result.fetchall()
        
        print(f"Processing {len(drivers)} drivers...\n")
        
        updated_count = 0
        for driver_id, given_name, family_name, existing_image_url in drivers:
            # Skip if already has image
            if existing_image_url:
                print(f"✓ {given_name} {family_name}: Already has image")
                continue
            
            print(f"⏳ {given_name} {family_name}: Fetching image...", end=" ")
            
            # Fetch image
            image_url = get_driver_image_from_wikipedia(given_name, family_name)
            
            if image_url:
                # Update database
                connection.execute(
                    text("UPDATE drivers SET image_url = :url WHERE id = :id"),
                    {"url": image_url, "id": driver_id}
                )
                print(f"✓")
                updated_count += 1
            else:
                print(f"✗ (No image found)")
        
        print(f"\n✓ Updated {updated_count} driver images")

if __name__ == "__main__":
    main()
