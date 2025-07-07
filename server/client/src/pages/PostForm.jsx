import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';

function PostForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // ✅ Fetch categories using hook
  const { data: categories = [], loading: categoriesLoading, error: categoriesError } = useFetch('/api/categories');

  // ✅ Fetch post data only when editing
  const {
    data: post,
    loading: postLoading,
    error: postError,
  } = useFetch(`/api/posts/${id}`, {}, !isEditing);

  // ✅ Sync fetched post to form fields
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setCategory(post.category);
    }
  }, [post]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !category) {
      setError('All fields are required.');
      return;
    }

    setSubmitting(true);
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const endpoint = isEditing ? `/api/posts/${id}` : '/api/posts';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save post');
      }

      setSuccess(true);
      setTimeout(() => navigate(`/posts/${data._id}`), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Handle loading state clearly
  if (postLoading) return <p style={{ padding: '2rem' }}>Loading post...</p>;
  if (categoriesLoading) return <p style={{ padding: '2rem' }}>Loading categories...</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1 style={{ color: '#008080', fontSize: '1.8rem', marginBottom: '1rem' }}>
        {isEditing ? '✏️ Edit Post' : '✍️ Create New Post'}
      </h1>

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginBottom: '1rem' }}>✅ Post saved successfully!</p>}

      <form onSubmit={handleSubmit}>
        {/* Title Input */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#2F4F4F', marginBottom: '0.5rem' }}>
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError(null);
            }}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        {/* Content Textarea */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#2F4F4F', marginBottom: '0.5rem' }}>
            Content
          </label>
          <textarea
            rows="6"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError(null);
            }}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          ></textarea>
        </div>

        {/* Category Dropdown */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#2F4F4F', marginBottom: '0.5rem' }}>
            Category
          </label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setError(null);
            }}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          >
            <option value="">-- Select a category --</option>
            {categories.map((cat) => (
              <option key={cat._id || cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            backgroundColor: submitting ? '#ccc' : '#FFA500',
            color: '#fff',
            padding: '0.6rem 1.2rem',
            border: 'none',
            borderRadius: '4px',
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting
            ? isEditing ? 'Saving...' : 'Publishing...'
            : isEditing ? 'Update Post' : 'Publish Post'}
        </button>
      </form>
    </div>
  );
}

export default PostForm;
