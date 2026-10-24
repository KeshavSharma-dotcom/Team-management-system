import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import './Login.css'
import { apiCall } from '../../utils/api'
import { setSession } from '../../utils/session'

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const data = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: formData.email.trim(),
                    password: formData.password
                })
            })

            // Normalize user keys so ProtectedRoute can read id or userId
            const userPayload = {
                id: data.user.userId || data.user._id || data.user.id,
                userId: data.user.userId || data.user._id || data.user.id,
                name: data.user.name,
                role: data.user.role,
                avatarColor: data.user.avatarColor,
                email: formData.email.toLowerCase().trim()
            }

            // Save token & user payload to storage/context
            setSession({ token: data.token, user: userPayload })

            toast.success('Welcome back!')

            // Replace history entry to prevent back-navigation to login
            navigate('/dashboard', { replace: true })
        } catch (error) {
            toast.error(error.message || 'Login failed. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-glow" />
            <motion.div
                className="auth-card"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <div className="auth-brand">
                    <div className="brand-icon"><Zap size={20} /></div>
                    <span>TeamControl</span>
                </div>
                <h2>Welcome back</h2>
                <p className="auth-subtitle">Sign in to your workspace</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <Mail size={18} className="input-icon" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email address"
                            required
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="input-group">
                        <Lock size={18} className="input-icon" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            required
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="auth-helpers">
                        <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? (
                            <span className="btn-loader" />
                        ) : (
                            <>Sign In <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Create one</Link>
                </p>
            </motion.div>
        </div>
    )
}

export default Login