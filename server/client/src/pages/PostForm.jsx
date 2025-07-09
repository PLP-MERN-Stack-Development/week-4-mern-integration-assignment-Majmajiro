import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePosts } from '../context/PostContext';
import useFetch from '../hooks/useFetch';

function PostForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);

  const { posts, addPost, editPost } = usePosts();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');

  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { data: categories = [], loading: categoriesLoading } = useFetch('/api/categories');

  useEffect(() => {
    if (isEditing) {
      const found = posts.find(p => p._id === id);
      if (found) {
        setTitle(found.title);
        setContent(found.content);
        setCategory(found.category);
        if (found.image) setImage(found.image); // 🖼 preload image
      }
    }
  }, [id, posts, isEditing]);

  const validateFields = () => {
    let valid = true;
    if (title.trim().length < 5) {
      setTitleError('Title must be at least 5 characters.');
      valid = false;
    }
    if (!content.trim()) {
      setContentError('Content is required.');
      valid = false;
    }
    if (!category) {
      setCategoryError('Please select a category.');
      valid = false;
    }
    return valid;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setImage(data.path); // 📁 Set image path (e.g., /uploads/filename.jpg)
    } catch (err) {
      console.error('Image upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTitleError('');
    setContentError('');
    setCategoryError('');

    if (!validateFields()) return;

    const postData = { title, content, category, image };

    setSubmitting(true);
    try {
      if (isEditing) {
        await editPost(id, postData);
        setSuccess(true);
        setTimeout(() => navigate(`/posts/${id}`), 1500);
      } else {
        const newPost = await addPost(postData);
        setSuccess(true);
        setTimeout(() => navigate(`/posts/${newPost._id}`), 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (categoriesLoading) return <p style={{ padding: '2rem' }}>Loading categories...</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1 style={{ color: '#008080', fontSize: '1.8rem', marginBottom: '1rem' }}>
        {isEditing ? '✏️ Edit Post' : '✍️ Create New Post'}
      </h1>

      {success && (
        <p style={{ color: 'green', marginBottom: '1rem' }}>
          ✅ Post saved successfully!
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div style={{ marginBottom: '1rem' }}>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError('');
            }}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {titleError && <p style={{ color: 'red', marginTop: '0.25rem' }}>{titleError}</p>}
        </div>

        {/* Content */}
        <div style={{ marginBottom: '1rem' }}>
          <label>Content</label>
          <textarea
            rows="6"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (contentError) setContentError('');
            }}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          ></textarea>
          {contentError && <p style={{ color: 'red', marginTop: '0.25rem' }}>{contentError}</p>}
        </div>

        {/* Category */}
        <div style={{ marginBottom: '1rem' }}>
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              if (categoryError) setCategoryError('');
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
          {categoryError && <p style={{ color: 'red', marginTop: '0.25rem' }}>{categoryError}</p>}
        </div>

        {/* Image Upload */}
        <div style={{ marginBottom: '1rem' }}>
          <label>Featured Image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {uploading && <p>Uploading image...</p>}
          {image && (
            <div style={{ marginTop: '0.5rem' }}>
              <img
                src={image}
                alt="Preview"
                style={{ width: '100%', borderRadius: '6px', maxHeight: '250px', objectFit: 'cover' }}
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            backgroundColor: submitting ? '#ccc' : '#FFA500',
            color: 'white',
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

