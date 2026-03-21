"""
Feature Engineering Pipeline
Creates ML features from raw F1 data.
"""

import pandas as pd
import numpy as np
from typing import Dict
import logging

logger = logging.getLogger(__name__)


class FeatureEngineer:
    """Handles feature engineering for F1 prediction models."""
    
    @staticmethod
    def create_driver_form_features(df: pd.DataFrame, lookback_races: int = 5) -> pd.DataFrame:
        """
        Create driver form features based on recent performance.
        
        Args:
            df: Race results DataFrame
            lookback_races: Number of recent races to consider
            
        Returns:
            DataFrame with added driver form features
        """
        df = df.copy()
        
        # Sort by season and round
        df = df.sort_values(['season', 'round'])
        
        # Driver average finishing position (last N races)
        df['driver_avg_position'] = df.groupby('driver_id')['finishing_position'].transform(
            lambda x: x.rolling(window=lookback_races, min_periods=1).mean()
        )
        
        # Driver position improvement trend
        df['driver_position_trend'] = df.groupby('driver_id')['finishing_position'].transform(
            lambda x: x.iloc[-1] - x.mean() if len(x) > 0 else 0
        )
        
        # Driver points consistency (last N races)
        df['driver_points_std'] = df.groupby('driver_id')['points'].transform(
            lambda x: x.rolling(window=lookback_races, min_periods=1).std()
        ).fillna(0)
        
        # Recent podiums (last 10 races) - count races where points > 0
        def count_podiums(series):
            return (series > 0).rolling(window=10, min_periods=1).sum()

        df['driver_podiums_10races'] = df.groupby('driver_id')['points'].transform(count_podiums).fillna(0)
        
        # DNF rate for driver (using transform to maintain row count)
        df['driver_dnf_rate'] = df.groupby('driver_id')['status'].transform(
            lambda x: (x.str.contains('DNF|Retired', na=False).sum() / len(x)) if len(x) > 0 else 0
        )
        
        return df
    
    @staticmethod
    def create_constructor_features(df: pd.DataFrame) -> pd.DataFrame:
        """
        Create constructor/team-based features.
        
        Args:
            df: Race results DataFrame
            
        Returns:
            DataFrame with added constructor features
        """
        df = df.copy()
        
        # Constructor reliability (DNF rate)
        constructor_dnf = df.groupby('constructor_id').apply(
            lambda x: (x['status'].str.contains('DNF|Retired', na=False).sum() / len(x)) if len(x) > 0 else 0
        )
        df['constructor_reliability'] = df['constructor_id'].map(lambda x: 1 - constructor_dnf.get(x, 0))
        
        # Constructor average finishing position
        df['constructor_avg_position'] = df.groupby('constructor_id')['finishing_position'].transform(
            lambda x: x.mean()
        )
        
        # Constructor points average
        df['constructor_avg_points'] = df.groupby('constructor_id')['points'].transform(
            lambda x: x.mean()
        )
        
        # Constructor recent form (last 5 races average points)
        df = df.sort_values(['season', 'round'])
        df['constructor_recent_points'] = df.groupby('constructor_id')['points'].transform(
            lambda x: x.rolling(window=5, min_periods=1).mean()
        )
        
        return df
    
    @staticmethod
    def create_track_features(df: pd.DataFrame) -> pd.DataFrame:
        """
        Create track-specific features showing driver affinity per circuit.
        
        Args:
            df: Race results DataFrame
            
        Returns:
            DataFrame with added track features
        """
        df = df.copy()
        
        # Driver-track average finishing position
        driver_track_avg = df.groupby(['driver_id', 'circuit_id'])['finishing_position'].transform(
            lambda x: x.mean()
        )
        df['track_affinity_position'] = driver_track_avg.fillna(df['finishing_position'].mean())
        
        # Driver-track podium rate
        driver_track_podiums = df.groupby(['driver_id', 'circuit_id'])['points'].transform(
            lambda x: (x > 0).sum() / len(x) if len(x) > 0 else 0
        )
        df['track_affinity_podium_rate'] = driver_track_podiums.fillna(0)
        
        # Track difficulty (average finishing position across all drivers)
        df['track_difficulty'] = df.groupby('circuit_id')['finishing_position'].transform(
            lambda x: x.mean()
        ).fillna(15)
        
        # Driver experience at track (number of races)
        df['track_experience'] = df.groupby(['driver_id', 'circuit_id']).cumcount() + 1
        
        return df
    
    @staticmethod
    def create_overtake_features(df: pd.DataFrame) -> pd.DataFrame:
        """
        Create features for overtake probability prediction.
        
        Args:
            df: Race results DataFrame
            
        Returns:
            DataFrame with added overtake features
        """
        df = df.copy()
        
        # Position change (grid - final position)
        df['position_change'] = df['grid_position'] - df['finishing_position']
        
        # Driver's ability to overtake (average position gain)
        df['driver_overtake_ability'] = df.groupby('driver_id')['position_change'].transform(
            lambda x: x.mean()
        ).fillna(0)
        
        # Constructor overtake power
        df['constructor_overtake_power'] = df.groupby('constructor_id')['position_change'].transform(
            lambda x: x.mean()
        ).fillna(0)
        
        return df
    
    @staticmethod
    def create_driver_form_index(df: pd.DataFrame) -> pd.Series:
        """
        Create a Driver Form Index (0-100) based on recent performance.
        
        Args:
            df: Race results DataFrame
            
        Returns:
            Series with form index values
        """
        # Normalize recent points (weighted towards latest)
        def weighted_recent_points(x):
            recent_races = x.tail(5)
            n_races = len(recent_races)
            if n_races == 0:
                return 0
            weights = np.linspace(1, 5, n_races)  # More recent races weighted higher
            return (recent_races * weights).sum() / weights.sum()
        
        points_normalized = df.groupby('driver_id')['points'].transform(weighted_recent_points).fillna(0)
        
        # Points per race to 0-100 scale
        max_points_per_race = 25
        form_from_points = (points_normalized / max_points_per_race) * 100
        
        # Normalize based on position (better position = higher form)
        position_normalized = 100 - (df['driver_avg_position'] / 20 * 100)
        
        # Combine both metrics
        driver_form_index = (form_from_points * 0.6) + (position_normalized.fillna(50) * 0.4)
        driver_form_index = driver_form_index.clip(0, 100)
        
        return driver_form_index
    
    @staticmethod
    def engineer_all_features(df: pd.DataFrame) -> pd.DataFrame:
        """
        Create all features for model training.
        
        Args:
            df: Raw race results DataFrame
            
        Returns:
            DataFrame with all engineered features
        """
        df = df.copy()
        
        # Fill missing values
        df['grid_position'] = pd.to_numeric(df['grid_position'], errors='coerce').fillna(20)
        df['finishing_position'] = pd.to_numeric(df['finishing_position'], errors='coerce').fillna(20)
        df['points'] = pd.to_numeric(df['points'], errors='coerce').fillna(0)
        df['status'] = df['status'].fillna('')
        
        # Create feature groups
        df = FeatureEngineer.create_driver_form_features(df)
        df = FeatureEngineer.create_constructor_features(df)
        df = FeatureEngineer.create_track_features(df)
        df = FeatureEngineer.create_overtake_features(df)
        
        # Handle any remaining NaNs
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())
        
        # Add driver form index
        df['driver_form_index'] = FeatureEngineer.create_driver_form_index(df)
        
        logger.info(f"Created {len(df.columns)} features")
        
        return df
    
    @staticmethod
    def get_feature_columns() -> list:
        """
        Get list of feature column names for model training.
        
        Returns:
            List of feature column names
        """
        return [
            'grid_position',
            'driver_avg_position',
            'driver_position_trend',
            'driver_points_std',
            'driver_podiums_10races',
            'driver_dnf_rate',
            'constructor_reliability',
            'constructor_avg_position',
            'constructor_avg_points',
            'constructor_recent_points',
            'track_affinity_position',
            'track_affinity_podium_rate',
            'track_difficulty',
            'track_experience',
            'driver_overtake_ability',
            'constructor_overtake_power',
            'driver_form_index'
        ]
