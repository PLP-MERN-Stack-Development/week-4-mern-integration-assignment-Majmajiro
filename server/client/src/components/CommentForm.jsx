// components/CommentForm.jsx
import { useState } from 'react';
import axios from 'axios';

function CommentForm({ postId, onCommentAdded }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`/api/posts/${postId}/comments`, {
        content,
      });
      onCommentAdded(res.data); // Trigger refresh of comment list
      setContent('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        required
        rows="3"
        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
      ></textarea>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button
        type="submit"
        disabled={loading || !content.trim()}
        style={{ marginTop: '0.5rem', padding: '0.4rem 1rem' }}
      >
        {loading ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  );
}

export default CommentForm;
