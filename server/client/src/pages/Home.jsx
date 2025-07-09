import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostContext';

function Home() {
  const { posts, loading, error } = usePosts();

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h1 style={{ color: '#008080', fontSize: '2rem', marginBottom: '1.5rem' }}>
        📚 Blog Posts
      </h1>

      {loading && <p style={{ color: '#999' }}>Loading posts...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {posts.length === 0 && !loading ? (
        <p style={{ color: '#2F4F4F' }}>No posts found.</p>
      ) : (
        posts.map(post => (
          <div
            key={post._id}
            style={{
              background: '#E0F7F5',
              borderLeft: '6px solid #FFA500',
              padding: '1rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            }}
          >
            <h2 style={{ color: '#008080', marginBottom: '0.5rem' }}>
              <Link to={`/posts/${post._id}`} style={{ textDecoration: 'none', color: '#008080' }}>
                {post.title}
              </Link>
            </h2>

            <p style={{ color: '#2F4F4F' }}>
              {post.excerpt || post.content?.slice(0, 150) + '...'}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default Home;
