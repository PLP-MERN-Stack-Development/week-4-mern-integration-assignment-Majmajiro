import { useEffect, useState } from 'react';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState(null);

  // Fetch categories on initial load
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
        setCategories(sorted);
      })
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  // Add new category
  const handleAddCategory = async (e) => {
    e.preventDefault();

    const trimmedName = newCategory.trim();
    if (!trimmedName) {
      setError('Category name is required.');
      return;
    }

    if (
      categories.some(
        (cat) => cat.name.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      setError('Category already exists.');
      return;
    }

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add category');

      setCategories((prev) =>
        [...prev, data].sort((a, b) => a.name.localeCompare(b.name))
      );
      setNewCategory('');
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete category
  const handleDeleteCategory = async (id) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }

      setCategories((prev) => prev.filter((cat) => cat._id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1 style={{ color: '#008080', fontSize: '2rem', marginBottom: '1rem' }}>
        🗂 Categories
      </h1>

      <form onSubmit={handleAddCategory} style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => {
          setNewCategory(e.target.value);
        if (error) setError(null);
          }}

          style={{
            padding: '0.5rem',
            width: '70%',
            borderRadius: '4px',
            border: '1px solid #ccc',
            marginRight: '0.5rem',
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: '#FFA500',
            color: '#fff',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Add
        </button>
        {error && (
          <p style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>
        )}
      </form>

      {categories.length === 0 ? (
        <p style={{ color: '#2F4F4F' }}>No categories found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {categories.map((cat, index) => (
            <li
              key={cat._id || cat.name || index}
              style={{
                background: '#40E0D0',
                color: '#2F4F4F',
                padding: '0.75rem 1rem',
                marginBottom: '0.5rem',
                borderRadius: '6px',
                fontWeight: 'bold',
                borderLeft: '4px solid #FFA500',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {cat.name}
              <button
                onClick={() => handleDeleteCategory(cat._id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'red',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                }}
                title="Delete category"
              >
                ❌
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Categories;
