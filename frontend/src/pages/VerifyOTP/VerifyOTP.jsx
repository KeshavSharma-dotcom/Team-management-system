import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { KeyRound, ArrowRight, RefreshCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import './VerifyOTP.css'

import { apiCall } from '../../utils/api'

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
            await apiCall('/auth/verify', {
                method: 'POST',
                body: JSON.stringify({ email, otp })
            })

            if (location.state?.type === 'reset') {
                navigate('/reset-password', { state: { email, otp } }) 
            } else {
                toast.success('Account verified successfully!')
                navigate('/login')
            }
        } catch (error) {
            toast.error(error.message || 'Verification failed')
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        try {
            await apiCall('/auth/resend-otp', {
                method: 'POST',
                body: JSON.stringify({ email })
            })
            toast.success('OTP sent again!')
        } catch (error) {
            toast.error(error.message || 'Failed to resend')
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