import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <div>
      <nav style={{ padding: '1rem', backgroundColor: '#f0f0f0' }}>
        <Link to="/">Home</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;