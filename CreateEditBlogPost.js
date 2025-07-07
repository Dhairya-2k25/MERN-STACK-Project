// frontend/src/pages/CreateEditBlogPost.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext'; // Import useAuth
import './CreateEditBlogPost.css'; // We'll create this CSS file

const CreateEditBlogPost = () => {
  const { id } = useParams(); // Get ID from URL for editing
  const navigate = useNavigate();
  const { token, user, loading: authLoading } = useAuth(); // Get token and user from context

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState(''); // Comma-separated string
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true); // For initial data fetch (edit mode)
  const [error, setError] = useState(null);

  useEffect(() => {
    // If in edit mode (ID exists in URL)
    if (id) {
      const fetchPost = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/blogposts/${id}`);
          const post = res.data;
          // Check if logged-in user is the author
          if (authLoading) return; // Wait for auth context to load
          if (!user || !post.author || user._id !== post.author._id) { // <--- CHANGE user.id to user._id here
            navigate('/'); // Redirect if not authorized to edit
            alert('You are not authorized to edit this post.');
            return;
}
          setTitle(post.title);
          setContent(post.content);
          setCategory(post.category || '');
          setTags(post.tags ? post.tags.join(', ') : '');
          setImageUrl(post.imageUrl || '');
          setLoading(false);
        } catch (err) {
          console.error('Error fetching post for edit:', err);
          setError('Failed to load post for editing.');
          setLoading(false);
        }
      };
      fetchPost();
    } else {
      setLoading(false); // Not in edit mode, no initial data fetch needed
    }
  }, [id, navigate, user, authLoading]); // Rerun if ID or user changes

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert('You need to be logged in to create or edit posts.');
      navigate('/login');
      return;
    }

    const postData = {
      title,
      content,
      category,
      tags,
      imageUrl,
    };

    try {
      if (id) {
        // Update existing post
        await axios.put(`http://localhost:5000/api/blogposts/${id}`, postData, {
          headers: {
            'x-auth-token': token,
          },
        });
        alert('Blog post updated successfully!');
      } else {
        // Create new post
        await axios.post('http://localhost:5000/api/blogposts', postData, {
          headers: {
            'x-auth-token': token,
          },
        });
        alert('Blog post created successfully!');
      }
      navigate('/'); // Redirect to home page
    } catch (err) {
      console.error('Error submitting blog post:', err.response ? err.response.data.msg : err.message);
      alert('Failed to save blog post. Please ensure all fields are filled and you are logged in.');
    }
  };

  if (loading || authLoading) {
    return <div className="form-container">Loading form...</div>;
  }

  if (error) {
    return <div className="form-container error-message">{error}</div>;
  }


  return (
    <div className="form-container">
      <h2>{id ? 'Edit Blog Post' : 'Create New Blog Post'}</h2>
      <form onSubmit={handleSubmit} className="blog-form">
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows="10"
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="category">Category (Optional):</label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="tags">Tags (Comma-separated, Optional):</label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., react, nodejs, webdev"
          />
        </div>
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL (Optional):</label>
          <input
            type="text"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <button type="submit" className="submit-button">
          {id ? 'Update Post' : 'Create Post'}
        </button>
      </form>
    </div>
  );
};

export default CreateEditBlogPost;