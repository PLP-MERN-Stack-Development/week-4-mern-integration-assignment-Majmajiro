// src/components/CommentForm.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function CommentForm({ postId, onCommentAdded }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to comment');
      return;
    }

    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Submitting comment for post:', postId); // Debug
      console.log('Comment content:', content); // Debug
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/comments/post/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: content.trim() })
      });

      const data = await response.json();
      console.log('Comment response:', data); // Debug

      if (response.ok) {
        console.log('Comment posted successfully'); // Debug
        onCommentAdded(data.comment);
        setContent('');
        setError('');
      } else {
        console.log('Comment failed:', data.error); // Debug
        setError(data.error || 'Failed to post comment');
      }
    } catch (err) {
      console.error('Comment submission error:', err); // Debug
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ 
        marginTop: '1rem', 
        padding: '1rem', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '4px',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, color: '#6c757d' }}>
          Please <a href="/login" style={{ color: '#007bff' }}>log in</a> to post a comment.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          required
          rows="3"
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            borderRadius: '4px',
            border: '1px solid #ddd',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
        {error && (
          <p style={{ 
            color: 'red', 
            marginTop: '0.5rem', 
            marginBottom: '0.5rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !content.trim()}
          style={{ 
            marginTop: '0.5rem', 
            padding: '0.6rem 1.2rem',
            backgroundColor: loading || !content.trim() ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !content.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
    </div>
  );
}

export default CommentForm;
