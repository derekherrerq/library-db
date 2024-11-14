import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../components/Authentication/AuthContext';
import './Login.css';

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        login(data.token, data.role, data.userID);

        if (data.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (data.role === 'staff') {
          navigate('/staff-dashboard');
        } else {
          navigate('/user-dashboard');
        }
      } else {
        setErrorMessage(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An error occurred during login.');
    }
  };

  const handleRegistrationClick = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {errorMessage && <p className="error-msg">{errorMessage}</p>}
        <div className="form-control">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-control">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
        <p className="registration-text" onClick={handleRegistrationClick}>
          Don’t have an account? <span>Register here</span>
        </p>
      </form>
    </div>
  );
}

export default Login;