"""
Advanced text representation for log anomaly detection.
Implements TF-IDF with n-grams and sentence embeddings.
"""

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import StandardScaler
import pickle
import os
from typing import List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class AdvancedTextVectorizer:
    """Advanced text vectorization with TF-IDF and optional embeddings."""
    
    def __init__(self, 
                 max_features: int = 10000,
                 ngram_range: Tuple[int, int] = (1, 2),
                 min_df: int = 2,
                 max_df: float = 0.95,
                 use_svd: bool = True,
                 svd_components: int = 300):
        
        self.max_features = max_features
        self.ngram_range = ngram_range
        self.min_df = min_df
        self.max_df = max_df
        self.use_svd = use_svd
        self.svd_components = svd_components
        
        # Initialize TF-IDF vectorizer
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=max_features,
            ngram_range=ngram_range,
            min_df=min_df,
            max_df=max_df,
            stop_words='english',
            lowercase=True,
            sublinear_tf=True,
            norm='l2'
        )
        
        # Initialize SVD for dimensionality reduction
        if use_svd:
            self.svd = TruncatedSVD(
                n_components=svd_components,
                random_state=42,
                algorithm='randomized'
            )
            self.scaler = StandardScaler()
        
        self.is_fitted = False
        self.feature_names = []
    
    def preprocess_texts(self, texts: List[str]) -> List[str]:
        """Preprocess text data for better vectorization."""
        processed_texts = []
        
        for text in texts:
            # Basic cleaning
            processed = text.lower()
            
            # Remove timestamps (common pattern)
            processed = self._remove_timestamps(processed)
            
            # Remove IP addresses
            processed = self._remove_ips(processed)
            
            # Remove numbers but keep important ones
            processed = self._clean_numbers(processed)
            
            # Remove extra whitespace
            processed = ' '.join(processed.split())
            
            processed_texts.append(processed)
        
        return processed_texts
    
    def _remove_timestamps(self, text: str) -> str:
        """Remove timestamp patterns."""
        import re
        # Remove various timestamp patterns
        patterns = [
            r'\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}',
            r'\d{2}/\d{2}/\d{4}\s+\d{2}:\d{2}:\d{2}',
            r'\d{2}:\d{2}:\d{2}',
        ]
        for pattern in patterns:
            text = re.sub(pattern, '', text)
        return text
    
    def _remove_ips(self, text: str) -> str:
        """Remove IP addresses."""
        import re
        return re.sub(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', '<IP>', text)
    
    def _clean_numbers(self, text: str) -> str:
        """Clean numbers but keep important ones."""
        import re
        # Replace long numbers with placeholders
        text = re.sub(r'\b\d{8,}\b', '<LONGNUM>', text)
        # Replace status codes
        text = re.sub(r'\b[1-5]\d{2}\b', '<STATUS>', text)
        # Replace port numbers
        text = re.sub(r'\bport\s+\d+\b', '<PORT>', text)
        return text
    
    def fit(self, texts: List[str]) -> 'AdvancedTextVectorizer':
        """Fit the vectorizer on training data."""
        print("Preprocessing texts...")
        processed_texts = self.preprocess_texts(texts)
        
        print("Fitting TF-IDF vectorizer...")
        tfidf_matrix = self.tfidf_vectorizer.fit_transform(processed_texts)
        
        if self.use_svd:
            print(f"Applying SVD dimensionality reduction to {self.svd_components} components...")
            self.svd.fit(tfidf_matrix)
            
            # Transform and scale
            tfidf_reduced = self.svd.transform(tfidf_matrix)
            self.scaler.fit(tfidf_reduced)
        
        self.is_fitted = True
        self.feature_names = self.tfidf_vectorizer.get_feature_names_out()
        
        print(f"TF-IDF vocabulary size: {len(self.feature_names)}")
        print(f"Final feature dimension: {self.svd_components if self.use_svd else len(self.feature_names)}")
        
        return self
    
    def transform(self, texts: List[str]) -> np.ndarray:
        """Transform texts to feature vectors."""
        if not self.is_fitted:
            raise ValueError("Vectorizer must be fitted before transform")
        
        processed_texts = self.preprocess_texts(texts)
        tfidf_matrix = self.tfidf_vectorizer.transform(processed_texts)
        
        if self.use_svd:
            tfidf_reduced = self.svd.transform(tfidf_matrix)
            tfidf_scaled = self.scaler.transform(tfidf_reduced)
            return tfidf_scaled
        
        return tfidf_matrix.toarray()
    
    def fit_transform(self, texts: List[str]) -> np.ndarray:
        """Fit and transform in one step."""
        return self.fit(texts).transform(texts)
    
    def get_feature_importance(self, texts: List[str], top_k: int = 20) -> List[Tuple[str, float]]:
        """Get most important features based on average TF-IDF scores."""
        if not self.is_fitted:
            raise ValueError("Vectorizer must be fitted first")
        
        tfidf_matrix = self.tfidf_vectorizer.transform(self.preprocess_texts(texts))
        mean_scores = np.mean(tfidf_matrix.toarray(), axis=0)
        
        # Get top features
        top_indices = np.argsort(mean_scores)[-top_k:][::-1]
        top_features = [(self.feature_names[i], mean_scores[i]) for i in top_indices]
        
        return top_features
    
    def save(self, filepath: str):
        """Save the vectorizer components."""
        save_data = {
            'tfidf_vectorizer': self.tfidf_vectorizer,
            'svd': self.svd if self.use_svd else None,
            'scaler': self.scaler if self.use_svd else None,
            'is_fitted': self.is_fitted,
            'feature_names': self.feature_names,
            'params': {
                'max_features': self.max_features,
                'ngram_range': self.ngram_range,
                'min_df': self.min_df,
                'max_df': self.max_df,
                'use_svd': self.use_svd,
                'svd_components': self.svd_components
            }
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(save_data, f)
        
        print(f"Vectorizer saved to {filepath}")
    
    @classmethod
    def load(cls, filepath: str) -> 'AdvancedTextVectorizer':
        """Load a saved vectorizer."""
        with open(filepath, 'rb') as f:
            save_data = pickle.load(f)
        
        instance = cls(**save_data['params'])
        instance.tfidf_vectorizer = save_data['tfidf_vectorizer']
        if instance.use_svd:
            instance.svd = save_data['svd']
            instance.scaler = save_data['scaler']
        instance.is_fitted = save_data['is_fitted']
        instance.feature_names = save_data['feature_names']
        
        print(f"Vectorizer loaded from {filepath}")
        return instance


class SimpleSentenceEmbedder:
    """Simple sentence embedding using TF-IDF weighted averaging."""
    
    def __init__(self, embedding_dim: int = 300):
        self.embedding_dim = embedding_dim
        self.word_to_vec = {}
        self.tfidf_vectorizer = None
        self.is_fitted = False
    
    def _create_simple_embeddings(self, vocabulary: List[str]) -> dict:
        """Create simple word embeddings based on character patterns."""
        embeddings = {}
        
        for word in vocabulary:
            # Create embedding based on character n-grams and patterns
            vec = np.zeros(self.embedding_dim)
            
            # Character-level features
            for i, char in enumerate(word[:min(len(word), self.embedding_dim)]):
                vec[i] = ord(char) / 255.0
            
            # Length features
            if len(word) > 0:
                vec[self.embedding_dim - 3] = len(word) / 20.0  # Normalized length
                vec[self.embedding_dim - 2] = word.count('@') > 0  # Has @
                vec[self.embedding_dim - 1] = word.isdigit()  # Is numeric
            
            embeddings[word] = vec
        
        return embeddings
    
    def fit(self, texts: List[str]):
        """Fit the embedder on training data."""
        from sklearn.feature_extraction.text import TfidfVectorizer
        
        # Create TF-IDF for weighting
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 1),
            min_df=2,
            stop_words='english'
        )
        self.tfidf_vectorizer.fit(texts)
        
        # Create simple embeddings for vocabulary
        vocabulary = self.tfidf_vectorizer.get_feature_names_out()
        print(f"Creating embeddings for {len(vocabulary)} words...")
        self.word_to_vec = self._create_simple_embeddings(vocabulary)
        
        self.is_fitted = True
        print(f"Sentence embedder fitted with {self.embedding_dim}D embeddings")
    
    def _get_sentence_embedding(self, text: str) -> np.ndarray:
        """Get embedding for a single sentence."""
        if not self.is_fitted:
            raise ValueError("Embedder must be fitted first")
        
        # Get TF-IDF weights
        try:
            tfidf_vec = self.tfidf_vectorizer.transform([text])
            feature_names = self.tfidf_vectorizer.get_feature_names_out()
            word_scores = dict(zip(feature_names, tfidf_vec.toarray()[0]))
        except:
            return np.zeros(self.embedding_dim)
        
        # Weighted average of word embeddings
        embedding = np.zeros(self.embedding_dim)
        total_weight = 0
        
        for word, weight in word_scores.items():
            if weight > 0 and word in self.word_to_vec:
                embedding += weight * self.word_to_vec[word]
                total_weight += weight
        
        if total_weight > 0:
            embedding /= total_weight
        
        return embedding
    
    def transform(self, texts: List[str]) -> np.ndarray:
        """Transform texts to sentence embeddings."""
        embeddings = []
        
        for text in texts:
            embedding = self._get_sentence_embedding(text)
            embeddings.append(embedding)
        
        return np.array(embeddings)
    
    def fit_transform(self, texts: List[str]) -> np.ndarray:
        """Fit and transform in one step."""
        self.fit(texts)
        return self.transform(texts)
