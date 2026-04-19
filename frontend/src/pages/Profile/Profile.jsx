import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, ShieldCheck, Edit3, Save, CheckCircle } from 'lucide-react'
import './Profile.css'

const Profile = () => {
    const [user, setUser] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        username: '',
        bio: '',
        contact: '',
        location: ''
    })
    const [secondaryEmail, setSecondaryEmail] = useState('')
    const token = localStorage.getItem('token')

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/v1/user/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (response.ok) {
                setUser(data.user)
                setFormData({
                    username: data.user.username || '',
                    bio: data.user.profile?.bio || '',
                    contact: data.user.profile?.contact || '',
                    location: data.user.profile?.location || ''
                })
            }
        } catch (err) { console.error(err) }
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch('http://localhost:5000/api/v1/user/update', {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })
            if (response.ok) {
                setIsEditing(false)
                fetchProfile()
                alert("Profile Updated!")
            }
        } catch (err) { alert("Update failed") }
    }

    if (!user) return <div className="loader"></div>

    return (
        <motion.div className="profile-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="profile-grid">
                
                <div className="profile-sidebar">
                    <div className="avatar-section">
                        <img 
                            src={`https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff&size=128`} 
                            alt="profile" 
                        />
                        <h2>{user.name}</h2>
                        <span className="role-tag">{user.role}</span>
                    </div>
                    
                    <div className="sidebar-details">
                        <div className="detail-item">
                            <Mail size={16} /> <span>{user.email}</span>
                        </div>
                        {user.username && (
                            <div className="detail-item">
                                <User size={16} /> <span>@{user.username}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="profile-main">
                    <div className="section-header">
                        <h3>General Settings</h3>
                        <button 
                            className={isEditing ? "btn-cancel" : "btn-edit"} 
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? "Cancel" : <><Edit3 size={16}/> Edit Profile</>}
                        </button>
                    </div>

                    <form onSubmit={handleUpdate} className="profile-form">
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Username</label>
                                <input 
                                    type="text" 
                                    disabled={!isEditing}
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    placeholder="Set unique username"
                                />
                            </div>
                            <div className="input-group">
                                <label>Contact Number</label>
                                <input 
                                    type="text" 
                                    disabled={!isEditing}
                                    value={formData.contact}
                                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                                    placeholder="+1234567890"
                                />
                            </div>
                            <div className="input-group full-width">
                                <label>Bio</label>
                                <textarea 
                                    disabled={!isEditing}
                                    value={formData.bio}
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                    placeholder="Tell the team about yourself..."
                                />
                            </div>
                        </div>
                        {isEditing && (
                            <button type="submit" className="save-btn">
                                <Save size={18}/> Save Changes
                            </button>
                        )}
                    </form>

                    <div className="secondary-email-section">
                        <h3>Security & Emails</h3>
                        <div className="email-card">
                            <div className="email-info">
                                <Mail size={18} className="icon-purple" />
                                <div>
                                    <p className="email-text">
                                        {user.secondaryEmail || "No secondary email added"}
                                    </p>
                
                                    {user.secondaryEmail && (
                                        <span className={`status-badge ${user.isSecondaryVerified ? 'verified' : 'pending'}`}>
                                            {user.isSecondaryVerified ? 'Verified' : 'Verification Pending'}
                                        </span>
                                    )}
                                </div>
                            </div>
        
                            {!user.secondaryEmail ? (
                                <button className="btn-add" onClick={() => setShowAddModal(true)}>
                                    Add Email
                                </button>
                            ) : !user.isSecondaryVerified && (
                                <button className="btn-edit" onClick={() => setShowVerifyModal(true)}>
                                    Verify Now
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default Profile