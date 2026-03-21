import requests
import json

BASE = "https://api.jolpi.ca/ergast/f1"

def fetch_results(season=2024):
    url = f"{BASE}/{season}/results.json?limit=1000"
    res = requests.get(url)
    data = res.json()

    races = data["MRData"]["RaceTable"]["Races"]

    results = []

    for race in races:
        race_name = race["raceName"]
        round_no = race["round"]

        for result in race["Results"]:
            results.append({
                "season": season,
                "round": round_no,
                "race_name": race_name,

                "driver_ref": result["Driver"]["driverId"],
                "constructor_ref": result["Constructor"]["constructorId"],

                "grid": result.get("grid"),
                "position": result.get("position"),
                "points": result.get("points"),
                "status": result["status"],

                "laps": result.get("laps"),
                "time": result.get("Time", {}).get("time")
            })

    with open("race_results.json", "w") as f:
        json.dump(results, f, indent=2)

    print("Race results fetched")


if __name__ == "__main__":
    fetch_results()
