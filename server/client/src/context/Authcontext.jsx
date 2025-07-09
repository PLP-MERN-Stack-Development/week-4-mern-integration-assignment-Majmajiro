// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in when app starts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token is still valid
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (token) => {
    try {
      console.log('AuthContext: Fetching current user with token'); // Debug
      const response = await fetch('http://localhost:5001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('AuthContext: Current user fetched:', data.user); // Debug
        setUser(data.user);
      } else {
        console.log('AuthContext: Token invalid, removing'); // Debug
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('AuthContext: Error fetching current user:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Starting login for', email); // Debug
      
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log('AuthContext: Login response:', data); // Debug

      if (response.ok) {
        console.log('AuthContext: Login successful, setting token and user'); // Debug
        localStorage.setItem('token', data.token);
        setUser(data.user);
        console.log('AuthContext: User set to:', data.user); // Debug
        return { success: true };
      } else {
        console.log('AuthContext: Login failed:', data.error); // Debug
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('AuthContext: Network error:', error); // Debug
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('AuthContext: Starting registration for', email); // Debug
      
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();
      console.log('AuthContext: Registration response:', data); // Debug

      if (response.ok) {
        console.log('AuthContext: Registration successful, setting token and user'); // Debug
        localStorage.setItem('token', data.token);
        setUser(data.user);
        console.log('AuthContext: User set to:', data.user); // Debug
        return { success: true };
      } else {
        console.log('AuthContext: Registration failed:', data.error); // Debug
        return { 
          success: false, 
          error: data.error || data.errors?.[0]?.msg || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('AuthContext: Registration network error:', error); // Debug
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out'); // Debug
    localStorage.removeItem('token');
    setUser(null);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    getAuthHeaders,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};