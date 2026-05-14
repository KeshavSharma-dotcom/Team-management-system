import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
    MessageSquare, CheckCircle2, Sparkles, Send, 
    Bot, Users as UsersIcon, Settings, User, Crown, Bell, Check, X,
    FileText, Edit3, Save, ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import './TeamDetails.css'
import { getInitials } from '../../utils/stringUtils'
import KanbanBoard from '../../components/KanbanBoard/KanbanBoard'

import { apiCall } from '../../utils/api'
import { getStoredUser } from '../../utils/session'

const TeamDetails = () => {
    const { teamId } = useParams()
    const navigate = useNavigate()
    const [team, setTeam] = useState(null)
    const [tasks, setTasks] = useState([])
    const [activeTab, setActiveTab] = useState('overview')
    const [message, setMessage] = useState('')
    const [summary, setSummary] = useState('')
    const [aiLoading, setAiLoading] = useState(false)
    const [joinRequests, setJoinRequests] = useState([])
    const [editingDesc, setEditingDesc] = useState(false)
    const [descValue, setDescValue] = useState('')
    const [savingDesc, setSavingDesc] = useState(false)
    
    const currentUser = getStoredUser({})

    useEffect(() => {
        fetchTeamData()
        fetchTasks()
    }, [teamId])

    useEffect(() => {
        if (!team) return;
        const userId = getStoredUser({})?.userId;
        const ownerCheck = team.createdBy?.toString() === userId?.toString();
        if (ownerCheck) fetchJoinRequests();
    }, [team])

    const fetchJoinRequests = async () => {
        try {
            const data = await apiCall(`/teams/${teamId}/join-requests`)
            setJoinRequests(data.requests)
        } catch (err) { console.error(err) }
    }

    const fetchTasks = async () => {
        try {
            const data = await apiCall(`/tasks/team/${teamId}`)
            setTasks(data.tasks || [])
        } catch (err) { console.error(err) }
    }

    const fetchTeamData = async () => {
        try {
            const data = await apiCall(`/teams/${teamId}/chat`)
            setTeam(data)
            setDescValue(data.description || '')
        } catch (err) { console.error(err) }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!message.trim()) return
        try {
            await apiCall('/teams/chat', {
                method: 'POST',
                body: JSON.stringify({ teamId, text: message })
            })
            setMessage('')
            fetchTeamData() 
        } catch (err) { console.error(err) }
    }

    const getAiSummary = async () => {
        setAiLoading(true)
        try {
            const data = await apiCall(`/teams/${teamId}/summarize`)
            setSummary(data.summary)
            if (!data.summary) toast.error('No summary generated — try sending some messages first!')
        } catch (err) {
            toast.error(err.message || 'Summary failed. Check the analysis service configuration.')
        } finally {
            setAiLoading(false)
        }
    }

    const handleSaveDescription = async () => {
        setSavingDesc(true)
        try {
            await apiCall(`/teams/${teamId}/settings`, {
                method: 'PATCH',
                body: JSON.stringify({ description: descValue })
            })
            setTeam(prev => ({ ...prev, description: descValue }))
            setEditingDesc(false)
            toast.success('Description updated!')
        } catch (err) {
            toast.error(err.message || 'Failed to update description')
        } finally {
            setSavingDesc(false)
        }
    }

    const handleRoleChange = async (targetUserId, newRole) => {
        try {
            await apiCall('/teams/role', {
                method: 'PATCH',
                body: JSON.stringify({ teamId, targetUserId, newRole })
            })
            toast.success(`Role updated to ${newRole}`)
            fetchTeamData()
        } catch (err) {
            toast.error(err.message || 'Failed to update role')
        }
    }

    const handleRequestAction = async (targetUserId, action) => {
        try {
            const data = await apiCall(`/teams/${teamId}/respond-request`, {
                method: 'PATCH',
                body: JSON.stringify({ targetUserId, action })
            })
            toast.success(data.message || 'Action completed')
            setJoinRequests(prev => prev.filter(r => r.user._id !== targetUserId))
            if (action === 'approve') fetchTeamData()
        } catch (err) {
            toast.error(err.message || 'Action failed')
        }
    }

    if (!team) return <div className="loader-container"><div className="loader"></div></div>

    const isOwner = team.createdBy?.toString() === currentUser.userId?.toString()
    const currentMember = team.members?.find(m => (m.user?._id || m.user)?.toString() === currentUser.userId?.toString())
    const isAdminOrOwner = currentMember && (currentMember.role === 'owner' || currentMember.role === 'sub-admin')

    return (
        <motion.div 
            className="team-details-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <header className="team-header">
                <div className="header-info">
                    <h1>{team.teamName}</h1>
                    <div className="status-row">
                        <span className={`badge ${team.status}`}>{team.status}</span>
                        {team.hide && <span className="badge hidden">Hidden</span>}
                    </div>
                </div>
                
                <div className="header-actions">
                    <button className="ai-summary-btn" onClick={getAiSummary} disabled={aiLoading}>
                        {aiLoading 
                            ? <><span className="ai-spinner" /> Summarising...</>
                            : <><Sparkles size={16} /> Discussion Summary</>}
                    </button>
                    {isOwner && (
                        <button className="settings-icon-btn" onClick={() => navigate(`/team/${teamId}/settings`)}>
                            <Settings size={18} />
                        </button>
                    )}
                </div>
            </header>

            <nav className="team-tabs">
                <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
                    Overview
                </button>
                <button className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')}>
                    Tasks
                </button>
                <button className={activeTab === 'discussion' ? 'active' : ''} onClick={() => setActiveTab('discussion')}>
                    Discussion
                </button>
                <button className={activeTab === 'members' ? 'active' : ''} onClick={() => setActiveTab('members')}>
                    Members
                </button>
                {isOwner && (
                    <button className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}>
                        <Bell size={14} />
                        Requests
                        {joinRequests.length > 0 && (
                            <span className="req-badge">{joinRequests.length}</span>
                        )}
                    </button>
                )}
            </nav>

            <div className="tab-content">
                {activeTab === 'overview' && (
                    <motion.div className="overview-tab" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                        <div className="hero-stats">
                            <div className="stat-box">
                                <CheckCircle2 size={24} />
                                <div>
                                    <h3>{tasks.length > 0 ? Math.round((tasks.filter(t => t.isCompleted).length / tasks.length) * 100) : 0}%</h3>
                                    <p>Completion</p>
                                </div>
                            </div>
                            <div className="stat-box">
                                <MessageSquare size={24} />
                                <div>
                                    <h3>{team.discussions?.length || 0}</h3>
                                    <p>Messages</p>
                                </div>
                            </div>
                            <div className="stat-box">
                                <UsersIcon size={24} />
                                <div>
                                    <h3>{team.members?.length || 0}</h3>
                                    <p>Members</p>
                                </div>
                            </div>
                        </div>

                        {/* Team Description */}
                        <div className="desc-card">
                            <div className="desc-card-header">
                                <span className="desc-card-title"><FileText size={16} /> About This Team</span>
                                {isOwner && !editingDesc && (
                                    <button className="desc-edit-btn" onClick={() => setEditingDesc(true)}>
                                        <Edit3 size={14} /> Edit
                                    </button>
                                )}
                                {editingDesc && (
                                    <div className="desc-action-btns">
                                        <button className="desc-save-btn" onClick={handleSaveDescription} disabled={savingDesc}>
                                            <Save size={13} /> {savingDesc ? 'Saving...' : 'Save'}
                                        </button>
                                        <button className="desc-cancel-btn" onClick={() => { setEditingDesc(false); setDescValue(team.description || '') }}>
                                            <X size={13} /> Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                            {editingDesc ? (
                                <textarea
                                    className="desc-textarea"
                                    value={descValue}
                                    onChange={e => setDescValue(e.target.value)}
                                    placeholder="Describe what this team is about, its goals, and how members can contribute..."
                                    rows={4}
                                />
                            ) : (
                                <p className={team.description ? 'desc-text' : 'empty-text'}>
                                    {team.description || (isOwner ? 'No description yet. Click Edit to add one.' : 'No description provided.')}
                                </p>
                            )}
                        </div>

                        {/* Discussion summary */}
                        {summary && (
                            <div className="ai-summary-card">
                                <div className="ai-summary-header">
                                    <Bot size={18} />
                                    <span>Discussion Briefing</span>
                                    <button className="ai-dismiss-btn" onClick={() => setSummary('')}><X size={14} /></button>
                                </div>
                                <div className="ai-summary-body">
                                    {summary.split('\n').filter(Boolean).map((line, i) => (
                                        <p key={i} className="ai-summary-line">{line}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="overview-grid">
                            <div className="overview-left">
                                <div className="widget-card">
                                    <h3><CheckCircle2 size={18} /> Urgent Tasks</h3>
                                    <div className="urgent-list">
                                        {tasks.filter(t => !t.isCompleted).slice(0, 3).map(task => (
                                            <div key={task._id} className="urgent-item">
                                                <span>{task.title}</span>
                                                <button onClick={() => setActiveTab('tasks')}>View</button>
                                            </div>
                                        ))}
                                        {tasks.filter(t => !t.isCompleted).length === 0 && <p className="empty-text">All caught up! 🎉</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="overview-right">
                                <div className="widget-card">
                                    <h3>Team Members</h3>
                                    <div className="mini-member-list">
                                        {team.members?.slice(0, 5).map((member, i) => (
                                            <div key={i} className="mini-member">
                                                <div 
                                                    className="mini-avatar"
                                                    style={{ backgroundColor: member.user?.avatarColor || '#4f46e5' }}
                                                >
                                                    {getInitials(member.user?.name)}
                                                </div>
                                                <div>
                                                    <span className="mini-name">{member.user?.name}</span>
                                                    <span className="mini-role">{member.role}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'tasks' && (
                    <motion.div className="kanban-tab-container full-height" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <KanbanBoard teamId={teamId} initialTasks={tasks} members={team.members} fetchTasks={fetchTasks} />
                    </motion.div>
                )}

                {activeTab === 'discussion' && (
                    <motion.section className="discussion-box full-height" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="chat-messages">
                            {team.discussions?.map((msg, index) => {
                                const isOwnMsg = msg.user?._id === currentUser.userId || msg.user === currentUser.userId;
                                const displayName = msg.userName || "User"; 
                                
                                return (
                                    <div key={index} className={`msg-container ${isOwnMsg ? 'own-container' : ''}`}>
                                        <div 
                                            className="chat-avatar-circle" 
                                            style={{ backgroundColor: msg.user?.avatarColor || '#6366f1' }}
                                        >
                                            {getInitials(msg.user?.name || msg.userName)}
                                        </div>
                                        <div className={`msg-bubble ${isOwnMsg ? 'own-msg' : ''}`}>
                                            <span className="msg-user">{displayName}</span>
                                            <p>{msg.text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <input 
                                type="text" 
                                placeholder="Message the team..." 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button type="submit" className="send-btn">
                                <Send size={18} />
                            </button>
                        </form>
                    </motion.section>
                )}

                {activeTab === 'members' && (
                    <motion.div className="members-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="sidebar-card full-width">
                            <div className="card-header">
                                <UsersIcon size={18} /> <h3>Team Roster ({team.members?.length || 0})</h3>
                            </div>
                            <div className="member-list-grid">
                                {team.members?.map((member, index) => {
                                    const memberId = (member.user?._id || member.user)?.toString()
                                    const isSelf = memberId === currentUser.userId?.toString()
                                    const isOwnerMember = member.role === 'owner'
                                    return (
                                        <div key={index} className="member-card">
                                            <div 
                                                className="member-avatar-large"
                                                style={{ backgroundColor: member.user?.avatarColor || '#6366f1', backgroundImage: 'none' }}
                                            >
                                                {getInitials(member.user?.name)}
                                            </div>
                                            <div className="member-info">
                                                <p>{member.user?.name || 'Team Member'} {isSelf && <span className="you-tag">you</span>}</p>
                                                <span className="member-role">
                                                    {isOwnerMember ? <><Crown size={10} /> Owner</> : member.role}
                                                </span>
                                            </div>
                                            {isOwner && !isSelf && !isOwnerMember && (
                                                <div className="role-manager">
                                                    <select
                                                        className="role-select"
                                                        value={member.role}
                                                        onChange={e => handleRoleChange(memberId, e.target.value)}
                                                    >
                                                        <option value="member">Member</option>
                                                        <option value="sub-admin">Sub-Admin</option>
                                                        <option value="owner">Owner</option>
                                                    </select>
                                                    <ChevronDown size={12} className="role-select-icon" />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'requests' && isOwner && (
                    <motion.div className="requests-tab" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="widget-card">
                            <h3><Bell size={18} /> Join Requests ({joinRequests.length})</h3>
                            {joinRequests.length === 0 ? (
                                <p className="empty-text">No pending join requests.</p>
                            ) : (
                                <div className="request-list">
                                    {joinRequests.map((req, i) => (
                                        <div key={i} className="request-item">
                                            <div className="req-avatar" style={{ backgroundColor: req.user?.avatarColor || '#6366f1' }}>
                                                {getInitials(req.user?.name)}
                                            </div>
                                            <div className="req-info">
                                                <p>{req.user?.name}</p>
                                                <span>{req.user?.email}</span>
                                            </div>
                                            <div className="req-actions">
                                                <button className="approve-btn" onClick={() => handleRequestAction(req.user._id, 'approve')}>
                                                    <Check size={16} /> Approve
                                                </button>
                                                <button className="reject-btn" onClick={() => handleRequestAction(req.user._id, 'reject')}>
                                                    <X size={16} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}

export default TeamDetails
