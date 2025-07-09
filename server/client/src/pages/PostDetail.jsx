import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { usePosts } from '../context/PostContext';
import CommentForm from '../components/CommentForm';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts, removePost } = usePosts();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const found = posts.find((p) => p._id === id);
    if (found) {
      setPost(found);
      setComments(found.comments || []);
    } else {
      setError('Post not found');
    }
  }, [id, posts]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await removePost(id);
      navigate('/');
    } catch (err) {
      alert('❌ Failed to delete post.');
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments((prev) => [...prev, newComment]);
  };

  if (error) return <p style={{ padding: '2rem', color: 'red' }}>{error}</p>;
  if (!post) return <p style={{ padding: '2rem' }}>Loading post...</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h1 style={{ color: '#008080' }}>{post.title}</h1>
      <p style={{ color: '#2F4F4F', marginTop: '1rem' }}>{post.content}</p>
      <small style={{ color: 'gray' }}>
        Created: {new Date(post.createdAt).toLocaleString()}
      </small>

      <div style={{ marginTop: '2rem' }}>
        <Link
          to={`/edit/${post._id}`}
          style={{
            marginRight: '1rem',
            background: '#008080',
            color: 'white',
            padding: '0.5rem 1rem',
            textDecoration: 'none',
            borderRadius: '6px',
          }}
        >
          ✏️ Edit
        </Link>

        <button
          onClick={handleDelete}
          style={{
            background: '#FF6347',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          🗑️ Delete
        </button>
      </div>

      {/* Comments Section */}
      <div style={{ marginTop: '3rem' }}>
        <h3>🗨️ Comments</h3>
        {comments.length === 0 ? (
          <p>No comments yet. Be the first to comment!</p>
        ) : (
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {comments.map((comment, index) => (
              <li
                key={comment._id || index}
                style={{
                  borderBottom: '1px solid #ccc',
                  padding: '0.5rem 0',
                  marginBottom: '0.5rem',
                }}
              >
                <p>{comment.content}</p>
                <small style={{ color: 'gray' }}>
                  {new Date(comment.createdAt).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        )}

        <CommentForm postId={post._id} onCommentAdded={handleCommentAdded} />
      </div>

      <Link
        to="/"
        style={{
          display: 'inline-block',
          marginTop: '2rem',
          color: '#FFA500',
          textDecoration: 'none',
        }}
      >
        ← Back to posts
      </Link>
    </div>
  );
}

export default PostDetail;
