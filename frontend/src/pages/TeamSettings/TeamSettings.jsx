import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Globe, Lock, EyeOff, Eye, Save, ArrowLeft } from 'lucide-react';
import './TeamSettings.css';

const TeamSettings = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        teamName: '',
        status: 'public',
        hide: false
    });

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchCurrentSettings = async () => {
            const response = await fetch(`http://localhost:5000/api/v1/teams/${teamId}/chat`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setFormData({
                    teamName: data.teamName,
                    status: data.status,
                    hide: data.hide
                });
            }
        };
        fetchCurrentSettings();
    }, [teamId, token]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/v1/teams/${teamId}/settings`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                alert("Settings Updated!");
                navigate(`/team/${teamId}`);
            }
        } catch (err) {
            alert("Failed to update");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div className="settings-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="settings-card">
                <button className="back-link" onClick={() => navigate(-1)}><ArrowLeft size={16}/> Back to Team</button>
                <div className="settings-header">
                    <Settings className="header-icon" />
                    <h2>Team Settings</h2>
                    <p>Manage privacy, visibility, and team identity.</p>
                </div>

                <form onSubmit={handleUpdate}>
                    <div className="setting-group">
                        <label>Display Name</label>
                        <input 
                            type="text" 
                            value={formData.teamName} 
                            onChange={(e) => setFormData({...formData, teamName: e.target.value})}
                        />
                    </div>

                    <div className="setting-row">
                        <div className="info">
                            <h4>Privacy Status</h4>
                            <p>Private teams require a passcode to join.</p>
                        </div>
                        <div className="toggle-group">
                            <button 
                                type="button"
                                className={formData.status === 'public' ? 'active' : ''}
                                onClick={() => setFormData({...formData, status: 'public'})}
                            >
                                <Globe size={16}/> Public
                            </button>
                            <button 
                                type="button"
                                className={formData.status === 'private' ? 'active' : ''}
                                onClick={() => setFormData({...formData, status: 'private'})}
                            >
                                <Lock size={16}/> Private
                            </button>
                        </div>
                    </div>

                    <div className="setting-row">
                        <div className="info">
                            <h4>Visibility</h4>
                            <p>Hidden teams won't show in global search.</p>
                        </div>
                        <div 
                            className={`visibility-toggle ${formData.hide ? 'is-hidden' : ''}`}
                            onClick={() => setFormData({...formData, hide: !formData.hide})}
                        >
                            {formData.hide ? <><EyeOff size={18}/> Hidden</> : <><Eye size={18}/> Visible</>}
                        </div>
                    </div>

                    <button className="save-settings-btn" disabled={loading}>
                        {loading ? 'Saving...' : <><Save size={18}/> Save Changes</>}
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

export default TeamSettings;