import React from 'react';
import Button from "../Button/Button";
import {useTelegram} from "../../hooks/useTelegram";
import './Header.css';

const Header = () => {
    const {onClose} = useTelegram();
    return (
        <div className={'header'} style={{display:'flex',justifyContent:'flex-end',alignItems:'center',height:52,padding:'0 10px'}}>
            <Button onClick={onClose} style={{background:'none',border:'none',fontSize:28,lineHeight:1,color:'#fff',padding:0,cursor:'pointer'}}>
                <span aria-label="Закрыть" role="img">✖️</span>
            </Button>
        </div>
    );
};

export default Header;
