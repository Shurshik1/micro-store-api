import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]); 
  const [error, setError] = useState<string>(''); 
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const fetchOrders = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
           throw new Error('Доступ запрещен. Токен недействителен.');
        }
        throw new Error('Ошибка при загрузке заказов');
      }

      const data = await response.json();
      setOrders(data); 
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateTestOrder = async () => {
    const savedData = localStorage.getItem('user');
    if (!savedData) return;
    
    const parsedData = JSON.parse(savedData);
    const token = parsedData.token;
    const buyerId = parsedData.user.id; 

    try {
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productName: 'Тестовый MacBook Pro', 
          price: 75000,
          buyerId: Number(buyerId) 
        })
      });

      if (!response.ok) {
        throw new Error('Не удалось создать заказ');
      }

      fetchOrders(token);

    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => {
    const savedData = localStorage.getItem('user');
    if (!savedData) {
      navigate('/login');
      return;
    }

    const parsedData = JSON.parse(savedData);
    const token = parsedData.token;

    const checkToken = () => {
      try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          handleLogout();
          return false;
        }
        return true;
      } catch (e) {
        handleLogout();
        return false;
      }
    };

    if (checkToken()) {
      setUser(parsedData);
      fetchOrders(token); 
    }

    const interval = setInterval(() => {
      checkToken();
    }, 10000);

    return () => clearInterval(interval);
  }, [navigate]);

  if (!user) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '2px solid #eee' }}>
        <h2>Личный кабинет 🛡️</h2>
        <button onClick={handleLogout} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Выйти
        </button>
      </header>

      <div style={{ marginTop: '20px' }}>
        <p>Привет, <strong>{user.user.name}</strong>!</p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>Мои заказы:</h3>
          <button 
            onClick={handleCreateTestOrder}
            style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + Создать тестовый заказ
          </button>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {orders.length === 0 && !error ? (
          <p style={{ color: '#7f8c8d' }}>У вас пока нет заказов. Нажмите кнопку выше, чтобы создать!</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {orders.map((order, index) => (
              <li key={index} style={{ background: '#f8f9fa', padding: '15px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                <strong>Заказ #{order.id}</strong> — {order.productName} 
                <br />
                <span style={{ color: '#27ae60', fontWeight: 'bold' }}>{order.price} ₴</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}