"""
F1 Prediction Model Training Pipeline
Train and save the Random Forest model for race predictions.
Run this offline (once per week after each Grand Prix).

Usage:
    python train_model.py --database-url "postgresql://user:pass@localhost/f1_db" --output "models/f1_model.pkl"
"""

import os
import pickle
import logging
import argparse
from datetime import datetime
from pathlib import Path

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Import custom modules
import sys
sys.path.insert(0, os.path.dirname(__file__))

from ml.processor import F1DataProcessor
from ml.feature_engineer import FeatureEngineer

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class F1ModelTrainer:
    """Trains and saves the F1 prediction model."""
    
    def __init__(self, database_url: str, output_dir: str = "models"):
        """
        Initialize the trainer.
        
        Args:
            database_url: PostgreSQL connection string
            output_dir: Directory to save models
        """
        self.database_url = database_url
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.processor = F1DataProcessor(database_url)
        self.model = None
        self.scaler = None
        self.feature_columns = FeatureEngineer.get_feature_columns()
    
    def load_and_prepare_data(self) -> pd.DataFrame:
        """
        Load data from database and prepare for training.
        
        Returns:
            Prepared DataFrame with features and target
        """
        logger.info("Loading data from database...")
        df, target = self.processor.get_training_data()
        
        if df.empty:
            logger.error("No training data available!")
            return None
        
        logger.info("Engineering features...")
        df = FeatureEngineer.engineer_all_features(df)
        
        # Remove rows with missing target values
        df = df.dropna(subset=['finishing_position'])
        
        # Ensure all feature columns exist
        for col in self.feature_columns:
            if col not in df.columns:
                df[col] = 0
        
        logger.info(f"Prepared {len(df)} training samples")
        return df
    
    def train(self, df: pd.DataFrame, test_size: float = 0.2, random_state: int = 42):
        """
        Train the Random Forest model.
        
        Args:
            df: Prepared DataFrame with features
            test_size: Fraction of data to use for testing
            random_state: Random seed for reproducibility
        """
        if df is None or df.empty:
            logger.error("No data to train on!")
            return False
        
        logger.info("Preparing features and target...")
        X = df[self.feature_columns].copy()
        y = df['finishing_position'].copy()
        
        # Handle missing values
        X = X.fillna(X.mean())
        y = y.fillna(y.mean())
        
        logger.info(f"Training set size: {len(X)}")
        logger.info(f"Features used: {len(self.feature_columns)}")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )
        
        # Scale features
        logger.info("Scaling features...")
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        logger.info("Training Random Forest Regressor...")
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=random_state,
            n_jobs=-1,
            verbose=1
        )
        
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        logger.info("Evaluating model...")
        y_pred_train = self.model.predict(X_train_scaled)
        y_pred_test = self.model.predict(X_test_scaled)
        
        train_mae = mean_absolute_error(y_train, y_pred_train)
        test_mae = mean_absolute_error(y_test, y_pred_test)
        train_r2 = r2_score(y_train, y_pred_train)
        test_r2 = r2_score(y_test, y_pred_test)
        
        logger.info(f"Train MAE: {train_mae:.3f}")
        logger.info(f"Test MAE: {test_mae:.3f}")
        logger.info(f"Train R²: {train_r2:.3f}")
        logger.info(f"Test R²: {test_r2:.3f}")
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': self.feature_columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        logger.info("\nTop 10 Important Features:")
        logger.info(feature_importance.head(10).to_string())
        
        return True
    
    def save_model(self) -> str:
        """
        Save trained model and scaler to disk.
        
        Returns:
            Path to saved model file
        """
        if self.model is None:
            logger.error("Model not trained yet!")
            return None
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        model_path = self.output_dir / f"f1_model_{timestamp}.pkl"
        scaler_path = self.output_dir / f"f1_scaler_{timestamp}.pkl"
        
        # Save model
        with open(model_path, 'wb') as f:
            pickle.dump(self.model, f)
        logger.info(f"Model saved to {model_path}")
        
        # Save scaler
        with open(scaler_path, 'wb') as f:
            pickle.dump(self.scaler, f)
        logger.info(f"Scaler saved to {scaler_path}")
        
        # Create symlinks to latest versions
        latest_model = self.output_dir / "f1_model.pkl"
        latest_scaler = self.output_dir / "f1_scaler.pkl"
        
        # Remove old symlinks if they exist
        if latest_model.exists() or latest_model.is_symlink():
            latest_model.unlink()
        if latest_scaler.exists() or latest_scaler.is_symlink():
            latest_scaler.unlink()
        
        # Create symlinks
        latest_model.symlink_to(model_path.name)
        latest_scaler.symlink_to(scaler_path.name)
        
        logger.info(f"Latest model symlink created at {latest_model}")
        
        return str(model_path)
    
    def close(self):
        """Clean up database connections."""
        self.processor.close()


def main():
    """Main training pipeline."""
    parser = argparse.ArgumentParser(
        description="Train F1 race prediction model"
    )
    parser.add_argument(
        '--database-url',
        required=True,
        help='PostgreSQL database URL'
    )
    parser.add_argument(
        '--output',
        default='models',
        help='Output directory for model files'
    )
    
    args = parser.parse_args()
    
    logger.info("=" * 60)
    logger.info("F1 Prediction Model Training Pipeline")
    logger.info("=" * 60)
    
    trainer = F1ModelTrainer(args.database_url, args.output)
    
    try:
        # Load and prepare data
        df = trainer.load_and_prepare_data()
        
        if df is None:
            logger.error("Failed to load training data!")
            return False
        
        # Train model
        if not trainer.train(df):
            logger.error("Training failed!")
            return False
        
        # Save model
        model_path = trainer.save_model()
        
        if model_path:
            logger.info("=" * 60)
            logger.info("✓ Model training completed successfully!")
            logger.info("=" * 60)
            return True
        else:
            logger.error("Failed to save model!")
            return False
    
    except Exception as e:
        logger.error(f"Training pipeline error: {e}", exc_info=True)
        return False
    
    finally:
        trainer.close()


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
