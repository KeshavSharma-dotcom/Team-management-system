import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Sparkles, 
  LogOut, 
  Menu, 
  X,
  LogIn,
  UserPlus
} from 'lucide-react'
import './NavBar.css'

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    const isLoggedIn = !!localStorage.getItem('token')
    const userData = JSON.parse(localStorage.getItem('user')) || { name: 'Guest' }

    const isActive = (path) => location.pathname === path ? 'active' : ''

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setIsOpen(false)
        navigate('/login')
    }

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <Sparkles className="logo-icon" />
                    <span>Team<span>Control</span></span>
                </Link>

                <div className="mobile-icon" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </div>

                <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
                    {isLoggedIn ? (
                        <>
                            <li className="nav-item">
                                <Link to="/dashboard" className={`nav-links ${isActive('/dashboard')}`} onClick={() => setIsOpen(false)}>
                                    <LayoutDashboard size={18} /> Dashboard
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/teams" className={`nav-links ${isActive('/teams')}`} onClick={() => setIsOpen(false)}>
                                    <Users size={18} /> My Teams
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/tasks" className={`nav-links ${isActive('/tasks')}`} onClick={() => setIsOpen(false)}>
                                    <CheckSquare size={18} /> Tasks
                                </Link>
                            </li>
                            <li className="nav-item logout-mobile">
                                <button onClick={handleLogout} className="logout-btn">
                                    <LogOut size={18} /> Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="nav-item">
                                <Link to="/login" className={`nav-links ${isActive('/login')}`} onClick={() => setIsOpen(false)}>
                                    <LogIn size={18} /> Login
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/register" className={`nav-links ${isActive('/register')}`} onClick={() => setIsOpen(false)}>
                                    <UserPlus size={18} /> Get Started
                                </Link>
                            </li>
                        </>
                    )}
                </ul>

                {isLoggedIn && (
                    <div className="nav-actions">
                        <div className="user-profile">
                            <img 
                                src={`https://ui-avatars.com/api/?name=${userData.name}&background=6366f1&color=fff`} 
                                alt="profile" 
                            />
                            <span className="user-name-desktop">{userData.name.split(' ')[0]}</span>
                        </div>
                        <button onClick={handleLogout} className="logout-btn desktop-only" title="Logout">
                            <LogOut size={18} />
                        </button>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default NavBar