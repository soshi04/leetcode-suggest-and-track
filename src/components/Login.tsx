import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export function Login() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="login-root">
      <div className="login-card">
        <h1 className="login-title">LeetCode Suggest</h1>
        <p className="login-desc">
          Welcome to Leetcode Suggest, type login to lookup any username's stats and get a personalized AI recommendation on what to improve!
        </p>
        <button onClick={signInWithGoogle} className="google-btn">
          <img
            src="/google_logo.png"
            alt="Google logo"
            className="google-logo"
          />
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
} 