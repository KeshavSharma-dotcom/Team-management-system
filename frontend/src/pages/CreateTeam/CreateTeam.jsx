import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Hash, Globe, Lock, Plus, ArrowLeft } from 'lucide-react'
import './CreateTeam.css'

const CreateTeam = () => {
    const [formData, setFormData] = useState({
        teamName: '',
        teamCode: '',
        status: 'public'
    })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        const token = localStorage.getItem('token')

        try {
            const response = await fetch('http://localhost:5000/api/v1/teams/create', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                alert('Team created successfully!')
                navigate('/dashboard')
            } else {
                alert(data.msg || 'Error creating team')
            }
        } catch (error) {
            alert('Server error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div 
            className="create-team-page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="create-card">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} /> Back
                </button>

                <div className="create-header">
                    <div className="icon-box">
                        <Users size={28} />
                    </div>
                    <h2>Forge a New Team</h2>
                    <p>Set the foundation for your next big project</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-field">
                        <label>Team Name</label>
                        <div className="input-wrapper">
                            <Users size={18} />
                            <input 
                                type="text" 
                                name="teamName" 
                                placeholder="e.g. Alpha Squad" 
                                required 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>

                    <div className="input-field">
                        <label>Unique Team Code</label>
                        <div className="input-wrapper">
                            <Hash size={18} />
                            <input 
                                type="text" 
                                name="teamCode" 
                                placeholder="min 6 characters" 
                                minLength="6"
                                required 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>

                    <div className="status-selector">
                        <label className={`status-option ${formData.status === 'public' ? 'selected' : ''}`}>
                            <input 
                                type="radio" 
                                name="status" 
                                value="public" 
                                checked={formData.status === 'public'}
                                onChange={handleChange} 
                            />
                            <Globe size={18} />
                            <span>Public</span>
                        </label>

                        <label className={`status-option ${formData.status === 'private' ? 'selected' : ''}`}>
                            <input 
                                type="radio" 
                                name="status" 
                                value="private" 
                                onChange={handleChange} 
                            />
                            <Lock size={18} />
                            <span>Private</span>
                        </label>
                    </div>

                    <button type="submit" className="submit-team-btn" disabled={loading}>
                        {loading ? 'Creating...' : 'Launch Team'} <Plus size={20} />
                    </button>
                </form>
            </div>
        </motion.div>
    )
}

export default CreateTeam