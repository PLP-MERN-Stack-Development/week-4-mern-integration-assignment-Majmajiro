// src/api/api.js - Updated with authentication and Task 5 features
const BASE_URL = 'http://localhost:5001/api'; // Fixed port number

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ===== POSTS API =====
export const fetchPosts = async (params = {}) => {
  const searchParams = new URLSearchParams();
  
  // Add pagination, search, and filtering
  if (params.page) searchParams.append('page', params.page);
  if (params.limit) searchParams.append('limit', params.limit);
  if (params.search) searchParams.append('search', params.search);
  if (params.category) searchParams.append('category', params.category);

  const url = `${BASE_URL}/posts${searchParams.toString() ? `?${searchParams}` : ''}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
};

export const fetchPostById = async (id) => {
  const res = await fetch(`${BASE_URL}/posts/${id}`);
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
};

export const createPost = async (postData) => {
  const res = await fetch(`${BASE_URL}/posts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(postData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create post');
  }
  return res.json();
};

export const updatePost = async (id, postData) => {
  const res = await fetch(`${BASE_URL}/posts/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(postData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update post');
  }
  return res.json();
};

export const deletePost = async (id) => {
  const res = await fetch(`${BASE_URL}/posts/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete post');
  }
  return res.json();
};

// ===== CATEGORIES API =====
export const fetchCategories = async () => {
  const res = await fetch(`${BASE_URL}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
};

export const createCategory = async (categoryData) => {
  const res = await fetch(`${BASE_URL}/categories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(categoryData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create category');
  }
  return res.json();
};

// ===== COMMENTS API =====
export const fetchComments = async (postId) => {
  const res = await fetch(`${BASE_URL}/comments/post/${postId}`);
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
};

export const createComment = async (postId, content) => {
  const res = await fetch(`${BASE_URL}/comments/post/${postId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create comment');
  }
  return res.json();
};

export const updateComment = async (postId, commentId, content) => {
  const res = await fetch(`${BASE_URL}/comments/${commentId}/post/${postId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update comment');
  }
  return res.json();
};

export const deleteComment = async (postId, commentId) => {
  const res = await fetch(`${BASE_URL}/comments/${commentId}/post/${postId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete comment');
  }
  return res.json();
};

// ===== IMAGE UPLOAD API =====
export const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const token = localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: headers,
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to upload image');
  }
  
  return res.json();
};