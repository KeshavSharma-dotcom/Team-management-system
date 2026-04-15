import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, Users, CheckSquare, Sparkles, 
  LogOut, Menu, X, LogIn, UserPlus, User, Shield, Mail 
} from 'lucide-react'
import './NavBar.css'

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const profileRef = useRef(null)

    const isLoggedIn = !!localStorage.getItem('token')
    const userData = JSON.parse(localStorage.getItem('user')) || { name: 'Guest', email: 'Not logged in', role: 'visitor' }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setIsOpen(false)
        setShowProfile(false)
        navigate('/login')
    }

    const isActive = (path) => location.pathname === path ? 'active' : ''

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <div className="logo-glow"></div>
                    <Sparkles className="logo-icon" />
                    <span>Team<span>Control</span></span>
                </Link>

                <div className="mobile-icon" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </div>

                <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
                    {isLoggedIn ? (
                        <>
                            <li><Link to="/dashboard" className={`nav-links ${isActive('/dashboard')}`} onClick={() => setIsOpen(false)}><LayoutDashboard size={18} /> Dashboard</Link></li>
                            <li><Link to="/teams" className={`nav-links ${isActive('/teams')}`} onClick={() => setIsOpen(false)}><Users size={18} /> Teams</Link></li>
                            <li><Link to="/tasks" className={`nav-links ${isActive('/tasks')}`} onClick={() => setIsOpen(false)}><CheckSquare size={18} /> Tasks</Link></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login" className={`nav-links ${isActive('/login')}`} onClick={() => setIsOpen(false)}><LogIn size={18} /> Login</Link></li>
                            <li><Link to="/register" className="nav-links-cta" onClick={() => setIsOpen(false)}>Get Started</Link></li>
                        </>
                    )}
                </ul>

                {isLoggedIn && (
                    <div className="nav-actions" ref={profileRef}>
                        <div className="profile-trigger" onClick={() => setShowProfile(!showProfile)}>
                            <img 
                                src={`https://ui-avatars.com/api/?name=${userData.name}&background=6366f1&color=fff&bold=true`} 
                                alt="profile" 
                                className="nav-avatar"
                            />
                            <span className="user-name-desktop">{userData.name.split(' ')[0]}</span>
                        </div>

                        <AnimatePresence>
                            {showProfile && (
                                <motion.div 
                                    className="profile-dropdown"
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                >
                                    <div className="dropdown-header">
                                        <div className="large-avatar">
                                            <img src={`https://ui-avatars.com/api/?name=${userData.name}&background=6366f1&color=fff`} alt="avatar" />
                                        </div>
                                        <div className="user-details">
                                            <h4>{userData.name}</h4>
                                            <p><Mail size={12} /> {userData.email}</p>
                                        </div>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <div className="dropdown-info">
                                        <div className="info-item">
                                            <Shield size={16} /> <span>Role: <strong>{userData.role}</strong></span>
                                        </div>
                                        <div className="info-item">
                                            <User size={16} /> <span>Status: <strong>Active</strong></span>
                                        </div>
                                    </div>
                                    <button onClick={handleLogout} className="dropdown-logout">
                                        <LogOut size={16} /> Logout Session
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default NavBar