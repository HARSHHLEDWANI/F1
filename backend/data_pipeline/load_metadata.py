import json
from backend.data_pipeline.db import get_connection

def load_drivers():
    conn = get_connection()
    cur = conn.cursor()

    with open("drivers.json") as f:
        drivers = json.load(f)

    for d in drivers:
        cur.execute("""
            INSERT INTO drivers (driver_ref, given_name, family_name, nationality, date_of_birth)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (driver_ref) DO NOTHING
        """, (
            d.get("driverId"),
            d.get("givenName"),
            d.get("familyName"),
            d.get("nationality"),
            d.get("dateOfBirth")
        ))

    conn.commit()
    cur.close()
    conn.close()
    print("Drivers loaded")


def load_teams():
    conn = get_connection()
    cur = conn.cursor()

    with open("teams.json") as f:
        teams = json.load(f)

    for t in teams:
        cur.execute("""
            INSERT INTO teams (constructor_ref, name, nationality)
            VALUES (%s, %s, %s)
            ON CONFLICT (constructor_ref) DO NOTHING
        """, (
            t.get("constructorId"),
            t.get("name"),
            t.get("nationality")
        ))

    conn.commit()
    cur.close()
    conn.close()
    print("Teams loaded")


def load_circuits():
    conn = get_connection()
    cur = conn.cursor()

    with open("circuits.json") as f:
        circuits = json.load(f)

    for c in circuits:
        loc = c.get("Location", {})

        cur.execute("""
            INSERT INTO circuits (circuit_ref, name, locality, country, lat, lng)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (circuit_ref) DO NOTHING
        """, (
            c.get("circuitId"),
            c.get("circuitName"),
            loc.get("locality"),
            loc.get("country"),
            loc.get("lat"),
            loc.get("long")
        ))

    conn.commit()
    cur.close()
    conn.close()
    print("Circuits loaded")


if __name__ == "__main__":
    load_drivers()
    load_teams()
    load_circuits()
