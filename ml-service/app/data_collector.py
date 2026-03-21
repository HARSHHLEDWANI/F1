import fastf1
import pandas as pd
from app.fastf1_setup import *

def get_race_laps(season, race):

    session = fastf1.get_session(season, race, "R")
    session.load()
    laps = session.laps

    df = laps[[
        "Driver",
        "Team",
        "LapNumber",
        "LapTime",
        "Compound",
        "TyreLife",
        "Stint",
        "Position",
        "TrackStatus"
    ]].copy()

    df["LapTimeSeconds"] = df["LapTime"].dt.total_seconds()

    df["Race"] = race
    df["Season"] = season

    return df


def build_season_dataset(season):

    schedule = fastf1.get_event_schedule(season)

    all_races = []

    for race in schedule["EventName"]:

        try:
            print(f"\nLoading {race}")

            df = get_race_laps(season, race)

            all_races.append(df)

        except Exception as e:
            print(f"Skipped {race} because {e}")

    dataset = pd.concat(all_races)

    dataset.to_parquet(f"app/datasets/{season}_laps.parquet")

    print("\nDataset saved!")

    return dataset


if __name__ == "__main__":

    build_season_dataset(2023)