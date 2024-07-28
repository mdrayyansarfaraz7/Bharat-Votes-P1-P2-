import React from 'react';

import logo from '../assets/Logo.png'; 


const NotFound = () => {
    return (
            <div className="NotFound">
                <img src={logo} alt="Logo" className="logo" />
                <span className="navbar-title">Page Not Found</span>
            </div>
           
    );
}

export default NotFound;