// frontend/src/pages/BlogPostDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';
import './BlogPostDetail.css';

const BlogPostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useAuth(); // Get user and token from auth context
  const navigate = useNavigate();

  // >>>>>> ADD THESE CONSOLE.LOGS HERE <<<<<<<
  console.log('Current User (from AuthContext):', user);
  console.log('Current Post Data:', post);
  if (user && post && post.author) {
      console.log('User ID:', user.id);
      console.log('Post Author ID:', post.author._id);
      console.log('Are IDs matching (user.id === post.author._id)?', user.id === post.author._id);
  }
  // >>>>>> END OF CONSOLE.LOGS <<<<<<<


  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/blogposts/${id}`);
        setPost(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post. It might not exist.');
        setLoading(false);
      }
    };
    fetchBlogPost();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`http://localhost:5000/api/blogposts/${id}`, {
          headers: {
            'x-auth-token': token,
          },
        });
        alert('Blog post deleted successfully!');
        navigate('/');
      } catch (err) {
        console.error('Error deleting blog post:', err.response ? err.response.data.msg : err.message);
        alert('Failed to delete post. You might not be authorized.');
      }
    }
  };

  if (loading) {
    return <div className="detail-container">Loading post...</div>;
  }

  if (error) {
    return <div className="detail-container error-message">{error}</div>;
  }

  if (!post) {
    return <div className="detail-container">Blog post not found.</div>;
  }

  const isAuthor = user && post.author && user._id === post.author._id;

  return (
    <div className="detail-container">
      {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="detail-image" />}
      <h2 className="detail-title">{post.title}</h2>
      <p className="detail-meta">
        By {post.author ? post.author.username : 'Unknown Author'} on {new Date(post.createdAt).toLocaleDateString()}
        {post.updatedAt && new Date(post.updatedAt).getTime() !== new Date(post.createdAt).getTime() && (
          <span> (Last updated: {new Date(post.updatedAt).toLocaleDateString()})</span>
        )}
      </p>
      {post.category && <span className="detail-category">Category: {post.category}</span>}
      {post.tags && post.tags.length > 0 && (
        <div className="detail-tags">
          Tags: {post.tags.map((tag, index) => <span key={index} className="tag">{tag}</span>)}
        </div>
      )}
      <div className="detail-content">
        <p>{post.content}</p>
      </div>

      {isAuthor && (
        <div className="detail-actions">
          <Link to={`/edit-post/${post._id}`} className="edit-button">Edit Post</Link>
          <button onClick={handleDelete} className="delete-button">Delete Post</button>
        </div>
      )}
    </div>
  );
};

export default BlogPostDetail;