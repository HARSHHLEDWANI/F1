from app.database import SessionLocal
from app import models

# ─── Driver → Constructor mapping (used for race results) ───────────────────
DRIVER_TEAM_REF = {
    "verstappen":  "red_bull",
    "perez":       "red_bull",
    "hamilton":    "mercedes",
    "russell":     "mercedes",
    "leclerc":     "ferrari",
    "sainz":       "ferrari",
    "norris":      "mclaren",
    "piastri":     "mclaren",
    "alonso":      "aston_martin",
    "stroll":      "aston_martin",
    "gasly":       "alpine",
    "ocon":        "alpine",
    "hulkenberg":  "haas",
    "magnussen":   "haas",
    "tsunoda":     "rb",
    "lawson":      "rb",
    "albon":       "williams",
    "colapinto":   "williams",
    "bottas":      "sauber",
    "zhou":        "sauber",
}

# F1 points: P1..P10 then zeros
POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] + [0] * 10


# ─── 2024 Race Results (compact: driver_ref order = finishing positions) ─────
RACE_2024 = [
    {"round": 1,  "name": "Bahrain Grand Prix",        "results": ["verstappen","sainz","leclerc","perez","russell","norris","piastri","alonso","stroll","magnussen","tsunoda","bottas","zhou","albon","hulkenberg","gasly","ocon","hamilton","lawson","colapinto"]},
    {"round": 2,  "name": "Saudi Arabian Grand Prix",  "results": ["verstappen","perez","leclerc","sainz","norris","hamilton","russell","piastri","alonso","stroll","tsunoda","hulkenberg","ocon","gasly","magnussen","bottas","albon","lawson","zhou","colapinto"]},
    {"round": 3,  "name": "Australian Grand Prix",     "results": ["sainz","leclerc","norris","piastri","hamilton","alonso","tsunoda","albon","hulkenberg","magnussen","gasly","bottas","ocon","stroll","zhou","colapinto","lawson","russell","perez","verstappen"]},
    {"round": 4,  "name": "Japanese Grand Prix",       "results": ["verstappen","norris","leclerc","sainz","perez","piastri","hamilton","russell","tsunoda","alonso","stroll","albon","hulkenberg","bottas","magnussen","gasly","ocon","zhou","lawson","colapinto"]},
    {"round": 5,  "name": "Chinese Grand Prix",        "results": ["verstappen","norris","sainz","perez","hamilton","leclerc","russell","piastri","alonso","stroll","tsunoda","albon","magnussen","hulkenberg","gasly","bottas","ocon","zhou","lawson","colapinto"]},
    {"round": 6,  "name": "Miami Grand Prix",          "results": ["norris","verstappen","leclerc","piastri","sainz","russell","hamilton","tsunoda","hulkenberg","magnussen","alonso","stroll","gasly","albon","bottas","zhou","ocon","lawson","perez","colapinto"]},
    {"round": 7,  "name": "Emilia Romagna Grand Prix", "results": ["verstappen","norris","leclerc","sainz","perez","hamilton","russell","tsunoda","alonso","magnussen","hulkenberg","albon","gasly","bottas","ocon","stroll","zhou","lawson","piastri","colapinto"]},
    {"round": 8,  "name": "Monaco Grand Prix",         "results": ["leclerc","piastri","sainz","norris","perez","tsunoda","alonso","hamilton","bottas","stroll","magnussen","hulkenberg","gasly","albon","ocon","zhou","russell","lawson","verstappen","colapinto"]},
    {"round": 9,  "name": "Canadian Grand Prix",       "results": ["verstappen","norris","piastri","sainz","hamilton","perez","alonso","stroll","tsunoda","albon","magnussen","hulkenberg","gasly","bottas","ocon","zhou","lawson","colapinto","leclerc","russell"]},
    {"round": 10, "name": "Spanish Grand Prix",        "results": ["verstappen","norris","piastri","hamilton","sainz","leclerc","russell","perez","alonso","stroll","tsunoda","gasly","ocon","magnussen","hulkenberg","albon","bottas","zhou","lawson","colapinto"]},
    {"round": 11, "name": "Austrian Grand Prix",       "results": ["norris","verstappen","hamilton","piastri","russell","leclerc","sainz","alonso","stroll","tsunoda","hulkenberg","magnussen","gasly","albon","ocon","bottas","zhou","lawson","perez","colapinto"]},
    {"round": 12, "name": "British Grand Prix",        "results": ["hamilton","norris","piastri","leclerc","sainz","verstappen","russell","perez","alonso","stroll","magnussen","hulkenberg","tsunoda","albon","gasly","bottas","ocon","zhou","lawson","colapinto"]},
    {"round": 13, "name": "Hungarian Grand Prix",      "results": ["piastri","norris","leclerc","hamilton","verstappen","sainz","russell","perez","alonso","stroll","tsunoda","magnussen","hulkenberg","gasly","albon","bottas","ocon","zhou","lawson","colapinto"]},
    {"round": 14, "name": "Belgian Grand Prix",        "results": ["hamilton","russell","alonso","leclerc","piastri","sainz","norris","verstappen","perez","stroll","tsunoda","magnussen","hulkenberg","gasly","albon","bottas","ocon","zhou","lawson","colapinto"]},
    {"round": 15, "name": "Dutch Grand Prix",          "results": ["norris","verstappen","leclerc","piastri","sainz","alonso","hamilton","tsunoda","hulkenberg","magnussen","russell","gasly","albon","stroll","bottas","ocon","zhou","lawson","perez","colapinto"]},
    {"round": 16, "name": "Italian Grand Prix",        "results": ["leclerc","piastri","norris","russell","sainz","hamilton","verstappen","alonso","stroll","tsunoda","hulkenberg","magnussen","gasly","albon","bottas","ocon","zhou","lawson","perez","colapinto"]},
    {"round": 17, "name": "Azerbaijan Grand Prix",     "results": ["piastri","leclerc","norris","sainz","russell","alonso","hamilton","verstappen","perez","stroll","tsunoda","magnussen","hulkenberg","gasly","albon","bottas","ocon","zhou","lawson","colapinto"]},
    {"round": 18, "name": "Singapore Grand Prix",      "results": ["norris","piastri","sainz","leclerc","hamilton","alonso","russell","verstappen","perez","stroll","tsunoda","hulkenberg","magnussen","gasly","albon","bottas","ocon","zhou","lawson","colapinto"]},
    {"round": 19, "name": "United States Grand Prix",  "results": ["leclerc","sainz","piastri","norris","verstappen","hamilton","alonso","russell","perez","stroll","tsunoda","hulkenberg","magnussen","gasly","albon","bottas","ocon","zhou","lawson","colapinto"]},
    {"round": 20, "name": "Mexico City Grand Prix",    "results": ["verstappen","norris","leclerc","perez","sainz","piastri","hamilton","alonso","russell","stroll","tsunoda","hulkenberg","magnussen","gasly","albon","bottas","ocon","zhou","lawson","colapinto"]},
    {"round": 21, "name": "São Paulo Grand Prix",      "results": ["verstappen","norris","leclerc","perez","sainz","piastri","hamilton","alonso","russell","stroll","tsunoda","hulkenberg","magnussen","gasly","albon","bottas","ocon","zhou","lawson","colapinto"]},
    {"round": 22, "name": "Las Vegas Grand Prix",      "results": ["verstappen","leclerc","norris","sainz","hamilton","piastri","russell","alonso","perez","stroll","tsunoda","hulkenberg","magnussen","gasly","albon","bottas","ocon","zhou","lawson","colapinto"]},
    {"round": 23, "name": "Qatar Grand Prix",          "results": ["verstappen","norris","piastri","leclerc","sainz","hamilton","alonso","russell","perez","stroll","tsunoda","hulkenberg","magnussen","gasly","albon","bottas","ocon","zhou","lawson","colapinto"]},
    {"round": 24, "name": "Abu Dhabi Grand Prix",      "results": ["piastri","norris","verstappen","sainz","leclerc","hamilton","alonso","russell","perez","stroll","tsunoda","hulkenberg","magnussen","gasly","albon","bottas","ocon","zhou","lawson","colapinto"]},
]


def seed_all():
    db = SessionLocal()
    try:
        print("🌱 Checking if seeding is needed...")

        # ── Idempotency check: only seed if DB is empty ──────────────────────
        driver_count = db.query(models.Driver).count()
        if driver_count >= 20:
            print("⏭️  Database already seeded — skipping.")
            return

        print("🚀 Seeding full F1 database...")

        # ── 1. DRIVERS ───────────────────────────────────────────────────────
        db.query(models.Driver).delete()
        db.query(models.Team).delete()
        db.query(models.Circuit).delete()
        db.query(models.Race_Results).delete()
        db.commit()

        drivers = [
            # given, family, nationality, number, team, champs, wins, podiums, poles, pts, rating, image
            ("Max",      "Verstappen", "Dutch",       1,  "Red Bull",       4, 62, 110, 40, 3123, 96, "https://www.formula1.com/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/img/MAXVER01_Max_Verstappen.png"),
            ("Sergio",   "Perez",      "Mexican",    11,  "Red Bull",       0, 14,  56,  9, 2083, 80, "https://www.formula1.com/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/img/SERPER01_Sergio_Perez.png"),
            ("Lewis",    "Hamilton",   "British",    44,  "Mercedes",       7,103, 197,103, 4671, 94, "https://www.formula1.com/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/img/LEWHAM01_Lewis_Hamilton.png"),
            ("George",   "Russell",    "British",    63,  "Mercedes",       0,  2,  14,  3,  615, 82, "https://www.formula1.com/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/img/GEORUS01_George_Russell.png"),
            ("Charles",  "Leclerc",    "Monegasque", 16,  "Ferrari",        0,  8,  35, 26, 1142, 88, "https://www.formula1.com/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/img/CHALEC01_Charles_Leclerc.png"),
            ("Carlos",   "Sainz",      "Spanish",    55,  "Ferrari",        0,  5,  29,  6, 1128, 85, "https://www.formula1.com/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/img/CARSAI01_Carlos_Sainz.png"),
            ("Lando",    "Norris",     "British",     4,  "McLaren",        0,  6,  32,  5, 1114, 87, "https://www.formula1.com/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/img/LANNOR01_Lando_Norris.png"),
            ("Oscar",    "Piastri",    "Australian", 81,  "McLaren",        0,  4,  12,  2,  405, 83, "https://www.formula1.com/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/img/OSCPIA01_Oscar_Piastri.png"),
            ("Fernando", "Alonso",     "Spanish",    14,  "Aston Martin",   2, 32,  98, 22, 2267, 86, "https://www.formula1.com/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/img/FERALO01_Fernando_Alonso.png"),
            ("Lance",    "Stroll",     "Canadian",   18,  "Aston Martin",   0,  0,   3,  1,  205, 68, "https://www.formula1.com/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/img/LANSTR01_Lance_Stroll.png"),
            ("Pierre",   "Gasly",      "French",     10,  "Alpine F1 Team", 0,  1,   3,  1,  298, 73, "https://www.formula1.com/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/img/PIEGAS01_Pierre_Gasly.png"),
            ("Esteban",  "Ocon",       "French",     31,  "Alpine F1 Team", 0,  1,   3,  0,  381, 72, "https://www.formula1.com/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/img/ESTOCO01_Esteban_Ocon.png"),
            ("Nico",     "Hulkenberg", "German",     27,  "Haas F1 Team",   0,  0,   0,  0,  585, 76, "https://www.formula1.com/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/img/NICHUL01_Nico_Hulkenberg.png"),
            ("Kevin",    "Magnussen",  "Danish",     20,  "Haas F1 Team",   0,  0,   1,  1,  186, 70, "https://www.formula1.com/content/dam/fom-website/drivers/K/KEVMAG01_Kevin_Magnussen/img/KEVMAG01_Kevin_Magnussen.png"),
            ("Yuki",     "Tsunoda",    "Japanese",   22,  "RB F1 Team",     0,  0,   0,  0,  167, 74, "https://www.formula1.com/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/img/YUKTSU01_Yuki_Tsunoda.png"),
            ("Liam",     "Lawson",     "New Zealand",30,  "RB F1 Team",     0,  0,   0,  0,    6, 71, "https://www.formula1.com/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/img/LIALAW01_Liam_Lawson.png"),
            ("Alexander","Albon",      "Thai",       23,  "Williams",       0,  0,   0,  0,  140, 73, "https://www.formula1.com/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/img/ALEALB01_Alexander_Albon.png"),
            ("Franco",   "Colapinto",  "Argentine",  43,  "Williams",       0,  0,   0,  0,    5, 69, "https://www.formula1.com/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/img/FRACOL01_Franco_Colapinto.png"),
            ("Valtteri", "Bottas",     "Finnish",    77,  "Sauber",         0, 10,  67, 20, 1798, 79, "https://www.formula1.com/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/img/VALBOT01_Valtteri_Bottas.png"),
            ("Guanyu",   "Zhou",       "Chinese",    24,  "Sauber",         0,  0,   0,  0,    6, 67, "https://www.formula1.com/content/dam/fom-website/drivers/G/GUAZHO01_Guanyu_Zhou/img/GUAZHO01_Guanyu_Zhou.png"),
        ]

        for g, f, nat, num, team, champs, wins, pods, poles, pts, rating, img in drivers:
            db.add(models.Driver(
                given_name=g, family_name=f, nationality=nat,
                number=num, team=team,
                championships=champs, wins=wins, podiums=pods,
                poles=poles, points_total=pts, rating=rating,
                image_url=img,
            ))

        print(f"  ✅ {len(drivers)} drivers seeded")

        # ── 2. TEAMS ─────────────────────────────────────────────────────────
        teams = [
            ("Red Bull",       "Austrian"),
            ("Mercedes",       "German"),
            ("Ferrari",        "Italian"),
            ("McLaren",        "British"),
            ("Aston Martin",   "British"),
            ("Alpine F1 Team", "French"),
            ("Haas F1 Team",   "American"),
            ("RB F1 Team",     "Italian"),
            ("Williams",       "British"),
            ("Sauber",         "Swiss"),
        ]

        for name, nationality in teams:
            db.add(models.Team(name=name, nationality=nationality))

        print(f"  ✅ {len(teams)} teams seeded")

        # ── 3. CIRCUITS ──────────────────────────────────────────────────────
        # (circuit_ref, name, locality, country, lat, lng, lap_km, laps, lap_record, record_holder, record_year, track_type, drs_zones, difficulty)
        circuits = [
            ("bahrain",       "Bahrain International Circuit",         "Sakhir",        "Bahrain",      26.0325,   50.5106,  5.412,  57, "1:31.447", "Pedro de la Rosa",   2005, "permanent",  3, 55),
            ("jeddah",        "Jeddah Corniche Circuit",               "Jeddah",        "Saudi Arabia", 21.6319,   39.1044,  6.174,  50, "1:30.734", "Lewis Hamilton",     2021, "street",     3, 78),
            ("albert_park",   "Albert Park Circuit",                   "Melbourne",     "Australia",   -37.8497,  144.9680, 5.278,  58, "1:19.813", "Charles Leclerc",    2022, "street",     4, 62),
            ("suzuka",        "Suzuka Circuit",                        "Suzuka",        "Japan",        34.8431,  136.5407, 5.807,  53, "1:30.983", "Lewis Hamilton",     2019, "permanent",  2, 85),
            ("shanghai",      "Shanghai International Circuit",        "Shanghai",      "China",        31.3389,  121.2200, 5.451,  56, "1:32.238", "Michael Schumacher", 2004, "permanent",  2, 60),
            ("miami",         "Miami International Autodrome",         "Miami",         "USA",          25.9581,  -80.2389, 5.412,  57, "1:29.708", "Max Verstappen",     2023, "street",     3, 65),
            ("imola",         "Autodromo Enzo e Dino Ferrari",         "Imola",         "Italy",        44.3439,   11.7167, 4.909,  63, "1:15.484", "Rubens Barrichello", 2004, "permanent",  1, 72),
            ("monaco",        "Circuit de Monaco",                     "Monte Carlo",   "Monaco",       43.7347,    7.4205, 3.337,  78, "1:10.166", "Rubens Barrichello", 2004, "street",     1, 95),
            ("villeneuve",    "Circuit Gilles Villeneuve",             "Montreal",      "Canada",       45.5000,  -73.5228, 4.361,  70, "1:13.078", "Valtteri Bottas",    2019, "street",     2, 68),
            ("catalunya",     "Circuit de Barcelona-Catalunya",        "Montmelo",      "Spain",        41.5700,    2.2611, 4.657,  66, "1:18.149", "Max Verstappen",     2021, "permanent",  2, 58),
            ("red_bull_ring", "Red Bull Ring",                         "Spielberg",     "Austria",      47.2197,   14.7647, 4.318,  71, "1:05.619", "Carlos Sainz",       2020, "permanent",  3, 52),
            ("silverstone",   "Silverstone Circuit",                   "Silverstone",   "UK",           52.0786,   -1.0169, 5.891,  52, "1:27.097", "Max Verstappen",     2020, "permanent",  2, 70),
            ("hungaroring",   "Hungaroring",                           "Budapest",      "Hungary",      47.5789,   19.2486, 4.381,  70, "1:16.627", "Lewis Hamilton",     2020, "permanent",  2, 60),
            ("spa",           "Circuit de Spa-Francorchamps",          "Spa",           "Belgium",      50.4372,    5.9714, 7.004,  44, "1:46.286", "Valtteri Bottas",    2018, "permanent",  2, 88),
            ("zandvoort",     "Circuit Zandvoort",                     "Zandvoort",     "Netherlands",  52.3888,    4.5409, 4.259,  72, "1:11.097", "Lewis Hamilton",     2021, "permanent",  2, 75),
            ("monza",         "Autodromo Nazionale di Monza",          "Monza",         "Italy",        45.6156,    9.2811, 5.793,  53, "1:21.046", "Rubens Barrichello", 2004, "permanent",  3, 45),
            ("baku",          "Baku City Circuit",                     "Baku",          "Azerbaijan",   40.3725,   49.8533, 6.003,  51, "1:43.009", "Charles Leclerc",    2019, "street",     2, 80),
            ("marina_bay",    "Marina Bay Street Circuit",             "Singapore",     "Singapore",     1.2914,  103.8640, 4.940,  62, "1:35.867", "Kevin Magnussen",    2018, "street",     3, 82),
            ("americas",      "Circuit of the Americas",               "Austin",        "USA",          30.1328,  -97.6411, 5.513,  56, "1:36.169", "Charles Leclerc",    2019, "permanent",  2, 72),
            ("rodriguez",     "Autodromo Hermanos Rodriguez",          "Mexico City",   "Mexico",       19.4042,  -99.0907, 4.304,  71, "1:17.774", "Valtteri Bottas",    2021, "permanent",  3, 58),
            ("interlagos",    "Autodromo Jose Carlos Pace",            "Sao Paulo",     "Brazil",      -23.7036,  -46.6997, 4.309,  71, "1:10.540", "Valtteri Bottas",    2018, "permanent",  2, 65),
            ("las_vegas",     "Las Vegas Street Circuit",              "Las Vegas",     "USA",          36.1699, -115.1398, 6.120,  50, "1:35.490", "Oscar Piastri",      2023, "street",     2, 70),
            ("losail",        "Losail International Circuit",          "Lusail",        "Qatar",        25.4900,   51.4531, 5.419,  57, "1:24.319", "Max Verstappen",     2021, "permanent",  2, 62),
            ("yas_marina",    "Yas Marina Circuit",                    "Abu Dhabi",     "UAE",          24.4672,   54.6031, 5.281,  58, "1:26.103", "Max Verstappen",     2021, "permanent",  2, 55),
        ]

        for ref, name, loc, country, lat, lng, lap_km, laps, lap_rec, rec_holder, rec_year, t_type, drs, diff in circuits:
            db.add(models.Circuit(
                circuit_ref=ref, name=name, locality=loc, country=country,
                lat=lat, lng=lng, lap_distance=lap_km, laps=laps,
                lap_record_time=lap_rec, lap_record_holder=rec_holder,
                lap_record_year=rec_year, track_type=t_type,
                drs_zones=drs, difficulty=diff,
            ))

        print(f"  ✅ {len(circuits)} circuits seeded")

        # ── 4. RACE RESULTS (2024 season) ────────────────────────────────────
        # Grid position ≈ finishing position with minor shuffle
        GRID_OFFSETS = [0, 1, -1, 2, -2, 3, 1, -1, 2, 0,
                        1, -1, 2, -2, 1, 0, -1, 2, 1, -1]

        result_rows = 0
        for race in RACE_2024:
            for pos_idx, driver_ref in enumerate(race["results"]):
                finishing_pos = pos_idx + 1
                grid_raw = finishing_pos + GRID_OFFSETS[pos_idx]
                grid_pos = max(1, min(20, grid_raw))
                pts = POINTS[pos_idx]
                constructor_ref = DRIVER_TEAM_REF.get(driver_ref, "unknown")
                db.add(models.Race_Results(
                    season=2024,
                    round=race["round"],
                    race_name=race["name"],
                    driver_ref=driver_ref,
                    constructor_ref=constructor_ref,
                    grid=grid_pos,
                    position=finishing_pos,
                    points=pts,
                    status="Finished" if finishing_pos <= 18 else "DNF",
                    laps=60,
                ))
                result_rows += 1

        print(f"  ✅ {result_rows} race result rows seeded (2024 season)")

        db.commit()
        print("✅ Full database seed complete!")

    except Exception as e:
        print("❌ SEED ERROR:", str(e))
        db.rollback()
        raise

    finally:
        db.close()
