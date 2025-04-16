import React, { useEffect, useState } from 'react';
import Header from "./components/Header/Header";
import { useTelegram } from "./hooks/useTelegram";
import TabBar from "./components/TabBar/TabBar";
import './App.css';
import AdminTab from './components/AdminTab';
import VpnTab from './components/VpnTab';

const ADMIN_ID = 430892673;
const API_URL = "https://beznegativa.space:3000/users";
const MARZBAN_API_URL = 'https://beznegativa.space:8000/api';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJFZ29yIiwiYWNjZXNzIjoic3VkbyIsImlhdCI6MTc0NDcyMzc4MywiZXhwIjoxNzQ0ODEwMTgzfQ.yWNZkn_Cc4C4M9F6vJWzm5wFxEtD24dmtp0PCPcqJXY';

function UserCard({ user }) {
    const [vpnStatus, setVpnStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Получаем статус VPN для пользователя
    useEffect(() => {
        const fetchVpnStatus = async () => {
            if (!user?.id) return;
            
            setLoading(true);
            try {
                const res = await fetch(`${MARZBAN_API_URL}/user/${user.id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${ADMIN_TOKEN}`,
                        'Accept': 'application/json'
                    }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    setVpnStatus(data);
                }
            } catch (e) {
                setError('Ошибка загрузки данных VPN');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        
        fetchVpnStatus();
    }, [user]);

    // Функция для продления подписки на 30 дней
    const extendSubscription = async () => {
        if (!user?.id) return;
        
        setLoading(true);
        try {
            // Получаем текущие данные пользователя
            const getUserRes = await fetch(`${MARZBAN_API_URL}/user/${user.id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                    'Accept': 'application/json'
                }
            });
            
            if (!getUserRes.ok) {
                throw new Error('Не удалось получить данные пользователя');
            }
            
            const userData = await getUserRes.json();
            
            // Вычисляем новую дату истечения (текущая + 30 дней)
            let newExpire;
            if (userData.expire && userData.expire > Math.floor(Date.now() / 1000)) {
                // Если подписка активна, добавляем 30 дней к текущей дате истечения
                newExpire = userData.expire + (30 * 24 * 60 * 60);
            } else {
                // Если подписка истекла, 30 дней от текущей даты
                const newDate = new Date();
                newDate.setDate(newDate.getDate() + 30);
                newExpire = Math.floor(newDate.getTime() / 1000);
            }
            
            // Обновляем пользователя
            const updateRes = await fetch(`${MARZBAN_API_URL}/user/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ADMIN_TOKEN}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    expire: newExpire,
                    status: 'active'
                })
            });
            
            if (updateRes.ok) {
                const updatedData = await updateRes.json();
                setVpnStatus(updatedData);
                alert('Подписка успешно продлена на 30 дней');
            } else {
                throw new Error('Не удалось продлить подписку');
            }
        } catch (e) {
            setError('Ошибка продления подписки');
            console.error(e);
            alert('Ошибка: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    // Функция для удаления подписки
    const deleteSubscription = async () => {
        if (!user?.id || !confirm('Вы уверены, что хотите удалить подписку пользователя?')) return;
        
        setLoading(true);
        try {
            const res = await fetch(`${MARZBAN_API_URL}/user/${user.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`
                }
            });
            
            if (res.ok) {
                setVpnStatus(null);
                alert('Подписка успешно удалена');
            } else {
                throw new Error('Не удалось удалить подписку');
            }
        } catch (e) {
            setError('Ошибка удаления подписки');
            console.error(e);
            alert('Ошибка: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-card" style={{marginTop: 32, background:'#23232b', padding: 16, borderRadius: 12}}>
            <img
                src={user.photo_url || 'https://via.placeholder.com/80?text=No+Photo'}
                alt="Фото"
                className="user-avatar"
            />
            <div className="user-info">
                <div className="user-username">{user.username}</div>
                <div className="user-id">ID: {user.id}</div>
                
                {loading ? (
                    <div style={{color: '#aaa', marginTop: 8}}>Загрузка...</div>
                ) : vpnStatus ? (
                    <div style={{marginTop: 8}}>
                        <div style={{color: vpnStatus.status === 'active' ? '#4caf50' : '#f44336', marginBottom: 4}}>
                            Статус: {vpnStatus.status === 'active' ? 'Активен' : 'Неактивен'}
                        </div>
                        {vpnStatus.expire && (
                            <div style={{color: '#aaa', marginBottom: 8}}>
                                Истекает: {new Date(vpnStatus.expire * 1000).toLocaleDateString()}
                            </div>
                        )}
                        <div style={{display: 'flex', gap: 8, marginTop: 8}}>
                            <button 
                                onClick={extendSubscription}
                                disabled={loading}
                                style={{
                                    padding: '6px 12px',
                                    background: '#4caf50',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer'
                                }}
                            >
                                Продлить
                            </button>
                            <button 
                                onClick={deleteSubscription}
                                disabled={loading}
                                style={{
                                    padding: '6px 12px',
                                    background: '#f44336',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer'
                                }}
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                ) : error ? (
                    <div style={{color: '#f44336', marginTop: 8}}>{error}</div>
                ) : (
                    <div style={{color: '#aaa', marginTop: 8}}>Нет данных VPN</div>
                )}
            </div>
        </div>
    );
}

function UserGrid({ users }) {
    console.log("UserGrid rendered with users:", users);
    
    return (
        <div className="user-grid" style={{marginTop: 32, padding: '0 16px'}}>
            {users.length === 0 ? (
                <div style={{color: '#fff', textAlign: 'center', padding: '20px', background: '#23232b', borderRadius: '12px'}}>
                    Пользователи не найдены. Проверьте подключение к API.
                </div>
            ) : (
                users.map(u => (
                    <UserCard user={u} key={u.id} />
                ))
            )}
        </div>
    );
}

function HomeTab({ user, onChangeTab }) {
    const [vpnStatus, setVpnStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Получаем статус VPN для текущего пользователя
    useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            return;
        }
        
        const fetchVpnStatus = async () => {
            try {
                const res = await fetch(`${MARZBAN_API_URL}/user/${user.id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${ADMIN_TOKEN}`,
                        'Accept': 'application/json'
                    }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    setVpnStatus(data);
                }
            } catch (e) {
                setError('Не удалось загрузить данные VPN');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        
        fetchVpnStatus();
    }, [user]);

    return (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginTop:48}}>
            <img
                src={user.photo_url || 'https://via.placeholder.com/100?text=No+Photo'}
                alt="Фото"
                style={{width:100,height:100,borderRadius:'50%',marginBottom:12,border:'3px solid #333'}}
            />
            <div style={{fontWeight:700,fontSize:'1.3em',color:'#fff'}}>{user.username}</div>
            
            {/* Информация о VPN подписке */}
            <div style={{marginTop:24,width:'100%',maxWidth:340,background:'#23232b',padding:20,borderRadius:16,boxShadow:'0 2px 12px rgba(0,0,0,0.11)'}}>
                <h3 style={{color:'#fff',textAlign:'center',marginTop:0,marginBottom:16}}>Статус VPN</h3>
                
                {loading ? (
                    <div style={{textAlign:'center',color:'#aaa'}}>Загрузка...</div>
                ) : vpnStatus ? (
                    <div>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                            <span style={{color:'#aaa'}}>Статус:</span>
                            <span style={{color: vpnStatus.status === 'active' ? '#4caf50' : '#f44336'}}>
                                {vpnStatus.status === 'active' ? 'Активен' : 'Неактивен'}
                            </span>
                        </div>
                        
                        {vpnStatus.expire && (
                            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                                <span style={{color:'#aaa'}}>Истекает:</span>
                                <span style={{color:'#fff'}}>{new Date(vpnStatus.expire * 1000).toLocaleDateString()}</span>
                            </div>
                        )}
                        
                        {vpnStatus.data_usage && (
                            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                                <span style={{color:'#aaa'}}>Трафик:</span>
                                <span style={{color:'#fff'}}>
                                    {Math.round(vpnStatus.data_usage / (1024 * 1024 * 1024) * 100) / 100} ГБ
                                </span>
                            </div>
                        )}
                    </div>
                ) : error ? (
                    <div style={{textAlign:'center',color:'#f44336'}}>{error}</div>
                ) : (
                    <div style={{textAlign:'center',color:'#aaa'}}>
                        У вас нет активной подписки VPN.
                        <div style={{marginTop:12}}>
                            <button 
                                onClick={() => onChangeTab('vpn')}
                                style={{padding:'8px 16px',background:'#4da6ff',color:'#fff',border:'none',borderRadius:8,cursor:'pointer'}}
                            >
                                Активировать VPN
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function App() {
    const { user } = useTelegram();
    const [users, setUsers] = useState([]);
    const [tab, setTab] = useState('home');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // При входе отправляем пользователя в базу
    useEffect(() => {
        if (user?.id && user?.username) {
            fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, username: user.username, photo_url: user.photo_url })
            });
        }
    }, [user]);

    // Если админ — получаем всех пользователей
    useEffect(() => {
        if (user?.id === ADMIN_ID) {
            setLoading(true);
            setError('');
            console.log("Запрос пользователей с:", API_URL);
            
            fetch(API_URL)
                .then(res => {
                    console.log("Статус ответа:", res.status);
                    return res.json();
                })
                .then(data => {
                    console.log("Получены пользователи:", data);
                    setUsers(data);
                })
                .catch(err => {
                    console.error("Ошибка при получении пользователей:", err);
                    setError("Не удалось загрузить пользователей: " + err.message);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [user, tab]); // Добавлен tab для обновления при переключении вкладок

    return (
        <div className="App" style={{minHeight:'100vh',background:'#18181c',paddingBottom:72}}>
            <Header />
            {tab === 'home' && user && <HomeTab user={user} onChangeTab={setTab} />}
            {tab === 'vpn' && <VpnTab />}
            {tab === 'admin' && user?.id === ADMIN_ID && <AdminTab />}
            {tab === 'users' && user?.id === ADMIN_ID && (
                loading ? (
                    <div style={{color: '#fff', textAlign: 'center', padding: '40px'}}>Загрузка пользователей...</div>
                ) : error ? (
                    <div style={{color: '#f44336', textAlign: 'center', padding: '40px'}}>{error}</div>
                ) : (
                    <UserGrid users={users} />
                )
            )}
            <TabBar active={tab} onChange={setTab} isAdmin={user?.id === ADMIN_ID} />
        </div>
    );
}

export default App;
