import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      {/* Шапка на всю ширину */}
      <nav style={{ 
        padding: '0 20px', 
        backgroundColor: '#2c3e50', 
        display: 'flex', 
        alignItems: 'center', 
        height: '60px',
        gap: '20px' 
      }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>🏠 Головна</Link>
        <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>🔑 Вхід</Link>
        <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>📝 Реєстрація</Link>
      </nav>

      {/* Контейнер для контенту з відступами */}
      <main style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;