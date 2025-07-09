import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Categories from './pages/Categories';
import PostDetail from './pages/PostDetail';
import PostForm from './pages/PostForm';
import Login from './pages/Login';
import Register from './pages/Register';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Navigation Component
const Navigation = () => {
  const { user, logout, loading } = useAuth();
  console.log('Navigation Debug:');
  console.log('- user:', user);
  console.log('- loading:', loading);
  console.log('- isAuthenticated:', !!user);

  if (loading) {
    return <div style={{ padding: '1rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <nav style={{
      padding: '1rem 2rem',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #dee2e6',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <Link to="/" style={{ 
          marginRight: '1rem', 
          textDecoration: 'none', 
          fontWeight: 'bold',
          fontSize: '1.2rem',
          color: '#007bff'
        }}>
          My Blog
        </Link>
        <Link to="/" style={{ marginRight: '1rem', textDecoration: 'none' }}>
          Home
        </Link>
        <Link to="/categories" style={{ marginRight: '1rem', textDecoration: 'none' }}>
          Categories
        </Link>
        {user && (
          <Link to="/create" style={{ marginRight: '1rem', textDecoration: 'none' }}>
            Create Post
          </Link>
        )}
      </div>

      <div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Welcome, {user.name}!</span>
            <button
              onClick={logout}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div>
            <Link 
              to="/login" 
              style={{ 
                marginRight: '1rem', 
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                borderRadius: '4px'
              }}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              style={{ 
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                backgroundColor: '#28a745',
                color: 'white',
                borderRadius: '4px'
              }}
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Authentication Required</h2>
        <p>You need to be logged in to access this page.</p>
        <Link to="/login" style={{ color: '#007bff' }}>
          Please login here
        </Link>
      </div>
    );
  }

  return children;
};

function App() {
  return (
    <>
      <Navigation />
      <div style={{ minHeight: 'calc(100vh - 80px)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/categories" element={<Categories />} />
          
          {/* Protected Routes */}
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <PostForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/posts/:id/edit" 
            element={
              <ProtectedRoute>
                <PostForm />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;