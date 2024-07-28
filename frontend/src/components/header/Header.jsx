import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/Logo.png'; // Adjust path as necessary
import './navbar.css';

const Header = () => {
    return (
        <header className="navbar">
            <div className="navbar-logo">
                <img src={logo} alt="Logo" className="logo" />
                <span className="navbar-title">Election Commission of India</span>
            </div>
            <nav className="navbar-links">
                <NavLink to="/"  className={({isActive})=>`${isActive ? "ActiveText":"Text"}`}>
                    Home
                </NavLink>
                <NavLink to="/schedule" className={({isActive})=>`${isActive ? "ActiveText":"Text"}`}>
                    Voting Schedule
                </NavLink>
            </nav>
        </header>
    );
}

export default Header;
