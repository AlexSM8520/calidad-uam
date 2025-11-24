import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginViewModel } from '../../viewmodels/LoginViewModel';
import { authViewModel } from '../../viewmodels/AuthViewModel';
import './Login.css';

const loginViewModel = new LoginViewModel();

export const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Subscribe to view model changes
    const unsubscribe = loginViewModel.subscribe(() => {
      setError(loginViewModel.getError());
      setIsLoading(loginViewModel.getIsLoading());
    });

    // Check if already authenticated
    if (authViewModel.isAuthenticated()) {
      navigate('/home');
    }

    return unsubscribe;
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await loginViewModel.handleLogin(username, password);
    if (success) {
      navigate('/home');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              disabled={isLoading}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={isLoading} className="login-button">
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          <div className="login-hint">
            <small>Default: Admin / 123</small>
          </div>
        </form>
      </div>
    </div>
  );
};

