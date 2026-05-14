import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Globe, Lock, EyeOff, Eye, Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import './TeamSettings.css';
import { apiCall } from '../../utils/api'

const TeamSettings = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        teamName: '', description: '', status: 'public', hide: false, passcode: ''
    });

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const data = await apiCall(`/teams/${teamId}/chat`);
                setFormData({
                    teamName: data.teamName || '',
                    description: data.description || '',
                    status: data.status || 'public',
                    hide: data.hide || false,
                    passcode: data.passcode || ''
                });
            } catch (err) { console.error(err) }
        };
        fetchTeam();
    }, [teamId]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!formData.teamName.trim()) return toast.error('Team name cannot be empty');

        setLoading(true);
        try {
            // Omit blank passcodes so validation only runs when the owner enters a value.
            const payload = {
                teamName: formData.teamName.trim(),
                description: formData.description,
                status: formData.status,
                hide: formData.hide,
            };
            if (formData.passcode && formData.passcode.trim().length > 0) {
                payload.passcode = formData.passcode.trim();
            }

            await apiCall(`/teams/${teamId}/settings`, {
                method: 'PATCH',
                body: JSON.stringify(payload)
            });
            toast.success('Settings updated!');
            navigate(`/team/${teamId}`);
        } catch (err) {
            toast.error(err.message || 'Failed to update');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div className="settings-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="settings-card">
                <button className="back-link" onClick={() => navigate(-1)}>
                    <ArrowLeft size={16} /> Back to Team
                </button>

                <div className="settings-header">
                    <div className="settings-icon-box"><Settings size={22} /></div>
                    <div>
                        <h2>Team Settings</h2>
                        <p>Manage privacy, visibility, and team identity</p>
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="settings-form">
                    <div className="setting-group">
                        <label>Display Name</label>
                        <div className="settings-input-wrap">
                            <input
                                type="text"
                                value={formData.teamName}
                                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                                placeholder="Team name"
                                required
                            />
                        </div>
                    </div>

                    <div className="setting-group">
                        <label>Description <span className="optional-badge">optional</span></label>
                        <div className="settings-input-wrap">
                            <textarea
                                className="settings-textarea"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="What is this team about? Goals, topics, focus area..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="setting-block">
                        <div className="setting-block-header">
                            <h4>Privacy Status</h4>
                            <p>Private teams require owner approval for members to join.</p>
                        </div>
                        <div className="toggle-group">
                            <button
                                type="button"
                                className={formData.status === 'public' ? 'active' : ''}
                                onClick={() => setFormData({ ...formData, status: 'public' })}
                            >
                                <Globe size={15} /> Public
                            </button>
                            <button
                                type="button"
                                className={formData.status === 'private' ? 'active' : ''}
                                onClick={() => setFormData({ ...formData, status: 'private' })}
                            >
                                <Lock size={15} /> Private
                            </button>
                        </div>
                    </div>

                    {formData.status === 'private' && (
                        <div className="setting-group">
                            <label>
                                Team Passcode <span className="optional-badge">optional · min 8 chars</span>
                            </label>
                            <div className="settings-input-wrap">
                                <input
                                    type="text"
                                    placeholder="Leave blank to keep existing passcode"
                                    value={formData.passcode}
                                    onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                                    minLength={formData.passcode ? 8 : undefined}
                                />
                            </div>
                            <p className="setting-hint">
                                Members with this code can join directly without approval.
                                Leave blank to keep the current passcode unchanged.
                            </p>
                        </div>
                    )}

                    <div className="setting-block">
                        <div className="setting-block-header">
                            <h4>Discover Visibility</h4>
                            <p>Hidden teams won't appear in the Explore page.</p>
                        </div>
                        <div
                            className={`visibility-toggle ${formData.hide ? 'is-hidden' : ''}`}
                            onClick={() => setFormData({ ...formData, hide: !formData.hide })}
                        >
                            {formData.hide ? <><EyeOff size={16} /> Hidden</> : <><Eye size={16} /> Visible</>}
                        </div>
                    </div>

                    <button type="submit" className="save-settings-btn" disabled={loading}>
                        {loading ? <span className="btn-loader" /> : <><Save size={17} /> Save Changes</>}
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

export default TeamSettings;
