import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react'
import './ResetPassword.css'

const ResetPassword = () => {
    const location = useLocation()
    const navigate = useNavigate()
    
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const email = location.state?.email
    const otp = location.state?.otp

    useEffect(() => {
        if (!email || !otp) {
            navigate('/forgot-password')
        }
    }, [email, otp, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (password !== confirmPassword) {
            return alert('Passwords do not match')
        }

        setLoading(true)

        try {
            const response = await fetch('http://localhost:5000/api/v1/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, password })
            })

            const data = await response.json()

            if (response.ok) {
                alert('Password updated successfully! Please login.')
                navigate('/login')
            } else {
                alert(data.msg || 'Reset failed')
            }
        } catch (error) {
            alert('Server error')
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
            >
                <div className="icon-badge">
                    <ShieldCheck size={32} />
                </div>
                <h2>Secure Account</h2>
                <p className="subtitle">Set a strong new password for <b>{email}</b></p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <Lock size={20} />
                        <input 
                            type="password" 
                            placeholder="New Password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <Lock size={20} />
                        <input 
                            type="password" 
                            placeholder="Confirm New Password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required 
                        />
                    </div>

                    {password && confirmPassword && password !== confirmPassword && (
                        <p className="error-text">
                            <AlertCircle size={14} /> Passwords do not match
                        </p>
                    )}

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Password'} <ArrowRight size={18} />
                    </button>
                </form>
            </motion.div>
        </motion.div>
    )
}

export default ResetPassword