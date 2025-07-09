import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { usePosts } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import CommentForm from '../components/CommentForm';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts, removePost } = usePosts();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    const found = posts.find((p) => p._id === id);
    if (found) {
      setPost(found);
      fetchComments();
    } else {
      setError('Post not found');
    }
  }, [id, posts]);

  const fetchComments = async () => {
    try {
      console.log('Fetching comments for post:', id); // Debug
      const response = await fetch(`http://localhost:5001/api/comments/post/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('Comments fetched:', data.comments); // Debug
        setComments(data.comments || []);
      } else {
        console.error('Failed to fetch comments:', data.error);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

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
    console.log('New comment added:', newComment); // Debug
    setComments((prev) => [newComment, ...prev]); // Add to beginning
  };

  // Check if current user is the author
  const isAuthor = user && post && (post.author._id === user.id || post.author === user.id);

  if (error) return <p style={{ padding: '2rem', color: 'red' }}>{error}</p>;
  if (!post) return <p style={{ padding: '2rem' }}>Loading post...</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h1 style={{ color: '#008080' }}>{post.title}</h1>
      <p style={{ color: '#2F4F4F', marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
        {post.content}
      </p>
      <small style={{ color: 'gray' }}>
        Created: {new Date(post.createdAt).toLocaleString()}
        {post.author && typeof post.author === 'object' && (
          <span> by {post.author.name}</span>
        )}
      </small>

      {/* Only show edit/delete buttons if user is the author */}
      {isAuthor && (
        <div style={{ marginTop: '2rem' }}>
          <Link
            to={`/posts/${post._id}/edit`}
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
      )}

      {/* Comments Section */}
      <div style={{ marginTop: '3rem' }}>
        <h3>🗨️ Comments</h3>
        
        {loadingComments ? (
          <p>Loading comments...</p>
        ) : comments.length === 0 ? (
          <p>No comments yet. Be the first to comment!</p>
        ) : (
          <div style={{ marginBottom: '2rem' }}>
            {comments.map((comment) => (
              <div
                key={comment._id}
                style={{
                  borderBottom: '1px solid #eee',
                  padding: '1rem 0',
                  marginBottom: '1rem',
                }}
              >
                <p style={{ margin: '0 0 0.5rem 0' }}>{comment.content}</p>
                <small style={{ color: 'gray' }}>
                  By {comment.user?.name || 'Anonymous'} on{' '}
                  {new Date(comment.createdAt).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
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
