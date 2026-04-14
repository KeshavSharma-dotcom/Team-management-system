import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Fingerprint, ArrowLeft, Send } from 'lucide-react'
import './ForgotPassword.css'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('http://localhost:5000/api/v1/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await response.json()

            if (response.ok) {
                alert('Reset code sent to your email!')
                navigate('/verify-otp', { state: { email, type: 'reset' } })
            } else {
                alert(data.msg || 'User not found')
            }
        } catch (error) {
            alert('Connection error. Please try again.')
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
                <p className="subtitle">No worries! Enter your email and we'll send you a recovery code.</p>

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