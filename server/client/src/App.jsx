import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Categories from './pages/Categories';
import PostDetail from './pages/PostDetail'; 
import PostForm from './pages/PostForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/posts/:id" element={<PostDetail />} />   
        <Route path="/posts/:id/edit" element={<PostForm />} />
        <Route path="/new" element={<PostForm />} />           
      </Routes>
    </Router>
  );
}

export default App;

