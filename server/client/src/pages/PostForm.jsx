import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePosts } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';

function PostForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);

  const { posts, addPost, editPost } = usePosts();
  const { getAuthHeaders } = useAuth();

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
        setCategory(found.category._id || found.category); // Handle both populated and non-populated
        if (found.featuredImage) setImage(found.featuredImage);
      }
    }
  }, [id, posts, isEditing]);

  const validateFields = () => {
    let valid = true;
    setTitleError('');
    setContentError('');
    setCategoryError('');

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
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      setImage(data.url); // Use the URL from the response
      console.log('Image uploaded:', data.url);
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted!'); // Debug log

    if (!validateFields()) {
      console.log('Validation failed'); // Debug log
      return;
    }

    const postData = { 
      title, 
      content, 
      category, // This is now the category _id
      featuredImage: image 
    };

    console.log('Submitting post data:', postData); // Debug log

    setSubmitting(true);
    try {
      if (isEditing) {
        console.log('Editing post:', id); // Debug log
        await editPost(id, postData);
        setSuccess(true);
        setTimeout(() => navigate(`/posts/${id}`), 1500);
      } else {
        console.log('Creating new post'); // Debug log
        const newPost = await addPost(postData);
        console.log('New post created:', newPost); // Debug log
        setSuccess(true);
        setTimeout(() => navigate(`/posts/${newPost._id}`), 1500);
      }
    } catch (err) {
      console.error('Post submission error:', err);
      alert('Failed to save post. Please try again.');
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Title *
          </label>
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
              border: titleError ? '1px solid red' : '1px solid #ccc',
              borderRadius: '4px',
            }}
            placeholder="Enter your post title..."
          />
          {titleError && <p style={{ color: 'red', marginTop: '0.25rem', fontSize: '0.9rem' }}>{titleError}</p>}
        </div>

        {/* Content */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Content *
          </label>
          <textarea
            rows="8"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (contentError) setContentError('');
            }}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: contentError ? '1px solid red' : '1px solid #ccc',
              borderRadius: '4px',
              resize: 'vertical'
            }}
            placeholder="Write your post content here..."
          />
          {contentError && <p style={{ color: 'red', marginTop: '0.25rem', fontSize: '0.9rem' }}>{contentError}</p>}
        </div>

        {/* Category */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Category *
          </label>
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
              border: categoryError ? '1px solid red' : '1px solid #ccc',
            }}
          >
            <option value="">-- Select a category --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {categoryError && <p style={{ color: 'red', marginTop: '0.25rem', fontSize: '0.9rem' }}>{categoryError}</p>}
        </div>

        {/* Image Upload */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Featured Image
          </label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload}
            disabled={uploading}
            style={{ marginBottom: '0.5rem' }}
          />
          {uploading && <p style={{ color: '#007bff' }}>Uploading image...</p>}
          {image && (
            <div style={{ marginTop: '0.5rem' }}>
              <img
                src={`http://localhost:5001${image}`}
                alt="Preview"
                style={{ 
                  width: '100%', 
                  borderRadius: '6px', 
                  maxHeight: '250px', 
                  objectFit: 'cover',
                  border: '1px solid #ddd'
                }}
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
            padding: '0.8rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
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