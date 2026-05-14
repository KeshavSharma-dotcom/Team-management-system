import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import './ResetPassword.css'
import { apiCall } from '../../utils/api'

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
            return toast.error('Passwords do not match')
        }

        setLoading(true)

        try {
            await apiCall('/auth/RP', {
                method: 'POST',
                body: JSON.stringify({ email, otp, password })
            })

            toast.success('Password updated. Please sign in.')
            navigate('/login')
        } catch (error) {
            toast.error(error.message || 'Reset failed')
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
