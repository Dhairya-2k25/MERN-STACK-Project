// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import BlogPostDetail from './pages/BlogPostDetail';
import CreateEditBlogPost from './pages/CreateEditBlogPost';
import './App.css'; // Main App CSS

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <main className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/post/:id" element={<BlogPostDetail />} />
              <Route path="/create-post" element={<CreateEditBlogPost />} />
              <Route path="/edit-post/:id" element={<CreateEditBlogPost />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;