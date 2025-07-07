import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then(res => res.json())
      .then(data => setPost(data))
      .catch(err => console.error('❌ Error fetching post:', err));
  }, [id]);

  if (!post) {
    return <p style={{ padding: '2rem' }}>Loading post...</p>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h1 style={{ color: '#008080' }}>{post.title}</h1>
      <p style={{ color: '#2F4F4F', marginTop: '1rem' }}>{post.content}</p>
      <small style={{ color: 'gray' }}>
        Created: {new Date(post.createdAt).toLocaleString()}
      </small>

      <Link to="/" style={{ display: 'inline-block', marginTop: '2rem', color: '#FFA500' }}>
        ← Back to posts
      </Link>
    </div>
  );
}

export default PostDetail;
