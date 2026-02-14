import requests

url = "https://api.jolpi.ca/ergast/f1/2024/drivers.json"

res = requests.get(url)

print(res.status_code)

data = res.json()

drivers = data["MRData"]["DriverTable"]["Drivers"]

for d in drivers[:5]:
    print(d["givenName"], d["familyName"], d["nationality"])
