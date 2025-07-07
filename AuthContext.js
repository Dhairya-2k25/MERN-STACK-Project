// frontend/src/components/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token')); // Try to get token from localStorage
  const [loading, setLoading] = useState(true);

  // Set the Authorization header for all Axios requests if a token exists
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  }, [token]);

  // Function to load the user when the component mounts or token changes
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          // Verify token with the backend
          const res = await axios.get('http://localhost:5000/api/auth/user');
          setUser(res.data);
        } catch (err) {
          console.error('Error loading user:', err);
          localStorage.removeItem('token'); // Token might be invalid, remove it
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]); // Rerun when token changes

  const login = async (email, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user); // Store user data returned by backend
      return true; // Indicate success
    } catch (err) {
      console.error('Login error:', err.response ? err.response.data.msg : err.message);
      return false; // Indicate failure
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { username, email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return true;
    } catch (err) {
      console.error('Register error:', err.response ? err.response.data.msg : err.message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);