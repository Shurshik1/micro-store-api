import React, { useEffect, useState } from 'react';

function App() {
  // Данные для списка и ошибок
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  
  // Состояния для полей ввода
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Состояние авторизации
  const [isLogin, setIsLogin] = useState(true); // Переключатель: вход или регистрация
  const [currentUser, setCurrentUser] = useState<any>(null); // Храним вошедшего юзера

  // 1. Проверяем при загрузке: а не вошел ли юзер раньше?
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    fetch('http://localhost:3000/api/users')
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error('Ошибка загрузки списка:', err));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Выбираем эндпоинт в зависимости от режима
    const endpoint = isLogin ? '/api/users/login' : '/api/users';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors ? data.errors[0] : data.message);
      }

      if (isLogin) {
        // Если это ЛОГИН — сохраняем "паспорт" в карман
        localStorage.setItem('user', JSON.stringify(data));
        setCurrentUser(data);
        alert('Вход выполнен успешно! Токен получен.');
      } else {
        // Если это РЕГИСТРАЦИЯ — просто переключаем на вход
        alert('Регистрация прошла успешно! Теперь войдите.');
        setIsLogin(true);
        fetchUsers();
      }
      
      // Очищаем пароль после любой операции
      setPassword('');
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // --- ИНТЕРФЕЙС ЛИЧНОГО КАБИНЕТА ---
  if (currentUser) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', textAlign: 'center', backgroundColor: '#f0f4f8', borderRadius: '8px' }}>
        <h1>Привет, {currentUser.user.name}! 👋</h1>
        <p>Твой email: <strong>{currentUser.user.email}</strong></p>
        
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
          <h3 style={{ color: '#2c3e50' }}>Твой цифровой паспорт (JWT):</h3>
          <div style={{ wordBreak: 'break-all', fontSize: '12px', color: '#666', fontFamily: 'monospace', padding: '10px', backgroundColor: '#f9f9f9' }}>
            {currentUser.token}
          </div>
        </div>

        <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Выйти из системы
        </button>
      </div>
    );
  }

  // --- ИНТЕРФЕЙС ВХОДА / РЕГИСТРАЦИИ ---
  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>{isLogin ? '🔑 Вход' : '📝 Регистрация'}</h1>
      
      {error && <div style={{ padding: '10px', backgroundColor: '#ffebee', color: '#c62828', marginBottom: '15px', borderRadius: '4px' }}>{error}</div>}

      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {!isLogin && (
          <input type="text" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '12px' }} />
        )}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '12px' }} />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '12px' }} />
        
        <button type="submit" style={{ padding: '15px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          {isLogin ? 'ВОЙТИ' : 'СОЗДАТЬ АККАУНТ'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
        <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', textDecoration: 'underline', marginLeft: '5px' }}>
          {isLogin ? 'Зарегистрироваться' : 'Войти'}
        </button>
      </p>

      <hr style={{ margin: '30px 0' }} />
      <h3>Список всех (для теста):</h3>
      <ul>
        {users.map(u => <li key={u.id}>{u.name} ({u.email})</li>)}
      </ul>
    </div>
  );
}

export default App;