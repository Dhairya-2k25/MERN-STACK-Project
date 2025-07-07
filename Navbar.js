// frontend/src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <h1 className="navbar-title">
        <Link to="/">P11 Blog</Link>
      </h1>
      <ul className="navbar-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        {user ? (
          <>
            <li>Welcome, {user.username}!</li>
            <li>
              <Link to="/create-post">Create Post</Link>
            </li>
            <li>
              <button onClick={logout} className="logout-btn">Logout</button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;