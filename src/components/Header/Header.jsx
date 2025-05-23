import React from 'react';
import Button from "../Button/Button";
import {useTelegram} from "../../hooks/useTelegram";
import './Header.css';

const Header = () => {
    const {onClose} = useTelegram();
    return (
        <div className={'header'} style={{display:'flex',justifyContent:'flex-end',alignItems:'center',height:52,padding:'0 10px'}}>
            
        </div>
    );
};

// Удалён компонент Header, теперь возвращает null
export default () => null;
