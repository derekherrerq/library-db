import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../components/Authentication/AuthContext';
import './Login.css';

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // State variables for form inputs and error message
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send login request to the backend
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update authentication state with token, role, and userID
        login(data.token, data.role, data.userID); // Pass userID to login

        // Remove localStorage setting if not needed
        // localStorage.setItem('userID', data.userID); // Optional: Remove this line

        // Redirect based on role
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
      console.error('Login error:', error); // For debugging
      setErrorMessage('An error occurred during login.');
    }
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
      </form>
    </div>
  );
}

export default Login;