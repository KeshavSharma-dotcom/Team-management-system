import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { KeyRound, ArrowRight, RefreshCcw } from 'lucide-react'
import './VerifyOTP.css'

const VerifyOTP = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    
    const email = location.state?.email || ''

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('http://localhost:5000/api/v1/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            })

            const data = await response.json()

            if (response.ok) {
                if (location.state?.type === 'reset') {
                    navigate('/reset-password', { state: { email, otp } }) 
                } else {
                    alert('Account verified successfully!')
                    navigate('/login')
                }
            }
        } catch (error) {
            alert('Connection error')
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/v1/auth/resend-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            if (response.ok) alert('New OTP sent!')
        } catch (error) {
            alert('Failed to resend')
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
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                <div className="icon-badge">
                    <KeyRound size={32} />
                </div>
                <h2>Verify Identity</h2>
                <p className="subtitle">We sent a 6-digit code to <br/> <span>{email}</span></p>

                <form onSubmit={handleSubmit}>
                    <div className="otp-input-wrapper">
                        <input 
                            type="text" 
                            maxLength="6" 
                            placeholder="000000"
                            className="otp-field"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required 
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify Code'} <ArrowRight size={18} />
                    </button>
                </form>

                <button className="resend-link" onClick={handleResend}>
                    <RefreshCcw size={14} /> Resend Code
                </button>
            </motion.div>
        </motion.div>
    )
}

export default VerifyOTP