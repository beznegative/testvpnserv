import React, { useState } from 'react';
import GetAdminTokenForm from './GetAdminTokenForm';
import CreateMarzbanUserForm from './CreateMarzbanUserForm';
import GetUserSubscriptionForm from './GetUserSubscriptionForm';

export default function AdminTab() {
  const [adminToken, setAdminToken] = useState('');
  
  return (
    <div>
      <div style={{maxWidth:340,margin:'32px auto 0',background:'#23232b',padding:24,borderRadius:16,boxShadow:'0 2px 12px rgba(0,0,0,0.11)'}}>
        <h3 style={{color:'#fff',textAlign:'center',marginBottom:18}}>Панель администратора</h3>
        <p style={{color:'#aaa',textAlign:'center',marginBottom:12}}>
          Здесь вы можете управлять пользователями VPN и настройками системы.
        </p>
      </div>
      
      <GetAdminTokenForm onToken={setAdminToken} />
      <CreateMarzbanUserForm adminToken={adminToken} />
      <GetUserSubscriptionForm />
    </div>
  );
}
