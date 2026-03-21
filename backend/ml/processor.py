"""
Machine Learning Data Processor
Handles data fetching and preparation from PostgreSQL for the ML pipeline.
"""

import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class F1DataProcessor:
    """Fetches and prepares F1 data from PostgreSQL for ML training."""
    
    def __init__(self, database_url: str):
        """
        Initialize the data processor.
        
        Args:
            database_url: PostgreSQL connection string
        """
        self.engine = create_engine(database_url)
        
    def fetch_race_results_data(self) -> pd.DataFrame:
        """
        Fetch race results with driver, constructor, and circuit information.
        
        Returns:
            DataFrame with all race results and related data
        """
        query = """
        SELECT 
            rr.id as result_id,
            rr.season,
            rr.round,
            rr.race_name,
            rr.driver_ref,
            d.given_name,
            d.family_name,
            d.id as driver_id,
            d.nationality as driver_nationality,
            rr.constructor_ref,
            c.name as constructor_name,
            c.id as constructor_id,
            c.nationality as constructor_nationality,
            rr.grid as grid_position,
            rr.position as finishing_position,
            rr.points,
            rr.laps,
            rr.status,
            ci.id as circuit_id,
            ci.name as circuit_name,
            ci.locality as circuit_locality,
            ci.country as circuit_country
        FROM race_results rr
        LEFT JOIN drivers d ON LOWER(TRIM(d.family_name)) = LOWER(TRIM(rr.driver_ref))
        LEFT JOIN constructors c ON LOWER(TRIM(c.name)) = LOWER(TRIM(rr.constructor_ref))
        LEFT JOIN circuits ci ON LOWER(TRIM(ci.name)) = LOWER(TRIM(rr.race_name))
        WHERE rr.season >= 2021
        ORDER BY rr.season DESC, rr.round DESC
        """
        
        try:
            df = pd.read_sql(query, self.engine)
            logger.info(f"Fetched {len(df)} race results")
            return df
        except Exception as e:
            logger.error(f"Error fetching race results: {e}")
            return pd.DataFrame()
    
    def fetch_current_grid(self, season: int, round_num: int) -> pd.DataFrame:
        """
        Fetch the current grid/qualifying results for a specific race.
        
        Args:
            season: Formula 1 season
            round_num: Round number in the season
            
        Returns:
            DataFrame with grid positions for the race
        """
        query = """
        SELECT 
            rr.driver_id,
            d.given_name,
            d.family_name,
            d.id,
            rr.constructor_id,
            c.name as constructor_name,
            rr.grid as qualifying_position,
            d.team
        FROM race_results rr
        LEFT JOIN drivers d ON rr.driver_id = d.id
        LEFT JOIN constructors c ON rr.constructor_id = c.id
        WHERE rr.season = %s AND rr.round = %s
        ORDER BY rr.grid ASC
        """
        
        try:
            df = pd.read_sql(query, self.engine, params=[season, round_num])
            logger.info(f"Fetched grid for season {season}, round {round_num}: {len(df)} drivers")
            return df
        except Exception as e:
            logger.error(f"Error fetching grid: {e}")
            return pd.DataFrame()
    
    def fetch_driver_history(self, driver_id: int, limit: int = 20) -> pd.DataFrame:
        """
        Fetch recent race history for a specific driver.
        
        Args:
            driver_id: Driver ID
            limit: Number of recent races to fetch
            
        Returns:
            DataFrame with driver's recent race results
        """
        query = """
        SELECT 
            rr.season,
            rr.round,
            rr.grid as grid_position,
            rr.position as finishing_position,
            rr.points,
            rr.status,
            c.name as circuit_name
        FROM race_results rr
        LEFT JOIN circuits c ON rr.circuit_id = c.id
        WHERE rr.driver_id = %s
        ORDER BY rr.season DESC, rr.round DESC
        LIMIT %s
        """
        
        try:
            df = pd.read_sql(query, self.engine, params=[driver_id, limit])
            return df
        except Exception as e:
            logger.error(f"Error fetching driver history: {e}")
            return pd.DataFrame()
    
    def fetch_constructor_stats(self, constructor_id: int, season: int) -> dict:
        """
        Fetch constructor statistics for a season.
        
        Args:
            constructor_id: Constructor ID
            season: Formula 1 season
            
        Returns:
            Dictionary with constructor stats
        """
        query = """
        SELECT 
            COUNT(*) as total_races,
            SUM(CASE WHEN position IS NULL THEN 1 ELSE 0 END) as dnf_count,
            AVG(CASE WHEN position IS NOT NULL THEN CAST(position as FLOAT) ELSE NULL END) as avg_position,
            SUM(points) as total_points
        FROM race_results
        WHERE constructor_id = %s AND season = %s
        """
        
        try:
            result = pd.read_sql(query, self.engine, params=[constructor_id, season])
            if len(result) > 0:
                row = result.iloc[0]
                return {
                    'dnf_rate': (row['dnf_count'] / row['total_races']) if row['total_races'] > 0 else 0,
                    'avg_position': row['avg_position'],
                    'total_points': row['total_points']
                }
        except Exception as e:
            logger.error(f"Error fetching constructor stats: {e}")
        
        return {'dnf_rate': 0, 'avg_position': 15, 'total_points': 0}
    
    def fetch_track_affinity(self, driver_id: int, circuit_id: int) -> dict:
        """
        Fetch driver's historical performance at a specific track.
        
        Args:
            driver_id: Driver ID
            circuit_id: Circuit ID
            
        Returns:
            Dictionary with track affinity metrics
        """
        query = """
        SELECT 
            COUNT(*) as races_at_track,
            AVG(CASE WHEN position IS NOT NULL THEN CAST(position as FLOAT) ELSE NULL END) as avg_position,
            MIN(points) as podiums_at_track
        FROM race_results rr
        WHERE rr.driver_id = %s AND rr.circuit_id = %s
        """
        
        try:
            result = pd.read_sql(query, self.engine, params=[driver_id, circuit_id])
            if len(result) > 0:
                row = result.iloc[0]
                return {
                    'races_at_track': int(row['races_at_track']),
                    'avg_position_at_track': float(row['avg_position']) if row['avg_position'] else 15,
                    'podiums_at_track': int(row['podiums_at_track']) if row['podiums_at_track'] else 0
                }
        except Exception as e:
            logger.error(f"Error fetching track affinity: {e}")
        
        return {'races_at_track': 0, 'avg_position_at_track': 15, 'podiums_at_track': 0}
    
    def get_training_data(self, min_races_per_driver: int = 3) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Get prepared training data with features and target.
        
        Args:
            min_races_per_driver: Minimum races per driver to include in training
            
        Returns:
            Tuple of (features DataFrame, target Series)
        """
        df = self.fetch_race_results_data()
        
        if df.empty:
            logger.warning("No race results data available")
            return pd.DataFrame(), pd.Series()
        
        # Clean data
        df = df.dropna(subset=['finishing_position', 'driver_id'])
        df['finishing_position'] = pd.to_numeric(df['finishing_position'], errors='coerce')
        df = df[df['finishing_position'] > 0]  # Only valid finishes
        
        # Filter drivers with minimum races
        driver_counts = df.groupby('driver_id').size()
        valid_drivers = driver_counts[driver_counts >= min_races_per_driver].index
        df = df[df['driver_id'].isin(valid_drivers)]
        
        logger.info(f"Prepared {len(df)} race records for {len(valid_drivers)} drivers")
        
        return df, df['finishing_position']
    
    def close(self):
        """Close database connection."""
        self.engine.dispose()
