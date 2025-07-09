import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState(null);

  // 🔄 Fetch categories on component mount
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
        setCategories(sorted);
      })
      .catch((err) => {
        console.error('Error fetching categories:', err);
        toast.error('Failed to load categories');
      });
  }, []);

  // ➕ Add new category
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
      toast.success(`Category "${data.name}" added`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  // ❌ Delete category
  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
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
      toast.success(`Deleted "${name}"`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <div
      style={{
        padding: '2rem 1rem',
        maxWidth: '600px',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      <h1
        style={{
          color: '#008080',
          fontSize: '2rem',
          marginBottom: '1rem',
          textAlign: 'center',
        }}
      >
        🗂 Categories
      </h1>

      {/* 🔧 Add Category Form */}
      <form
        onSubmit={handleAddCategory}
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          justifyContent: 'center',
        }}
      >
        <input
          type="text"
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => {
            setNewCategory(e.target.value);
            if (error) setError(null);
          }}
          style={{
            flex: '1 1 200px',
            minWidth: '180px',
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
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
          <p style={{ color: 'red', width: '100%', textAlign: 'center' }}>
            {error}
          </p>
        )}
      </form>

      {/* 📋 Category List */}
      {categories.length === 0 ? (
        <p style={{ color: '#2F4F4F', textAlign: 'center' }}>
          No categories found.
        </p>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}
        >
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
                flexWrap: 'wrap',
              }}
            >
              <span style={{ flex: '1 1 auto', wordBreak: 'break-word' }}>
                {cat.name}
              </span>
              <button
                onClick={() => handleDeleteCategory(cat._id, cat.name)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'red',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  marginLeft: '1rem',
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
