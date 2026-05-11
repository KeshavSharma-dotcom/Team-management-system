import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Hash, Globe, Lock, Plus, ArrowLeft, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import './CreateTeam.css'
import { apiCall } from '../../utils/api'

const CreateTeam = () => {
    const [formData, setFormData] = useState({ teamName: '', teamCode: '', status: 'public' })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await apiCall('/teams/create', {
                method: 'POST',
                body: JSON.stringify(formData)
            })
            toast.success('Team created successfully!')
            navigate('/dashboard')
        } catch (error) {
            toast.error(error.message || 'Failed to create team')
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div className="create-team-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="create-card">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} /> Back
                </button>

                <div className="create-header">
                    <div className="icon-box"><Users size={26} /></div>
                    <div>
                        <h2>Create a New Team</h2>
                        <p>Set the foundation for your next big project</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="create-form">
                    <div className="input-field">
                        <label>Team Name</label>
                        <div className="input-wrapper">
                            <Users size={17} />
                            <input
                                type="text"
                                name="teamName"
                                placeholder="e.g. Alpha Squad"
                                required
                                value={formData.teamName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="input-field">
                        <label>Unique Team Code</label>
                        <div className="input-wrapper">
                            <Hash size={17} />
                            <input
                                type="text"
                                name="teamCode"
                                placeholder="Min 6 characters — used to identify your team"
                                minLength="6"
                                required
                                value={formData.teamCode}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="input-field">
                        <label>Privacy</label>
                        <div className="status-selector">
                            <label className={`status-option ${formData.status === 'public' ? 'selected' : ''}`}>
                                <input type="radio" name="status" value="public" checked={formData.status === 'public'} onChange={handleChange} />
                                <Globe size={16} />
                                <span>Public</span>
                                <small>Anyone can discover and join</small>
                            </label>
                            <label className={`status-option ${formData.status === 'private' ? 'selected' : ''}`}>
                                <input type="radio" name="status" value="private" onChange={handleChange} />
                                <Lock size={16} />
                                <span>Private</span>
                                <small>Requires your approval to join</small>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="submit-team-btn" disabled={loading}>
                        {loading ? <span className="btn-loader" /> : <><Zap size={18} /> Launch Team</>}
                    </button>
                </form>
            </div>
        </motion.div>
    )
}

export default CreateTeam