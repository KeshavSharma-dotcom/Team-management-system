import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Shield, ArrowRight, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import '../Login/Login.css'
import { apiCall } from '../../utils/api'

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'member' })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify(formData)
            })
            toast.success('OTP sent to your email!')
            navigate('/verify-otp', { state: { email: formData.email } })
        } catch (error) {
            toast.error(error.message || 'Registration failed')
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
                <h2>Create account</h2>
                <p className="auth-subtitle">Create an account for team workspaces</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <User size={18} className="input-icon" />
                        <input type="text" name="name" placeholder="Full name" required value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="input-group">
                        <Mail size={18} className="input-icon" />
                        <input type="email" name="email" placeholder="Email address" required value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="input-group">
                        <Lock size={18} className="input-icon" />
                        <input type="password" name="password" placeholder="Password (min 8 chars)" required value={formData.password} onChange={handleChange} />
                    </div>
                    <div className="input-group">
                        <Shield size={18} className="input-icon" />
                        <select name="role" onChange={handleChange} value={formData.role}>
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? <span className="btn-loader" /> : <>Create Account <ArrowRight size={18} /></>}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </motion.div>
        </div>
    )
}

export default Register
