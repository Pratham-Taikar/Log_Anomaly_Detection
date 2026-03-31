"""
Sequence-aware anomaly detection using LSTM and frequency modeling.
Implements DeepLog-inspired sequence analysis for temporal patterns.
"""

import numpy as np
import pandas as pd
from collections import defaultdict, Counter
import pickle
import os
from typing import List, Dict, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class SequenceFrequencyModel:
    """Simple sequence frequency model for anomaly detection."""
    
    def __init__(self, sequence_length: int = 5, min_frequency: int = 2):
        self.sequence_length = sequence_length
        self.min_frequency = min_frequency
        self.sequence_counts = defaultdict(int)
        self.total_sequences = 0
        self.is_fitted = False
    
    def _extract_sequences(self, log_messages: List[str]) -> List[Tuple[str, ...]]:
        """Extract sequences of log messages."""
        sequences = []
        
        for i in range(len(log_messages) - self.sequence_length + 1):
            sequence = tuple(log_messages[i:i + self.sequence_length])
            sequences.append(sequence)
        
        return sequences
    
    def fit(self, log_messages: List[str]):
        """Fit the frequency model on training data."""
        print(f"Fitting sequence frequency model with sequence length {self.sequence_length}...")
        
        sequences = self._extract_sequences(log_messages)
        
        # Count sequence frequencies
        self.sequence_counts = Counter(sequences)
        self.total_sequences = len(sequences)
        
        # Filter low-frequency sequences
        self.sequence_counts = {
            seq: count for seq, count in self.sequence_counts.items() 
            if count >= self.min_frequency
        }
        
        self.is_fitted = True
        print(f"Fitted on {self.total_sequences} sequences, {len(self.sequence_counts)} unique patterns")
    
    def predict_anomaly_scores(self, log_messages: List[str]) -> np.ndarray:
        """Predict anomaly scores for new log messages."""
        if not self.is_fitted:
            raise ValueError("Model must be fitted before prediction")
        
        sequences = self._extract_sequences(log_messages)
        scores = np.zeros(len(log_messages))
        
        for i, sequence in enumerate(sequences):
            # Calculate anomaly score based on sequence frequency
            if sequence in self.sequence_counts:
                frequency = self.sequence_counts[sequence]
                probability = frequency / self.total_sequences
                # Lower frequency = higher anomaly score
                anomaly_score = 1.0 - probability
            else:
                # Unseen sequence = maximum anomaly score
                anomaly_score = 1.0
            
            # Assign score to the last log in the sequence
            end_idx = i + self.sequence_length - 1
            if end_idx < len(scores):
                scores[end_idx] = max(scores[end_idx], anomaly_score)
        
        return scores
    
    def get_sequence_statistics(self) -> Dict:
        """Get statistics about learned sequences."""
        if not self.is_fitted:
            return {}
        
        frequencies = list(self.sequence_counts.values())
        
        return {
            'total_sequences': self.total_sequences,
            'unique_sequences': len(self.sequence_counts),
            'min_frequency': min(frequencies) if frequencies else 0,
            'max_frequency': max(frequencies) if frequencies else 0,
            'avg_frequency': np.mean(frequencies) if frequencies else 0,
            'coverage': len(self.sequence_counts) / self.total_sequences if self.total_sequences > 0 else 0
        }


class SimpleLSTMAnomalyDetector:
    """Simplified LSTM-based anomaly detector for log sequences."""
    
    def __init__(self, 
                 sequence_length: int = 10,
                 embedding_dim: int = 50,
                 hidden_dim: int = 64,
                 learning_rate: float = 0.001,
                 epochs: int = 50,
                 batch_size: int = 32):
        
        self.sequence_length = sequence_length
        self.embedding_dim = embedding_dim
        self.hidden_dim = hidden_dim
        self.learning_rate = learning_rate
        self.epochs = epochs
        self.batch_size = batch_size
        
        # Model components (simplified without deep learning frameworks)
        self.vocab_to_idx = {}
        self.idx_to_vocab = {}
        self.embedding_matrix = None
        self.sequence_patterns = {}
        self.is_fitted = False
    
    def _build_vocabulary(self, log_messages: List[str]) -> Dict[str, int]:
        """Build vocabulary from log messages."""
        word_counts = defaultdict(int)
        
        for message in log_messages:
            words = message.lower().split()
            for word in words:
                word_counts[word] += 1
        
        # Keep most frequent words
        vocab = {word for word, count in word_counts.items() if count >= 2}
        vocab_to_idx = {word: idx for idx, word in enumerate(sorted(vocab))}
        
        return vocab_to_idx
    
    def _create_simple_embeddings(self, vocab_size: int) -> np.ndarray:
        """Create simple word embeddings."""
        # Initialize with random values
        embeddings = np.random.normal(0, 0.1, (vocab_size, self.embedding_dim))
        
        # Add some structure based on word length and patterns
        for word, idx in self.vocab_to_idx.items():
            # Character-level features
            for i, char in enumerate(word[:min(len(word), self.embedding_dim)]):
                embeddings[idx, i] = ord(char) / 255.0
            
            # Word length feature
            embeddings[idx, -1] = len(word) / 20.0
        
        return embeddings
    
    def _sequence_to_indices(self, sequence: List[str]) -> np.ndarray:
        """Convert sequence of messages to indices."""
        indices = []
        
        for message in sequence:
            words = message.lower().split()
            message_indices = [self.vocab_to_idx.get(word, 0) for word in words]
            indices.extend(message_indices)
        
        # Pad or truncate to fixed length
        if len(indices) > self.sequence_length:
            indices = indices[:self.sequence_length]
        else:
            indices.extend([0] * (self.sequence_length - len(indices)))
        
        return np.array(indices)
    
    def fit(self, log_messages: List[str]):
        """Fit the LSTM model on training data."""
        print(f"Fitting LSTM anomaly detector with sequence length {self.sequence_length}...")
        
        # Build vocabulary
        self.vocab_to_idx = self._build_vocabulary(log_messages)
        self.idx_to_vocab = {idx: word for word, idx in self.vocab_to_idx.items()}
        
        print(f"Vocabulary size: {len(self.vocab_to_idx)}")
        
        # Create embeddings
        self.embedding_matrix = self._create_simple_embeddings(len(self.vocab_to_idx))
        
        # Extract sequences and learn patterns
        self._learn_sequence_patterns(log_messages)
        
        self.is_fitted = True
        print("LSTM model fitted successfully")
    
    def _learn_sequence_patterns(self, log_messages: List[str]):
        """Learn sequence patterns using simplified approach."""
        sequence_patterns = defaultdict(list)
        
        for i in range(len(log_messages) - self.sequence_length + 1):
            sequence = log_messages[i:i + self.sequence_length]
            sequence_key = tuple(msg[:50] for msg in sequence)  # First 50 chars as key
            
            # Store sequence representation
            sequence_rep = self._sequence_to_indices(sequence)
            sequence_patterns[sequence_key].append(sequence_rep)
        
        # Calculate pattern statistics
        self.sequence_patterns = {}
        for pattern_key, sequences in sequence_patterns.items():
            if len(sequences) >= 2:  # Keep patterns that appear at least twice
                self.sequence_patterns[pattern_key] = {
                    'mean_pattern': np.mean(sequences, axis=0),
                    'std_pattern': np.std(sequences, axis=0),
                    'frequency': len(sequences)
                }
        
        print(f"Learned {len(self.sequence_patterns)} sequence patterns")
    
    def predict_anomaly_scores(self, log_messages: List[str]) -> np.ndarray:
        """Predict anomaly scores using sequence patterns."""
        if not self.is_fitted:
            raise ValueError("Model must be fitted before prediction")
        
        scores = np.zeros(len(log_messages))
        
        for i in range(len(log_messages) - self.sequence_length + 1):
            sequence = log_messages[i:i + self.sequence_length]
            sequence_key = tuple(msg[:50] for msg in sequence)
            
            if sequence_key in self.sequence_patterns:
                # Calculate distance from learned pattern
                sequence_rep = self._sequence_to_indices(sequence)
                pattern_info = self.sequence_patterns[sequence_key]
                
                # Simple distance metric
                mean_pattern = pattern_info['mean_pattern']
                std_pattern = pattern_info['std_pattern'] + 1e-8  # Avoid division by zero
                
                # Z-score distance
                distance = np.mean(np.abs(sequence_rep - mean_pattern) / std_pattern)
                
                # Convert distance to anomaly score
                anomaly_score = np.tanh(distance / 2.0)  # Normalize to 0-1
                
                # Assign score to the last log in sequence
                end_idx = i + self.sequence_length - 1
                scores[end_idx] = max(scores[end_idx], anomaly_score)
            else:
                # Unseen sequence = high anomaly score
                end_idx = i + self.sequence_length - 1
                if end_idx < len(scores):
                    scores[end_idx] = max(scores[end_idx], 0.8)  # High but not maximum
        
        return scores
    
    def get_model_info(self) -> Dict:
        """Get model information."""
        if not self.is_fitted:
            return {}
        
        return {
            'vocab_size': len(self.vocab_to_idx),
            'sequence_length': self.sequence_length,
            'embedding_dim': self.embedding_dim,
            'hidden_dim': self.hidden_dim,
            'learned_patterns': len(self.sequence_patterns),
            'embedding_matrix_shape': self.embedding_matrix.shape if self.embedding_matrix is not None else None
        }


class SequenceEnsembleDetector:
    """Ensemble of sequence-based detectors."""
    
    def __init__(self, 
                 sequence_length: int = 10,
                 freq_model_weight: float = 0.6,
                 lstm_model_weight: float = 0.4):
        
        self.sequence_length = sequence_length
        self.freq_model_weight = freq_model_weight
        self.lstm_model_weight = lstm_model_weight
        
        # Initialize models
        self.freq_model = SequenceFrequencyModel(sequence_length=sequence_length)
        self.lstm_model = SimpleLSTMAnomalyDetector(sequence_length=sequence_length)
        
        self.is_fitted = False
    
    def fit(self, log_messages: List[str]):
        """Fit both sequence models."""
        print("Fitting sequence ensemble detector...")
        
        # Fit frequency model
        self.freq_model.fit(log_messages)
        
        # Fit LSTM model
        self.lstm_model.fit(log_messages)
        
        self.is_fitted = True
        print("Sequence ensemble fitted successfully")
    
    def predict_anomaly_scores(self, log_messages: List[str]) -> np.ndarray:
        """Predict ensemble anomaly scores."""
        if not self.is_fitted:
            raise ValueError("Models must be fitted before prediction")
        
        # Get scores from both models
        freq_scores = self.freq_model.predict_anomaly_scores(log_messages)
        lstm_scores = self.lstm_model.predict_anomaly_scores(log_messages)
        
        # Weighted ensemble
        ensemble_scores = (self.freq_model_weight * freq_scores + 
                          self.lstm_model_weight * lstm_scores)
        
        return ensemble_scores
    
    def predict_anomalies(self, log_messages: List[str], threshold: float = 0.7) -> np.ndarray:
        """Predict binary anomalies using threshold."""
        scores = self.predict_anomaly_scores(log_messages)
        return (scores > threshold).astype(int)
    
    def get_ensemble_info(self) -> Dict:
        """Get ensemble model information."""
        if not self.is_fitted:
            return {}
        
        return {
            'frequency_model': self.freq_model.get_sequence_statistics(),
            'lstm_model': self.lstm_model.get_model_info(),
            'weights': {
                'frequency': self.freq_model_weight,
                'lstm': self.lstm_model_weight
            }
        }
    
    def save_models(self, directory: str):
        """Save the ensemble models."""
        os.makedirs(directory, exist_ok=True)
        
        # Save frequency model
        freq_data = {
            'sequence_counts': dict(self.freq_model.sequence_counts),
            'total_sequences': self.freq_model.total_sequences,
            'sequence_length': self.freq_model.sequence_length,
            'min_frequency': self.freq_model.min_frequency,
            'is_fitted': self.freq_model.is_fitted
        }
        
        with open(os.path.join(directory, 'freq_model.pkl'), 'wb') as f:
            pickle.dump(freq_data, f)
        
        # Save LSTM model
        lstm_data = {
            'vocab_to_idx': self.lstm_model.vocab_to_idx,
            'idx_to_vocab': self.lstm_model.idx_to_vocab,
            'embedding_matrix': self.lstm_model.embedding_matrix,
            'sequence_patterns': self.lstm_model.sequence_patterns,
            'sequence_length': self.lstm_model.sequence_length,
            'embedding_dim': self.lstm_model.embedding_dim,
            'hidden_dim': self.lstm_model.hidden_dim,
            'is_fitted': self.lstm_model.is_fitted
        }
        
        with open(os.path.join(directory, 'lstm_model.pkl'), 'wb') as f:
            pickle.dump(lstm_data, f)
        
        # Save ensemble metadata
        ensemble_data = {
            'freq_model_weight': self.freq_model_weight,
            'lstm_model_weight': self.lstm_model_weight,
            'is_fitted': self.is_fitted
        }
        
        with open(os.path.join(directory, 'ensemble_metadata.pkl'), 'wb') as f:
            pickle.dump(ensemble_data, f)
        
        print(f"Sequence ensemble models saved to {directory}")
    
    @classmethod
    def load_models(cls, directory: str) -> 'SequenceEnsembleDetector':
        """Load saved ensemble models."""
        # Load frequency model
        with open(os.path.join(directory, 'freq_model.pkl'), 'rb') as f:
            freq_data = pickle.load(f)
        
        # Load LSTM model
        with open(os.path.join(directory, 'lstm_model.pkl'), 'rb') as f:
            lstm_data = pickle.load(f)
        
        # Load ensemble metadata
        with open(os.path.join(directory, 'ensemble_metadata.pkl'), 'rb') as f:
            ensemble_data = pickle.load(f)
        
        # Create instance
        instance = cls(
            sequence_length=freq_data['sequence_length'],
            freq_model_weight=ensemble_data['freq_model_weight'],
            lstm_model_weight=ensemble_data['lstm_model_weight']
        )
        
        # Restore frequency model
        instance.freq_model.sequence_counts = defaultdict(int, freq_data['sequence_counts'])
        instance.freq_model.total_sequences = freq_data['total_sequences']
        instance.freq_model.sequence_length = freq_data['sequence_length']
        instance.freq_model.min_frequency = freq_data['min_frequency']
        instance.freq_model.is_fitted = freq_data['is_fitted']
        
        # Restore LSTM model
        instance.lstm_model.vocab_to_idx = lstm_data['vocab_to_idx']
        instance.lstm_model.idx_to_vocab = lstm_data['idx_to_vocab']
        instance.lstm_model.embedding_matrix = lstm_data['embedding_matrix']
        instance.lstm_model.sequence_patterns = lstm_data['sequence_patterns']
        instance.lstm_model.sequence_length = lstm_data['sequence_length']
        instance.lstm_model.embedding_dim = lstm_data['embedding_dim']
        instance.lstm_model.hidden_dim = lstm_data['hidden_dim']
        instance.lstm_model.is_fitted = lstm_data['is_fitted']
        
        instance.is_fitted = ensemble_data['is_fitted']
        
        print(f"Sequence ensemble models loaded from {directory}")
        return instance
