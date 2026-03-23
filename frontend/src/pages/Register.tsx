import React, { useState } from 'react'; // Прибрали 'use'
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password })
      });

      const data = await response.json();

      if (!response.ok) {
        // Якщо бекенд повернув масив помилок від Zod, виводимо першу
        throw new Error(data.errors ? data.errors[0] : data.message || 'Помилка реєстрації');
      }

      alert('Реєстрація успішна! Тепер увійдіть у систему.');
      navigate('/login'); // Йдемо логінитись
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2>Реєстрація до системи 📝</h2>
      {error && <p style={{ color: 'red', padding: '10px', background: '#fff0f0' }}>{error}</p>}
      
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input 
          type="text" // Змінили з 'name' на 'text'
          placeholder="Ім'я" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Пароль" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Зареєструватися</button>
      </form>
    </div>
  );
}