import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Phone, MapPin, ShieldCheck, Edit3, Save, CheckCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import './Profile.css'

import { apiCall } from '../../utils/api'

const Profile = () => {
    const [user, setUser] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        bio: '',
        contact: '',
        location: '',
        skills: [],
        socialLinks: { github: '', linkedin: '', website: '' },
        bannerUrl: ''
    })
    const [skillInput, setSkillInput] = useState('')
    const [secondaryEmail, setSecondaryEmail] = useState('')
    const [otp, setOtp] = useState('')

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const data = await apiCall('/user/me')
            setUser(data.user)
            setFormData({
                username: data.user.username || '',
                bio: data.user.profile?.bio || '',
                contact: data.user.profile?.contact || '',
                location: data.user.profile?.location || '',
                skills: data.user.profile?.skills || [],
                socialLinks: data.user.profile?.socialLinks || { github: '', linkedin: '', website: '' },
                bannerUrl: data.user.profile?.bannerUrl || ''
            })
        } catch (err) { console.error(err) }
    }

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await apiCall('/user/update', {
                method: 'PATCH',
                body: JSON.stringify(formData)
            });
        
            setIsEditing(false); 
            setUser(data.user); 
            toast.success("Profile Updated!");
        } catch (err) { 
            console.error(err);
            toast.error(err.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    const handleAddEmail = async () => {
        // Mock API call for adding email
        toast.success("Verification OTP sent to " + secondaryEmail)
        setShowAddModal(false)
        setShowVerifyModal(true)
    }

    const handleVerifyEmail = async () => {
        // Mock API call for verification
        toast.success("Email verified successfully")
        setUser({...user, secondaryEmail: secondaryEmail || user.secondaryEmail, isSecondaryVerified: true})
        setShowVerifyModal(false)
    }

    if (!user) return <div className="loader"></div>

    return (
        <motion.div className="profile-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="profile-grid">
                
                <div className="profile-sidebar">
                    <div className="profile-banner" style={{ 
                        backgroundImage: formData.bannerUrl ? `url(${formData.bannerUrl})` : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' 
                    }}></div>
                    <div className="avatar-section">
                        <div className="avatar-circle" style={{ backgroundColor: user.avatarColor || '#6366f1' }}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
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

                    {formData.skills.length > 0 && (
                        <div className="sidebar-skills">
                            <h4>Expertise</h4>
                            <div className="skills-tags">
                                {formData.skills.map((skill, idx) => (
                                    <span key={idx} className="skill-tag">{skill}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {(formData.socialLinks.github || formData.socialLinks.linkedin) && (
                        <div className="sidebar-socials">
                            {formData.socialLinks.github && (
                                <a href={`https://${formData.socialLinks.github}`} target="_blank" rel="noreferrer">
                                    <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="github" width={20} />
                                </a>
                            )}
                            {formData.socialLinks.linkedin && (
                                <a href={`https://${formData.socialLinks.linkedin}`} target="_blank" rel="noreferrer">
                                    <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="linkedin" width={20} />
                                </a>
                            )}
                        </div>
                    )}
                </div>

                <div className="profile-main">
                    <div className="section-header">
                        <h3>General Settings</h3>
                        <button 
                            className={isEditing ? "btn-cancel" : "btn-edit"} 
                            onClick={() => {
                                if (isEditing) {
                                    setFormData({
                                        username: user.username || '',
                                        bio: user.profile?.bio || '',
                                        contact: user.profile?.contact || '',
                                        location: user.profile?.location || '',
                                        skills: user.profile?.skills || [],
                                        socialLinks: user.profile?.socialLinks || { github: '', linkedin: '', website: '' },
                                        bannerUrl: user.profile?.bannerUrl || ''
                                    });
                                }
                                setIsEditing(!isEditing);
                            }}
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
                            <div className="input-group">
                                <label>Location</label>
                                <input 
                                    type="text" 
                                    disabled={!isEditing}
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    placeholder="City, Country"
                                />
                            </div>
                            <div className="input-group">
                                <label>Bio</label>
                                <input 
                                    type="text" 
                                    disabled={!isEditing}
                                    value={formData.bio}
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                    placeholder="Short bio about yourself"
                                />
                            </div>
                             <div className="input-group full-width">
                                <label>Banner URL</label>
                                <input 
                                    type="text" 
                                    disabled={!isEditing}
                                    value={formData.bannerUrl}
                                    onChange={(e) => setFormData({...formData, bannerUrl: e.target.value})}
                                    placeholder="https://images.unsplash.com/..."
                                />
                            </div>

                            <div className="input-group full-width">
                                <label>Skills {isEditing && '(Press Enter to add)'}</label>
                                <div className="skills-input-container" style={{ opacity: isEditing ? 1 : 0.6 }}>
                                    <div className="skills-tags">
                                        {formData.skills.length === 0 && !isEditing && (
                                            <span style={{color: '#64748b', fontSize: '0.9rem', padding: '4px'}}>No skills added</span>
                                        )}
                                        {formData.skills.map((skill, idx) => (
                                            <span key={idx} className="skill-tag">
                                                {skill}
                                                {isEditing && <button type="button" onClick={() => setFormData({...formData, skills: formData.skills.filter((_, i) => i !== idx)})}>×</button>}
                                            </span>
                                        ))}
                                    </div>
                                    {isEditing && (
                                        <input 
                                            type="text"
                                            value={skillInput}
                                            onChange={(e) => setSkillInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && skillInput.trim()) {
                                                    e.preventDefault();
                                                    if (!formData.skills.includes(skillInput.trim())) {
                                                        setFormData({...formData, skills: [...formData.skills, skillInput.trim()]});
                                                    }
                                                    setSkillInput('');
                                                }
                                            }}
                                            placeholder="Add a skill..."
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="input-group">
                                <label>GitHub</label>
                                <input 
                                    type="text" 
                                    disabled={!isEditing}
                                    value={formData.socialLinks.github}
                                    onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, github: e.target.value}})}
                                    placeholder="github.com/username"
                                />
                            </div>
                            <div className="input-group">
                                <label>LinkedIn</label>
                                <input 
                                    type="text" 
                                    disabled={!isEditing}
                                    value={formData.socialLinks.linkedin}
                                    onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, linkedin: e.target.value}})}
                                    placeholder="linkedin.com/in/username"
                                />
                            </div>
                        </div>
                        {isEditing && (
                            <button type="submit" className="save-btn" disabled={loading}>
                                {loading ? "Saving..." : <><Save size={18}/> Save Changes</>}
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

            <AnimatePresence>
                {showAddModal && (
                    <div className="modal-overlay">
                        <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={20} /></button>
                            <h3>Add Secondary Email</h3>
                            <div className="input-group">
                                <label>Email Address</label>
                                <input type="email" value={secondaryEmail} onChange={(e) => setSecondaryEmail(e.target.value)} placeholder="backup@example.com" />
                            </div>
                            <button className="btn-primary full-width-btn" style={{marginTop: '20px'}} onClick={handleAddEmail}>Send Verification OTP</button>
                        </motion.div>
                    </div>
                )}
                {showVerifyModal && (
                    <div className="modal-overlay">
                        <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                            <button className="modal-close" onClick={() => setShowVerifyModal(false)}><X size={20} /></button>
                            <h3>Verify Email</h3>
                            <p style={{color: '#94a3b8', fontSize: '0.85rem', marginBottom: '15px'}}>Enter the OTP sent to your email.</p>
                            <div className="input-group">
                                <label>OTP</label>
                                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" />
                            </div>
                            <button className="btn-primary full-width-btn" style={{marginTop: '20px'}} onClick={handleVerifyEmail}>Verify</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default Profile