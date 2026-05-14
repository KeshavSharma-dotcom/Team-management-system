import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, CheckSquare,
  LogOut, Menu, X, LogIn, User, Shield, Mail, Globe, FileSearch
} from 'lucide-react'
import './NavBar.css'
import { clearSession, getStoredUser, getToken } from '../../utils/session'

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const profileRef = useRef(null)

    const isLoggedIn = !!getToken()
    const userData = getStoredUser({ name: 'Guest', email: 'Not logged in', role: 'visitor' })

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
        clearSession()
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
                    <LayoutDashboard className="logo-icon" />
                    <span>Team<span>Control</span></span>
                </Link>

                <button className="mobile-icon" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle navigation" type="button">
                    {isOpen ? <X /> : <Menu />}
                </button>

                <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
                    {isLoggedIn ? (
                        <>
                            <li><Link to="/dashboard" className={`nav-links ${isActive('/dashboard')}`} onClick={() => setIsOpen(false)}><LayoutDashboard size={18} /> Dashboard</Link></li>
                            <li><Link to="/myteams" className={`nav-links ${isActive('/myteams')}`} onClick={() => setIsOpen(false)}><Users size={18} /> Teams</Link></li>
                            <li><Link to="/tasks" className={`nav-links ${isActive('/tasks')}`} onClick={() => setIsOpen(false)}><CheckSquare size={18} /> Tasks</Link></li>
                            <li><Link to="/resume-checker" className={`nav-links ${isActive('/resume-checker')}`} onClick={() => setIsOpen(false)}><FileSearch size={18} /> Resumes</Link></li>
                            <li><Link to="/community" className={`nav-links ${isActive('/community')}`} onClick={() => setIsOpen(false)}><Globe size={18} /> Community</Link></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login" className={`nav-links ${isActive('/login')}`} onClick={() => setIsOpen(false)}><LogIn size={18} /> Login</Link></li>
                            <li><Link to="/register" className="nav-links-cta" onClick={() => setIsOpen(false)}>Create Account</Link></li>
                        </>
                    )}
                </ul>

                {isLoggedIn && (
                    <div className="nav-actions" ref={profileRef}>
                        <div className="profile-trigger" onClick={() => setShowProfile(!showProfile)}>
                            <img 
                                src={`https://ui-avatars.com/api/?name=${userData?.name || 'User'}&background=${(userData?.avatarColor || '#6366f1').replace('#', '')}&color=fff&bold=true`} 
                                alt="profile" 
                                className="nav-avatar"
                            />
                            <span className="user-name-desktop">{userData?.name?.split(' ')[0] || 'User'}</span>
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
                                            <img src={`https://ui-avatars.com/api/?name=${userData?.name || 'User'}&background=${(userData?.avatarColor || '#6366f1').replace('#', '')}&color=fff`} alt="avatar" />
                                        </div>
                                        <div className="user-details" onClick={()=>{navigate("/profile")}}>
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
