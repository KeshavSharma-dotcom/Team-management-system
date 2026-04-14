import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react'
import './Login.css'

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('http://localhost:5000/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user))
                
                navigate('/dashboard')
            } else {
                alert(data.msg || 'Login failed')
            }
        } catch (error) {
            alert('Server is offline. Check your backend!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div 
            className="auth-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div 
                className="auth-card"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="login-header">
                    <div className="login-icon-box">
                        <LogIn size={28} />
                    </div>
                    <h2>Login</h2>
                    <p className="subtitle">Enter your credentials to access TeamControl</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <Mail size={20} />
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="Email Address" 
                            required 
                            onChange={handleChange} 
                        />
                    </div>

                    <div className="input-group">
                        <Lock size={20} />
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="Password" 
                            required 
                            onChange={handleChange} 
                        />
                    </div>

                    <div className="forgot-link-container">
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
                    </button>
                </form>

                <p className="auth-footer">
                    New here? <Link to="/register">Create an account</Link>
                </p>
            </motion.div>
        </motion.div>
    )
}

export default Login