import React, { useState } from 'react';

// ЗАМЕНИТЕ на ваш адрес и токен Marzban
const MARZBAN_URL = 'https://beznegativa.space:8000/api/user';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJFZ29yIiwiYWNjZXNzIjoic3VkbyIsImlhdCI6MTc0NDcyMzc4MywiZXhwIjoxNzQ0ODEwMTgzfQ.yWNZkn_Cc4C4M9F6vJWzm5wFxEtD24dmtp0PCPcqJXY';

export default function CreateMarzbanUserForm() {
  const [username, setUsername] = useState('');
  const [expire, setExpire] = useState('');
  const [protocol, setProtocol] = useState('shadowsocks'); // shadowsocks или vless
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    try {
      // Преобразуем дату в timestamp (секунды)
      let expireTimestamp = null;
      if (expire) {
        expireTimestamp = Math.floor(new Date(expire).getTime() / 1000);
      }
      
      // Настройки для протоколов
      const shadowsocksSettings = {
        "method": "chacha20-ietf-poly1305",
        "inbounds": ["shadowsocks-tcp"]
      };
      
      const vlessSettings = {
        "flow": "xtls-rprx-vision",
        "inbounds": ["vless-tcp"]
      };
      
      // Определяем, какие inbounds включить
      const inbounds = {};
      if (protocol === 'shadowsocks') {
        inbounds["shadowsocks-tcp"] = true;
      } else if (protocol === 'vless') {
        inbounds["vless-tcp"] = true;
      }
      
      // Определяем, какие proxies включить
      const proxies = {};
      if (protocol === 'shadowsocks') {
        proxies.shadowsocks = shadowsocksSettings;
      } else if (protocol === 'vless') {
        proxies.vless = vlessSettings;
      }
      
      // Полный объект для создания пользователя с правильными настройками
      const userData = {
        username,
        proxies,
        inbounds,
        status: "active",
        data_limit: 0,  // Без ограничений
        data_limit_reset_strategy: "no_reset",
        ...(expireTimestamp && { expire: expireTimestamp })
      };
      
      // Логируем отправляемые данные для отладки
      console.log('Создание пользователя:', userData);
      
      const res = await fetch(MARZBAN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (res.ok) {
        setResult('Пользователь создан: ' + data.username);
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
    <form className="vpn-create-form" onSubmit={handleSubmit} style={{maxWidth:340,margin:'32px auto',background:'#23232b',padding:24,borderRadius:16,boxShadow:'0 2px 12px rgba(0,0,0,0.11)'}}>
      <h3 style={{color:'#fff',textAlign:'center',marginBottom:18}}>Создать пользователя Marzban</h3>
      <label style={{color:'#fff',marginBottom:6,display:'block'}}>Имя пользователя</label>
      <input type="text" value={username} onChange={e=>setUsername(e.target.value)} required placeholder="username" style={{width:'100%',padding:8,borderRadius:8,border:'1px solid #444',marginBottom:16}} />
      <label style={{color:'#fff',marginBottom:6,display:'block'}}>Дата истечения</label>
      <input type="date" value={expire} onChange={e=>setExpire(e.target.value)} style={{width:'100%',padding:8,borderRadius:8,border:'1px solid #444',marginBottom:24}} />
      <label style={{color:'#fff',marginBottom:6,display:'block'}}>Протокол</label>
      <select 
        value={protocol} 
        onChange={e=>setProtocol(e.target.value)} 
        style={{width:'100%',padding:8,borderRadius:8,border:'1px solid #444',marginBottom:24,background:'#292932',color:'#fff'}}
      >
        <option value="shadowsocks">Shadowsocks (TCP)</option>
        <option value="vless">VLESS (TCP с XTLS Vision)</option>
      </select>
      <button type="submit" disabled={loading} style={{width:'100%',padding:10,borderRadius:8,background:'#4da6ff',color:'#fff',border:'none',fontWeight:600,fontSize:'1em',cursor:'pointer'}}>
        {loading ? 'Создание...' : 'Создать пользователя'}
      </button>
      {result && <div style={{marginTop: 18, color: '#fff',textAlign:'center',whiteSpace:'pre-wrap'}}>{result}</div>}
    </form>
  );
}
