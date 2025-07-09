// src/context/PostContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import {
  fetchPosts,
  fetchPostById,
  createPost,
  updatePost,
  deletePost,
} from '../api/api';

const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await fetchPosts();
      setPosts(data.posts);
    } catch (err) {
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Optimistic addPost
  const addPost = async (newPost) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticPost = { ...newPost, _id: tempId };

    // 1. Optimistically show it in UI
    setPosts(prev => [optimisticPost, ...prev]);

    try {
      // 2. Send to API
      const created = await createPost(newPost);

      // 3. Replace temp with actual post
      setPosts(prev =>
        prev.map(p => (p._id === tempId ? created : p))
      );

      return created;
    } catch (err) {
      // 4. Rollback on error
      setPosts(prev => prev.filter(p => p._id !== tempId));
      throw err;
    }
  };

  const editPost = async (id, updatedPost) => {
    const updated = await updatePost(id, updatedPost);
    setPosts(prev => prev.map(p => (p._id === id ? updated : p)));
  };

  const removePost = async (id) => {
    await deletePost(id);
    setPosts(prev => prev.filter(p => p._id !== id));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <PostContext.Provider value={{
      posts,
      loading,
      error,
      reload: loadPosts,
      addPost,
      editPost,
      removePost,
    }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => useContext(PostContext);
