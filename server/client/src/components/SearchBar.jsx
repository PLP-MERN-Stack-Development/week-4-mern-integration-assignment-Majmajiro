import { useState } from 'react';
import useFetch from '../hooks/useFetch';

function SearchBar({ onSearch }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Fetch categories from backend
  const { data: categories = [], loading } = useFetch('/api/categories');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ search, category });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <input
        type="text"
        placeholder="Search posts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: '0.5rem', marginRight: '0.5rem' }}
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{ padding: '0.5rem', marginRight: '0.5rem' }}
      >
        <option value="">All Categories</option>
        {loading ? (
          <option disabled>Loading...</option>
        ) : (
          categories.map((cat) => (
            <option key={cat._id || cat.name} value={cat.name}>
              {cat.name}
            </option>
          ))
        )}
      </select>

      <button type="submit" style={{ padding: '0.5rem 1rem' }}>
        Search
      </button>
    </form>
  );
}

export default SearchBar;
