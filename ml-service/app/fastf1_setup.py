import fastf1
import os

BASE_DIR = os.path.dirname(__file__)
CACHE_DIR = os.path.join(BASE_DIR, "cache")

fastf1.Cache.enable_cache(CACHE_DIR)