import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Shield, ArrowRight } from 'lucide-react'
import './Register.css'

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'member'
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
            const response = await fetch('http://localhost:5000/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                alert('OTP sent to your email!')
                navigate('/verify-otp', { state: { email: formData.email } })
            } else {
                alert(data.msg || 'Registration failed')
            }
        } catch (error) {
            alert('Server error.')
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
                <h2>Create Account</h2>
                <p className="subtitle">Join the smart team management era</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <User size={20} />
                        <input type="text" name="name" placeholder="Full Name" required onChange={handleChange} />
                    </div>

                    <div className="input-group">
                        <Mail size={20} />
                        <input type="email" name="email" placeholder="Email Address" required onChange={handleChange} />
                    </div>

                    <div className="input-group">
                        <Lock size={20} />
                        <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
                    </div>

                    <div className="input-group">
                        <Shield size={20} />
                        <select name="role" onChange={handleChange}>
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Sending OTP...' : 'Register Now'} <ArrowRight size={18} />
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </motion.div>
        </motion.div>
    )
}

export default Register