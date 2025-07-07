// frontend/src/pages/Home.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Home.css'; // We'll create this CSS file

const Home = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/blogposts');
        setBlogPosts(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
        setLoading(false);
      }
    };
    fetchBlogPosts();
  }, []);

  if (loading) {
    return <div className="container">Loading blog posts...</div>;
  }

  if (error) {
    return <div className="container error-message">{error}</div>;
  }

  return (
    <div className="container">
      <h2>All Blog Posts</h2>
      {blogPosts.length === 0 ? (
        <p>No blog posts found. Be the first to create one!</p>
      ) : (
        <div className="blog-list">
          {blogPosts.map((post) => (
            <div key={post._id} className="blog-card">
              <Link to={`/post/${post._id}`} className="blog-card-link">
                {post.imageUrl && (
                  <img src={post.imageUrl} alt={post.title} className="blog-card-image" />
                )}
                <div className="blog-card-content">
                  <h3>{post.title}</h3>
                  <p className="blog-author">By {post.author ? post.author.username : 'Unknown Author'}</p>
                  <p className="blog-date">{new Date(post.createdAt).toLocaleDateString()}</p>
                  <p>{post.content.substring(0, 150)}...</p> {/* Show a snippet */}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;