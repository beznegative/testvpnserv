import React, { useState } from 'react';

const MARZBAN_AUTH_URL = 'https://beznegativa.space:8000/api/admin/token';

export default function GetAdminTokenForm({ onToken }) {
  const [username, setUsername] = useState('Egor');
  const [password, setPassword] = useState('12345');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    try {
      console.log('Отправляем:', { username, password });
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const res = await fetch(MARZBAN_AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'accept': 'application/json'
        },
        body: params
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        setResult('Токен получен!\n' + data.access_token);
        onToken(data.access_token);
      } else {
        setResult(
          'Ошибка: ' + (data.detail || 'Неизвестная ошибка') +
          '\n' + JSON.stringify(data, null, 2)
        );
      }
    } catch (e) {
      setResult('Ошибка соединения: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{maxWidth:340,margin:'32px auto 0',background:'#23232b',padding:24,borderRadius:16,boxShadow:'0 2px 12px rgba(0,0,0,0.11)'}}>
      <h3 style={{color:'#fff',textAlign:'center',marginBottom:18}}>Получить admin token</h3>
      <label style={{color:'#fff',marginBottom:6,display:'block'}}>Логин</label>
      <input type="text" value={username} onChange={e=>setUsername(e.target.value)} required style={{width:'100%',padding:8,borderRadius:8,border:'1px solid #444',marginBottom:16}} />
      <label style={{color:'#fff',marginBottom:6,display:'block'}}>Пароль</label>
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={{width:'100%',padding:8,borderRadius:8,border:'1px solid #444',marginBottom:24}} />
      <button type="submit" disabled={loading} style={{width:'100%',padding:10,borderRadius:8,background:'#4da6ff',color:'#fff',border:'none',fontWeight:600,fontSize:'1em',cursor:'pointer'}}>
        {loading ? 'Запрос...' : 'Получить токен'}
      </button>
      {result && <div style={{marginTop: 18, color: '#fff',textAlign:'center',whiteSpace:'pre-wrap'}}>{result}</div>}
    </form>
  );
}
