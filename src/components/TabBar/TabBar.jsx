import React from 'react';
import './TabBar.css';

const icons = {
    home: (
        <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><path d="M3 11L12 4l9 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 21V13h6v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 21H3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
    vpn: (
        <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2"/><path d="M7 12a5 5 0 0 1 10 0" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
    ),
    admin: (
        <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><path d="M12 4L4 8l8 4 8-4-8-4z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 12l8 4 8-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 16l8 4 8-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
    users: (
        <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><circle cx="8" cy="8" r="4" stroke="#fff" strokeWidth="2"/><circle cx="16" cy="8" r="4" stroke="#fff" strokeWidth="2"/><path d="M2 20c0-3.314 5.373-6 12-6s12 2.686 12 6" stroke="#fff" strokeWidth="2"/></svg>
    )
};

export default function TabBar({ active, onChange, isAdmin }) {
    return (
        <nav className="tab-bar">
            <button className={active === 'home' ? 'active' : ''} onClick={() => onChange('home')}>
                {icons.home}
                <span>Home</span>
            </button>
            <button className={active === 'vpn' ? 'active' : ''} onClick={() => onChange('vpn')}>
                {icons.vpn}
                <span>VPN</span>
            </button>
            {isAdmin && (
                <>
                    <button className={active === 'admin' ? 'active' : ''} onClick={() => onChange('admin')}>
                        {icons.admin}
                        <span>Admin</span>
                    </button>
                    <button className={active === 'users' ? 'active' : ''} onClick={() => onChange('users')}>
                        {icons.users}
                        <span>Users</span>
                    </button>
                </>
            )}
        </nav>
    );
}
