import React, { useState, useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';

// URL для API Marzban
const MARZBAN_API_URL = 'https://beznegativa.space:8000/api';
const MARZBAN_USER_URL = 'https://beznegativa.space:8000/api/user';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJFZ29yIiwiYWNjZXNzIjoic3VkbyIsImlhdCI6MTc0NDgyMTE0MywiZXhwIjoxNzQ0OTA3NTQzfQ.W1mUz_I-RFbEBge1Xe3gU-IQMvrSOoEncup52f2sIvw';

// Секретный ключ активации
const ACTIVATION_KEY = 'byzxvizi';

export default function VpnTab() {
  const { user } = useTelegram();
  const [loading, setLoading] = useState(true);
  const [userFound, setUserFound] = useState(false);
  const [subscriptionUrl, setSubscriptionUrl] = useState('');
  const [activationKey, setActivationKey] = useState('');
  const [error, setError] = useState('');
  const [activated, setActivated] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [activePlatform, setActivePlatform] = useState('ios');

  // Проверяем, есть ли пользователь в Marzban по его Telegram ID
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const checkUser = async () => {
      try {
        // Пытаемся найти пользователя с именем, соответствующим Telegram ID (без префикса)
        const username = `${user.id}`;
        const res = await fetch(`${MARZBAN_API_URL}/user/${username}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Accept': 'application/json'
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUserFound(true);
          
          // Формируем URL подписки с использованием subscription_url из данных пользователя
          if (data.subscription_url) {
            // Исправление: теперь всегда формируем полный URL
            if (data.subscription_url.startsWith('http')) {
              setSubscriptionUrl(data.subscription_url);
            } else {
              setSubscriptionUrl(`https://beznegativa.space:8000${data.subscription_url}`);
            }
          } else {
            // Если subscription_url отсутствует, запрашиваем его отдельно
            try {
              const subRes = await fetch(`${MARZBAN_API_URL}/sub/${username}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${ADMIN_TOKEN}`,
                  'Accept': 'application/json'
                }
              });
              
              if (subRes.ok) {
                const subData = await subRes.json();
                if (subData.subscription_url) {
                  // Проверяем, содержит ли ссылка полный URL
                  if (subData.subscription_url.startsWith('http')) {
                    setSubscriptionUrl(subData.subscription_url);
                  } else {
                    setSubscriptionUrl(`https://beznegativa.space:8000/sub/${subData.subscription_url}`);
                  }
                } else {
                  console.error('Ссылка на подписку не найдена в ответе API');
                  setSubscriptionUrl(`https://beznegativa.space:8000/sub/${username}`);
                }
              } else {
                console.error('Ошибка при получении ссылки на подписку');
                setSubscriptionUrl(`https://beznegativa.space:8000/sub/${username}`);
              }
            } catch (subErr) {
              console.error('Ошибка при запросе ссылки на подписку:', subErr);
              setSubscriptionUrl(`https://beznegativa.space:8000/sub/${username}`);
            }
          }
        } else {
          setUserFound(false);
        }
      } catch (e) {
        console.error('Ошибка при проверке пользователя:', e);
      }
      
      setLoading(false);
    };

    checkUser();
  }, [user]);

  // Функция для создания пользователя в Marzban
  const createMarzbanUser = async () => {
    if (!user?.id) {
      setError('Ошибка: Не удалось получить ID пользователя Telegram');
      return false;
    }

    setCreatingUser(true);
    try {
      // Имя пользователя - просто Telegram ID без префикса
      const username = `${user.id}`;
      
      // Настройки для VLESS с TCP и XTLS Vision
      const vlessSettings = {
        "flow": "xtls-rprx-vision",
        "inbounds": ["vless-tcp"]
      };
      
      // Срок действия - 30 дней от текущей даты
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 30);
      const expireTimestamp = Math.floor(expireDate.getTime() / 1000);
      
      // Полный объект для создания пользователя
      const userData = {
        username,
        proxies: {
          vless: vlessSettings
        },
        inbounds: {
          "vless-tcp": true
        },
        status: "active",
        data_limit: 0,  // Без ограничений
        data_limit_reset_strategy: "no_reset",
        expire: expireTimestamp
      };
      
      console.log('Создание пользователя:', userData);
      
      const res = await fetch(MARZBAN_USER_URL, {
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
        console.log('Пользователь успешно создан:', data);
        setUserFound(true);
        
        // Используем subscription_url из ответа API
        if (data.subscription_url) {
          // Исправление: теперь всегда формируем полный URL
          if (data.subscription_url.startsWith('http')) {
            setSubscriptionUrl(data.subscription_url);
          } else {
            setSubscriptionUrl(`https://beznegativa.space:8000${data.subscription_url}`);
          }
        } else {
          // Запрашиваем ссылку на подписку отдельно
          try {
            const subRes = await fetch(`${MARZBAN_API_URL}/sub/${username}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`,
                'Accept': 'application/json'
              }
            });
            
            if (subRes.ok) {
              const subData = await subRes.json();
              if (subData.subscription_url) {
                // Проверяем, содержит ли ссылка полный URL
                if (subData.subscription_url.startsWith('http')) {
                  setSubscriptionUrl(subData.subscription_url);
                } else {
                  setSubscriptionUrl(`https://beznegativa.space:8000/sub/${subData.subscription_url}`);
                }
              } else {
                console.error('Ссылка на подписку не найдена в ответе API');
                setSubscriptionUrl(`https://beznegativa.space:8000/sub/${username}`);
              }
            } else {
              console.error('Ошибка при получении ссылки на подписку');
              setSubscriptionUrl(`https://beznegativa.space:8000/sub/${username}`);
            }
          } catch (subErr) {
            console.error('Ошибка при запросе ссылки на подписку:', subErr);
            setSubscriptionUrl(`https://beznegativa.space:8000/sub/${username}`);
          }
        }
        
        setActivated(true);
        return true;
      } else {
        console.error('Ошибка при создании пользователя:', data);
        setError('Ошибка при создании пользователя: ' + (data.detail || JSON.stringify(data)));
        return false;
      }
    } catch (e) {
      console.error('Ошибка соединения:', e);
      setError('Ошибка соединения: ' + e.message);
      return false;
    } finally {
      setCreatingUser(false);
    }
  };

  // Функция для проверки ключа активации
  const handleActivation = async (e) => {
    e.preventDefault();
    
    if (activationKey === ACTIVATION_KEY) {
      setError('');
      setActivated(true);
      
      // Создаем пользователя в Marzban
      const success = await createMarzbanUser();
      
      if (!success) {
        setActivated(false);
      }
    } else {
      setError('Неверный ключ активации');
    }
  };

  // Отображение загрузки
  if (loading) {
    return (
      <div style={{maxWidth:340,margin:'32px auto',background:'#23232b',padding:24,borderRadius:16,boxShadow:'0 2px 12px rgba(0,0,0,0.11)',textAlign:'center',color:'#fff'}}>
        <p>Загрузка...</p>
      </div>
    );
  }

  // Если пользователь создается
  if (creatingUser) {
    return (
      <div style={{maxWidth:340,margin:'32px auto',background:'#23232b',padding:24,borderRadius:16,boxShadow:'0 2px 12px rgba(0,0,0,0.11)',textAlign:'center',color:'#fff'}}>
        <p>Создание VPN-аккаунта...</p>
      </div>
    );
  }

  // Если пользователь найден или активирован, показываем ссылку на подписку
  if (userFound || activated) {
    return (
      <div style={{maxWidth:340,margin:'32px auto',background:'#23232b',padding:24,borderRadius:16,boxShadow:'0 2px 12px rgba(0,0,0,0.11)'}}>
        <h3 style={{color:'#fff',textAlign:'center',marginBottom:18}}>Ваша VPN подписка</h3>
        
        <div style={{padding:12,background:'#2a2a33',borderRadius:8,marginBottom:16}}>
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
            style={{
              width:'100%',
              padding:8,
              borderRadius:8,
              background:'transparent',
              color:'#9c27b0',
              border:'1px solid #9c27b0',
              fontWeight:600,
              fontSize:'0.9em',
              cursor:'pointer'
            }}
          >
            Скопировать ссылку
          </button>
        </div>
        
        {/* Раскрывающийся блок с инструкциями */}
        <div style={{padding:12,background:'#2a2a33',borderRadius:8,marginBottom:16}}>
          <button 
            onClick={() => setShowInstructions(!showInstructions)}
            style={{
              width:'100%',
              padding:8,
              borderRadius:8,
              background:'transparent',
              color:'#fff',
              border:'1px solid #444',
              fontWeight:600,
              fontSize:'0.9em',
              cursor:'pointer',
              display:'flex',
              justifyContent:'space-between',
              alignItems:'center'
            }}
          >
            <span>Инструкция по настройке</span>
            <span style={{transition:'transform 0.3s', transform: showInstructions ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span>
          </button>
          
          {showInstructions && (
            <div style={{marginTop:12}}>
              <div style={{display:'flex',gap:8,marginBottom:12}}>
                <button 
                  onClick={() => setActivePlatform('ios')}
                  style={{
                    padding:'6px 12px',
                    borderRadius:8,
                    background: activePlatform === 'ios' ? '#4da6ff' : 'transparent',
                    color: activePlatform === 'ios' ? '#fff' : '#bbb',
                    border: activePlatform === 'ios' ? 'none' : '1px solid #444',
                    cursor:'pointer',
                    flex:1
                  }}
                >
                  iOS
                </button>
                <button 
                  onClick={() => setActivePlatform('android')}
                  style={{
                    padding:'6px 12px',
                    borderRadius:8,
                    background: activePlatform === 'android' ? '#4da6ff' : 'transparent',
                    color: activePlatform === 'android' ? '#fff' : '#bbb',
                    border: activePlatform === 'android' ? 'none' : '1px solid #444',
                    cursor:'pointer',
                    flex:1
                  }}
                >
                  Android
                </button>
                <button 
                  onClick={() => setActivePlatform('windows')}
                  style={{
                    padding:'6px 12px',
                    borderRadius:8,
                    background: activePlatform === 'windows' ? '#4da6ff' : 'transparent',
                    color: activePlatform === 'windows' ? '#fff' : '#bbb',
                    border: activePlatform === 'windows' ? 'none' : '1px solid #444',
                    cursor:'pointer',
                    flex:1
                  }}
                >
                  Windows
                </button>
              </div>
              
              {activePlatform === 'ios' && (
                <div style={{color:'#fff'}}>
                  <div style={{marginBottom:12}}>
                    1. Скачайте приложение Streisand из App Store
                  </div>
                  <a 
                    href="https://apps.apple.com/app/streisand/id6450534064" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display:'block',
                      marginBottom:12,
                      textAlign:'center'
                    }}
                  >
                    <img 
                      src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
                      alt="Download on the App Store" 
                      style={{height:40}}
                    />
                  </a>
                  <div style={{marginBottom:12}}>
                    2. Откройте приложение и нажмите на "+" в правом верхнем углу
                  </div>
                  <div style={{marginBottom:12}}>
                    3. Выберите "Импортировать из буфера обмена" или "Сканировать QR-код"
                  </div>
                  <div style={{marginBottom:12}}>
                    4. Вставьте скопированную ссылку подписки или отсканируйте QR-код
                  </div>
                  <img 
                    src={`${process.env.PUBLIC_URL}/exm.jpg`}
                    alt="Streisand iOS App" 
                    style={{width:'100%', borderRadius:8, marginTop:12, marginBottom:12}} 
                  />
                </div>
              )}
              
              {activePlatform === 'android' && (
                <div style={{color:'#fff'}}>
                  <div style={{padding:12, textAlign:'center'}}>
                    Инструкции для Android будут доступны в ближайшее время
                  </div>
                </div>
              )}
              
              {activePlatform === 'windows' && (
                <div style={{color:'#fff'}}>
                  <div style={{padding:12, textAlign:'center'}}>
                    Инструкции для Windows будут доступны в ближайшее время
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div style={{color:'#aaa',fontSize:'0.9em',textAlign:'center'}}>
          <p>Используйте эту ссылку для настройки VPN в вашем клиенте.</p>
          <p>Срок действия: 30 дней</p>
        </div>
      </div>
    );
  }

  // Если пользователь не найден и не активирован, показываем форму активации
  return (
    <div style={{maxWidth:340,margin:'32px auto',background:'#23232b',padding:24,borderRadius:16,boxShadow:'0 2px 12px rgba(0,0,0,0.11)'}}>
      <h3 style={{color:'#fff',textAlign:'center',marginBottom:18}}>Активация VPN</h3>
      
      <form onSubmit={handleActivation}>
        <label style={{color:'#fff',marginBottom:6,display:'block'}}>Введите ключ активации</label>
        <input 
          type="text" 
          value={activationKey} 
          onChange={e=>setActivationKey(e.target.value)} 
          required 
          placeholder="Ключ активации" 
          style={{width:'100%',padding:8,borderRadius:8,border:'1px solid #444',marginBottom:16}} 
        />
        
        {error && <div style={{color:'#f44336',marginBottom:16}}>{error}</div>}
        
        <button 
          type="submit" 
          style={{width:'100%',padding:10,borderRadius:8,background:'#4da6ff',color:'#fff',border:'none',fontWeight:600,fontSize:'1em',cursor:'pointer',marginBottom:16}}
        >
          Активировать
        </button>
        
        <a 
          href="https://funpay.com/users/3051490/" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display:'block',
            width:'100%',
            padding:10,
            borderRadius:8,
            background:'#4caf50',
            color:'#fff',
            border:'none',
            fontWeight:600,
            fontSize:'1em',
            cursor:'pointer',
            textDecoration:'none',
            textAlign:'center'
          }}
        >
          Купить ключ
        </a>
      </form>
      
      <div style={{color:'#aaa',fontSize:'0.9em',textAlign:'center',marginTop:16}}>
        <p>Для получения ключа активации обратитесь к администратору.</p>
      </div>
    </div>
  );
}
