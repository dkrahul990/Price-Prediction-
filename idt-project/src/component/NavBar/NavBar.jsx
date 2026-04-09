import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../AuthContext'
import './NavBar.css'
import logo from "C:/Users/drahu/OneDrive/Desktop/final prototype/idt-project/src/assets/logo.png"

const NavBar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div>
            <nav className="navbar">
                <div className="logo">
                    <Link to="/"><img src={logo} alt="Logo" /></Link>
                </div>
                <ul className="nav-links">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/companies">Partner Companies</Link></li>
                    <li><Link to="/documentations">Documentations</Link></li>
                    {user && user.role === 'admin' && (
                        <li><Link to="/admin">Admin Panel</Link></li>
                    )}
                    {!user ? (
                        <>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/register">Sign Up</Link></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/dashboard">Dashboard</Link></li>
                            <li><span className="welcome-text">Hi, {user.username}</span></li>
                            <li><a href="#" onClick={handleLogout}>Logout</a></li>
                        </>
                    )}
                </ul>
            </nav>
        </div>
    )
}

export default NavBar
