import requests
import json

BASE = "https://api.jolpi.ca/ergast/f1"


def fetch_drivers(season=2024):
    url = f"{BASE}/{season}/drivers.json"
    res = requests.get(url)
    data = res.json()
    return data["MRData"]["DriverTable"]["Drivers"]


def fetch_teams(season=2024):
    url = f"{BASE}/{season}/constructors.json"
    res = requests.get(url)
    data = res.json()
    return data["MRData"]["ConstructorTable"]["Constructors"]


def fetch_circuits():
    url = f"{BASE}/circuits.json"
    res = requests.get(url)
    data = res.json()
    return data["MRData"]["CircuitTable"]["Circuits"]


if __name__ == "__main__":
    drivers = fetch_drivers()
    teams = fetch_teams()
    circuits = fetch_circuits()

    with open("drivers.json", "w") as f:
        json.dump(drivers, f, indent=2)

    with open("teams.json", "w") as f:
        json.dump(teams, f, indent=2)

    with open("circuits.json", "w") as f:
        json.dump(circuits, f, indent=2)

    print("✅ Data downloaded")
