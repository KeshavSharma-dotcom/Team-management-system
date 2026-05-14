import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Fingerprint, ArrowLeft, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import './ForgotPassword.css'
import { apiCall } from '../../utils/api'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            await apiCall('/auth/FP', {
                method: 'POST',
                body: JSON.stringify({ email })
            })

            toast.success('Reset code sent to your email')
            navigate('/verify-otp', { state: { email, type: 'reset' } })
        } catch (error) {
            toast.error(error.message || 'Unable to send reset code')
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
                    <Fingerprint size={32} />
                </div>
                <h2>Lost Access?</h2>
                <p className="subtitle">Enter your email address to receive a recovery code.</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <Mail size={20} />
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Code'} <Send size={18} />
                    </button>
                </form>

                <div className="auth-footer">
                    <Link to="/login" className="back-to-login">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default ForgotPassword
