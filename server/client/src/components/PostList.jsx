import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SearchBar from './SearchBar';

function PostList() {
  const [posts, setPosts] = useState([]);
  const [searchParams, setSearchParams] = useState({ search: '', category: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { search, category } = searchParams;
      const res = await axios.get('/api/posts', {
        params: {
          search,
          category,
          page,
          limit: 5,
        },
      });

      setPosts(res.data.posts);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error('Failed to fetch posts:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [searchParams, page]);

  const handleSearch = ({ search, category }) => {
    setSearchParams({ search, category });
    setPage(1);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📰 Posts</h2>

      <SearchBar onSearch={handleSearch} />

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {posts.map((post) => (
            <li key={post._id} style={{ marginBottom: '1rem' }}>
              <Link to={`/posts/${post._id}`} style={{ textDecoration: 'none', color: '#333' }}>
                <strong>{post.title}</strong>
              </Link>
              <p>{post.content.substring(0, 100)}...</p>
              <p style={{ fontSize: '0.9rem', color: 'gray' }}>
