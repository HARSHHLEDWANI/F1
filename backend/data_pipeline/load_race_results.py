import json
from backend.data_pipeline.db import get_connection

def load_results():
    conn = get_connection()
    cur = conn.cursor()

    with open("race_results.json") as f:
        results = json.load(f)

    for r in results:
        cur.execute("""
            INSERT INTO race_results (
                season, round, race_name,
                driver_ref, constructor_ref,
                grid, position, points,
                status, laps, time
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            r["season"],
            r["round"],
            r["race_name"],
            r["driver_ref"],
            r["constructor_ref"],
            r["grid"],
            r["position"],
            r["points"],
            r["status"],
            r["laps"],
            r["time"]
        ))

    conn.commit()
    cur.close()
    conn.close()

    print("Race results loaded")


if __name__ == "__main__":
    load_results()
