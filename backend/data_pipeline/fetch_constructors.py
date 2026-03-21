import requests
import json

URL = "https://api.jolpi.ca/ergast/f1/constructors.json?limit=500"

def fetch_constructors():
    res = requests.get(URL)
    data = res.json()

    constructors = data["MRData"]["ConstructorTable"]["Constructors"]

    cleaned = []

    for c in constructors:
        cleaned.append({
            "name": c["name"],
            "nationality": c["nationality"]
        })

    with open("constructors.json", "w") as f:
        json.dump(cleaned, f, indent=2)

    print("Constructors downloaded")


if __name__ == "__main__":
    fetch_constructors()
