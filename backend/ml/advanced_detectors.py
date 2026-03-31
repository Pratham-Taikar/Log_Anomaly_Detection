"""
Advanced anomaly detection models for log analysis.
Implements Isolation Forest, LOF, One-Class SVM, and ensemble methods.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import ParameterGrid
from sklearn.metrics import roc_auc_score, precision_recall_curve
import pickle
import os
from typing import Dict, List, Tuple, Optional, Any
import warnings
warnings.filterwarnings('ignore')

class AdvancedAnomalyDetector:
    """Advanced anomaly detection with multiple algorithms and tuning."""
    
    def __init__(self, 
                 contamination_rates: List[float] = [0.02, 0.05, 0.1],
                 random_state: int = 42):
        
        self.contamination_rates = contamination_rates
        self.random_state = random_state
        self.scaler = StandardScaler()
        
        # Initialize models
        self.models = {}
        self.best_models = {}
        self.model_predictions = {}
        self.model_scores = {}
        
        self.is_fitted = False
        
    def _create_isolation_forest_models(self) -> Dict[str, IsolationForest]:
        """Create Isolation Forest models with different parameters."""
        models = {}
        
        # Base configurations
        n_estimators_list = [100, 200, 300]
        max_samples_list = ['auto', 0.8, 0.6]
        
        for cont in self.contamination_rates:
            for n_est in n_estimators_list:
                for max_samp in max_samples_list:
                    name = f"IF_nest_{n_est}_cont_{cont}_maxsamp_{max_samp}"
                    models[name] = IsolationForest(
                        n_estimators=n_est,
                        contamination=cont,
                        max_samples=max_samp,
                        random_state=self.random_state,
                        n_jobs=-1
                    )
        
        return models
    
    def _create_lof_models(self) -> Dict[str, LocalOutlierFactor]:
        """Create Local Outlier Factor models with different parameters."""
        models = {}
        
        n_neighbors_list = [10, 20, 50]
        contamination_list = self.contamination_rates
        
        for cont in contamination_list:
            for n_neighbors in n_neighbors_list:
                name = f"LOF_neighbors_{n_neighbors}_cont_{cont}"
                models[name] = LocalOutlierFactor(
                    n_neighbors=n_neighbors,
                    contamination=cont,
                    novelty=True,  # Use for prediction on new data
                    n_jobs=-1
                )
        
        return models
    
    def _create_ocsvm_models(self) -> Dict[str, OneClassSVM]:
        """Create One-Class SVM models with different parameters."""
        models = {}
        
        nu_list = self.contamination_rates  # nu is similar to contamination
        gamma_list = ['scale', 'auto', 0.1, 0.01]
        kernel_list = ['rbf', 'poly']
        
        for nu in nu_list:
            for gamma in gamma_list:
                for kernel in kernel_list:
                    name = f"OCSVM_nu_{nu}_gamma_{gamma}_kernel_{kernel}"
                    models[name] = OneClassSVM(
                        nu=nu,
                        kernel=kernel,
                        gamma=gamma
                    )
        
        return models
    
    def fit(self, X: np.ndarray, y: Optional[np.ndarray] = None) -> 'AdvancedAnomalyDetector':
        """Fit all models on training data."""
        print(f"Fitting anomaly detection models on {X.shape[0]} samples, {X.shape[1]} features...")
        
        # Scale features
        print("Scaling features...")
        X_scaled = self.scaler.fit_transform(X)
        
        # Create and fit models
        print("Creating Isolation Forest models...")
        if_models = self._create_isolation_forest_models()
        
        print("Creating LOF models...")
        lof_models = self._create_lof_models()
        
        print("Creating One-Class SVM models...")
        ocsvm_models = self._create_ocsvm_models()
        
        all_models = {**if_models, **lof_models, **ocsvm_models}
        
        print(f"Fitting {len(all_models)} models...")
        for i, (name, model) in enumerate(all_models.items()):
            try:
                print(f"  ({i+1}/{len(all_models)}) Fitting {name}...")
                model.fit(X_scaled)
                self.models[name] = model
                
                # Get predictions and scores
                predictions = model.predict(X_scaled)
                scores = model.decision_function(X_scaled)
                
                self.model_predictions[name] = predictions
                self.model_scores[name] = scores
                
            except Exception as e:
                print(f"    Error fitting {name}: {str(e)}")
                continue
        
        self.is_fitted = True
        print(f"Successfully fitted {len(self.models)} models")
        
        return self
    
    def predict(self, X: np.ndarray) -> Dict[str, np.ndarray]:
        """Get predictions from all fitted models."""
        if not self.is_fitted:
            raise ValueError("Models must be fitted before prediction")
        
        X_scaled = self.scaler.transform(X)
        predictions = {}
        
        for name, model in self.models.items():
            try:
                pred = model.predict(X_scaled)
                predictions[name] = pred
            except Exception as e:
                print(f"Error predicting with {name}: {str(e)}")
                continue
        
        return predictions
    
    def decision_function(self, X: np.ndarray) -> Dict[str, np.ndarray]:
        """Get anomaly scores from all fitted models."""
        if not self.is_fitted:
            raise ValueError("Models must be fitted before prediction")
        
        X_scaled = self.scaler.transform(X)
        scores = {}
        
        for name, model in self.models.items():
            try:
                score = model.decision_function(X_scaled)
                scores[name] = score
            except Exception as e:
                print(f"Error scoring with {name}: {str(e)}")
                continue
        
        return scores
    
    def evaluate_models(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Dict]:
        """Evaluate all models against ground truth labels."""
        predictions = self.predict(X)
        scores = self.decision_function(X)
        
        results = {}
        
        for model_name in predictions.keys():
            if model_name in scores:
                pred = predictions[model_name]
                score = scores[model_name]
                
                # Convert predictions to binary (0 for normal, 1 for anomaly)
                pred_binary = (pred == -1).astype(int)
                
                # Calculate metrics
                tp = np.sum((pred_binary == 1) & (y == 1))
                fp = np.sum((pred_binary == 1) & (y == 0))
                tn = np.sum((pred_binary == 0) & (y == 0))
                fn = np.sum((pred_binary == 0) & (y == 1))
                
                precision = tp / (tp + fp) if (tp + fp) > 0 else 0
                recall = tp / (tp + fn) if (tp + fn) > 0 else 0
                f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
                accuracy = (tp + tn) / (tp + fp + tn + fn)
                
                # Calculate AUC if possible
                try:
                    auc = roc_auc_score(y, -score)  # Negative because lower scores = more anomalous
                except:
                    auc = 0.5
                
                results[model_name] = {
                    'precision': precision,
                    'recall': recall,
                    'f1_score': f1,
                    'accuracy': accuracy,
                    'auc': auc,
                    'tp': tp,
                    'fp': fp,
                    'tn': tn,
                    'fn': fn
                }
        
        return results
    
    def get_best_models(self, evaluation_results: Dict, metric: str = 'f1_score') -> Dict[str, str]:
        """Get best models for each algorithm type based on specified metric."""
        best_models = {}
        
        # Group models by algorithm type
        algorithm_groups = {
            'IsolationForest': [name for name in evaluation_results.keys() if name.startswith('IF_')],
            'LOF': [name for name in evaluation_results.keys() if name.startswith('LOF_')],
            'OneClassSVM': [name for name in evaluation_results.keys() if name.startswith('OCSVM_')]
        }
        
        for algo_type, model_names in algorithm_groups.items():
            if model_names:
                # Find best model for this algorithm type
                best_model = max(model_names, key=lambda x: evaluation_results[x].get(metric, 0))
                best_models[algo_type] = best_model
        
        self.best_models = best_models
        return best_models
    
    def ensemble_predict(self, X: np.ndarray, method: str = 'majority_vote') -> np.ndarray:
        """Ensemble prediction from best models of each type."""
        if not self.best_models:
            raise ValueError("No best models selected. Run get_best_models first.")
        
        predictions = self.predict(X)
        ensemble_pred = np.zeros(len(X))
        
        if method == 'majority_vote':
            # Majority voting
            votes = np.zeros((len(X), len(self.best_models)))
            for i, model_name in enumerate(self.best_models.values()):
                if model_name in predictions:
                    pred_binary = (predictions[model_name] == -1).astype(int)
                    votes[:, i] = pred_binary
            
            # Majority vote
            ensemble_pred = (np.sum(votes, axis=1) > len(self.best_models) / 2).astype(int)
        
        elif method == 'average_score':
            # Average anomaly scores
            scores = self.decision_function(X)
            avg_scores = np.zeros(len(X))
            
            for model_name in self.best_models.values():
                if model_name in scores:
                    avg_scores += scores[model_name]
            
            avg_scores /= len(self.best_models)
            # Convert to binary predictions using median threshold
            threshold = np.median(avg_scores)
            ensemble_pred = (avg_scores < threshold).astype(int)  # Lower = more anomalous
        
        return ensemble_pred
    
    def save_models(self, directory: str):
        """Save all fitted models."""
        os.makedirs(directory, exist_ok=True)
        
        # Save scaler
        with open(os.path.join(directory, 'scaler.pkl'), 'wb') as f:
            pickle.dump(self.scaler, f)
        
        # Save models
        for name, model in self.models.items():
            filename = os.path.join(directory, f'{name}.pkl')
            with open(filename, 'wb') as f:
                pickle.dump(model, f)
        
        # Save metadata
        metadata = {
            'best_models': self.best_models,
            'is_fitted': self.is_fitted,
            'contamination_rates': self.contamination_rates
        }
        
        with open(os.path.join(directory, 'metadata.pkl'), 'wb') as f:
            pickle.dump(metadata, f)
        
        print(f"Models saved to {directory}")
    
    @classmethod
    def load_models(cls, directory: str) -> 'AdvancedAnomalyDetector':
        """Load saved models."""
        # Load scaler
        with open(os.path.join(directory, 'scaler.pkl'), 'rb') as f:
            scaler = pickle.load(f)
        
        # Load metadata
        with open(os.path.join(directory, 'metadata.pkl'), 'rb') as f:
            metadata = pickle.load(f)
        
        # Create instance
        instance = cls(contamination_rates=metadata['contamination_rates'])
        instance.scaler = scaler
        instance.best_models = metadata['best_models']
        instance.is_fitted = metadata['is_fitted']
        
        # Load models
        model_files = [f for f in os.listdir(directory) if f.endswith('.pkl') and f != 'scaler.pkl' and f != 'metadata.pkl']
        
        for model_file in model_files:
            model_name = model_file.replace('.pkl', '')
            with open(os.path.join(directory, model_file), 'rb') as f:
                instance.models[model_name] = pickle.load(f)
        
        print(f"Models loaded from {directory}")
        return instance


class HybridAnomalyDetector:
    """Hybrid detector combining ML models with rule-based detection."""
    
    def __init__(self, ml_detector: AdvancedAnomalyDetector, rule_weight: float = 0.4):
        self.ml_detector = ml_detector
        self.rule_weight = rule_weight
        self.ml_weight = 1.0 - rule_weight
        
    def add_rule_scores(self, rule_scores: np.ndarray):
        """Add rule-based anomaly scores."""
        self.rule_scores = rule_scores / 100.0  # Normalize to 0-1
    
    def predict_hybrid(self, X: np.ndarray, method: str = 'weighted_average') -> np.ndarray:
        """Make hybrid predictions combining ML and rules."""
        # Get ML predictions
        ml_predictions = self.ml_detector.ensemble_predict(X, method='average_score')
        
        if hasattr(self, 'rule_scores'):
            if method == 'weighted_average':
                # Weighted combination of ML and rule scores
                hybrid_scores = (self.ml_weight * (1 - ml_predictions) + 
                               self.rule_weight * self.rule_scores)
                
                # Convert to binary predictions
                threshold = np.percentile(hybrid_scores, 90)  # Top 10% as anomalies
                hybrid_predictions = (hybrid_scores > threshold).astype(int)
                
            elif method == 'adaptive_threshold':
                # Adaptive threshold based on both scores
                ml_anomaly_prob = 1 - ml_predictions  # Convert to probability
                combined_prob = self.ml_weight * ml_anomaly_prob + self.rule_weight * self.rule_scores
                
                # Use adaptive threshold
                base_threshold = 0.1
                if np.mean(self.rule_scores) > 0.05:  # If many rules triggered
                    threshold = base_threshold * 0.5  # Lower threshold
                else:
                    threshold = base_threshold
                
                hybrid_predictions = (combined_prob > threshold).astype(int)
            
            return hybrid_predictions
        else:
            return ml_predictions
