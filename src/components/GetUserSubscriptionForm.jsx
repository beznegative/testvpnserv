import React, { useState } from 'react';

// URL для API Marzban
const MARZBAN_API_URL = 'https://beznegativa.space:8000/api';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJFZ29yIiwiYWNjZXNzIjoic3VkbyIsImlhdCI6MTc0NDcyMzc4MywiZXhwIjoxNzQ0ODEwMTgzfQ.yWNZkn_Cc4C4M9F6vJWzm5wFxEtD24dmtp0PCPcqJXY';

export default function GetUserSubscriptionForm() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [subscriptionUrl, setSubscriptionUrl] = useState('');

  // Функция для получения данных пользователя по имени
  const getUserData = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUserData(null);
    setSubscriptionUrl('');

    try {
      console.log('Получение данных пользователя:', username);
      const res = await fetch(`${MARZBAN_API_URL}/user/${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Accept': 'application/json'
        }
      });

      const data = await res.json();
      
      if (res.ok) {
        setUserData(data);
        console.log('Данные пользователя:', data);
      } else {
        setError('Ошибка: ' + (data.detail || 'Пользователь не найден') + 
                '\n' + JSON.stringify(data, null, 2));
      }
    } catch (e) {
      setError('Ошибка соединения: ' + e.message);
    }
    
    setLoading(false);
  };

  // Функция для получения URL подписки
  const getSubscriptionUrl = () => {
    if (!userData || !userData.subscription_url) {
      // Если у нас есть имя пользователя, запрашиваем ссылку на подписку через API
      if (userData && userData.username) {
        // Запрашиваем ссылку на подписку через API
        fetch(`${MARZBAN_API_URL}/sub/${userData.username}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Accept': 'application/json'
          }
        })
        .then(res => res.json())
        .then(data => {
          if (data.subscription_url) {
            // Проверяем, содержит ли ссылка полный URL
            if (data.subscription_url.startsWith('http')) {
              setSubscriptionUrl(data.subscription_url);
            } else {
              setSubscriptionUrl(`https://beznegativa.space:8000/sub/${data.subscription_url}`);
            }
          } else {
            console.error('Ссылка на подписку не найдена в ответе API');
            setSubscriptionUrl(`https://beznegativa.space:8000/sub/${userData.username}`);
          }
        })
        .catch(err => {
          console.error('Ошибка при запросе ссылки на подписку:', err);
          setSubscriptionUrl(`https://beznegativa.space:8000/sub/${userData.username}`);
        });
        return;
      }
      
      setError('Не удалось получить URL подписки');
      return;
    }
    
    // Исправление: теперь всегда формируем полный URL
    if (userData.subscription_url.startsWith('http')) {
      setSubscriptionUrl(userData.subscription_url);
    } else {
      setSubscriptionUrl(`https://beznegativa.space:8000${userData.subscription_url}`);
    }
  };

  return (
    <div style={{maxWidth:340,margin:'32px auto',background:'#23232b',padding:24,borderRadius:16,boxShadow:'0 2px 12px rgba(0,0,0,0.11)'}}>
      <h3 style={{color:'#fff',textAlign:'center',marginBottom:18}}>Получить подписку пользователя</h3>
      
      <form onSubmit={getUserData}>
        <label style={{color:'#fff',marginBottom:6,display:'block'}}>Имя пользователя</label>
        <input 
          type="text" 
          value={username} 
          onChange={e=>setUsername(e.target.value)} 
          required 
          placeholder="Введите имя пользователя" 
          style={{width:'100%',padding:8,borderRadius:8,border:'1px solid #444',marginBottom:16}} 
        />
        
        <button 
          type="submit" 
          disabled={loading} 
          style={{width:'100%',padding:10,borderRadius:8,background:'#4da6ff',color:'#fff',border:'none',fontWeight:600,fontSize:'1em',cursor:'pointer',marginBottom:16}}
        >
          {loading ? 'Поиск...' : 'Найти пользователя'}
        </button>
      </form>
      
      {userData && (
        <div style={{marginTop:16,padding:12,background:'#2a2a33',borderRadius:8}}>
          <h4 style={{color:'#fff',margin:'0 0 8px'}}>Данные пользователя</h4>
          <p style={{color:'#ddd',margin:'4px 0'}}>Имя: {userData.username}</p>
          <p style={{color:'#ddd',margin:'4px 0'}}>
            Статус: <span style={{color: userData.status === 'active' ? '#4caf50' : '#f44336'}}>{userData.status}</span>
          </p>
          {userData.expire && (
            <p style={{color:'#ddd',margin:'4px 0'}}>
              Истекает: {new Date(userData.expire * 1000).toLocaleDateString()}
            </p>
          )}
          
          <button 
            onClick={getSubscriptionUrl} 
            style={{width:'100%',padding:10,borderRadius:8,background:'#4caf50',color:'#fff',border:'none',fontWeight:600,fontSize:'1em',cursor:'pointer',marginTop:12}}
          >
            Получить ссылку на подписку
          </button>
        </div>
      )}
      
      {subscriptionUrl && (
        <div style={{marginTop:16,padding:12,background:'#2a2a33',borderRadius:8}}>
          <h4 style={{color:'#fff',margin:'0 0 8px'}}>Ссылка на подписку</h4>
          <div style={{
            padding:8,
            background:'#1e1e24',
            borderRadius:4,
            color:'#fff',
            wordBreak:'break-all',
            marginBottom:8
          }}>
            {subscriptionUrl}
          </div>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(subscriptionUrl);
              alert('Ссылка скопирована в буфер обмена');
            }} 
            style={{width:'100%',padding:8,borderRadius:8,background:'#ff9800',color:'#fff',border:'none',fontWeight:600,fontSize:'0.9em',cursor:'pointer'}}
          >
            Скопировать ссылку
          </button>
        </div>
      )}
      
      {error && (
        <div style={{marginTop:16,color:'#f44336',whiteSpace:'pre-wrap',background:'#2a2a33',padding:12,borderRadius:8}}>
          {error}
        </div>
      )}
    </div>
  );
}
