import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
    MessageSquare, CheckCircle2, Sparkles, Send, 
    Bot, Users as UsersIcon, Settings, User, Crown 
} from 'lucide-react'
import './TeamDetails.css'

const TeamDetails = () => {
    const { teamId } = useParams()
    const navigate = useNavigate()
    const [team, setTeam] = useState(null)
    const [message, setMessage] = useState('')
    const [summary, setSummary] = useState('')
    const [aiLoading, setAiLoading] = useState(false)
    
    const token = localStorage.getItem('token')
    const currentUser = JSON.parse(localStorage.getItem('user'))

    useEffect(() => {
        fetchTeamData()
    }, [teamId])

    const fetchTeamData = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/v1/teams/${teamId}/chat`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (response.ok) setTeam(data)
        } catch (err) { console.error(err) }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!message.trim()) return
        try {
            const response = await fetch('http://localhost:5000/api/v1/teams/chat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ teamId, text: message })
            })
            if (response.ok) {
                setMessage('')
                fetchTeamData() 
            }
        } catch (err) { console.error(err) }
    }

    const getAiSummary = async () => {
        setAiLoading(true)
        try {
            const response = await fetch(`http://localhost:5000/api/v1/teams/${teamId}/summarize`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            setSummary(data.summary)
        } catch (err) { console.error(err) }
        finally { setAiLoading(false) }
    }

    if (!team) return <div className="loader-container"><div className="loader"></div></div>

    const isOwner = team.createdBy === currentUser.userId

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
                        {aiLoading ? 'Analysing...' : <><Sparkles size={18} /> AI Summary</>}
                    </button>
                    {isOwner && (
                        <button className="settings-icon-btn" onClick={() => navigate(`/team/${teamId}/settings`)}>
                            <Settings size={22} />
                        </button>
                    )}
                </div>
            </header>

            <div className="team-main-grid">
                <section className="discussion-box">
                    <div className="box-header">
                        <MessageSquare size={20} /> <h2>Live Discussion</h2>
                    </div>
                    
                    <div className="chat-messages">
                        {team.discussions?.map((msg, index) => {
                            const isOwnMsg = msg.user === currentUser.userId;
                            const displayName = msg.userName || "User"; 
                            
                            return (
                                <div key={index} className={`msg-container ${isOwnMsg ? 'own-container' : ''}`}>
                                    <img 
                                        src={`https://ui-avatars.com/api/?name=${displayName}&background=random&color=fff&size=32`} 
                                        alt="avatar" 
                                        className="chat-avatar"
                                    />
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
                </section>

                <aside className="team-sidebar">
                    {summary && (
                        <motion.div className="summary-card" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                            <h3><Bot size={18} /> Briefing</h3>
                            <p>{summary}</p>
                        </motion.div>
                    )}

                    <div className="sidebar-card">
                        <div className="card-header">
                            <UsersIcon size={18} /> <h3>Members ({team.members?.length || 0})</h3>
                        </div>
                        <div className="member-list">
                            {team.members?.map((member, index) => (
                                <div key={index} className="member-item">
                                    <div className="member-avatar">
                                        <User size={14} />
                                    </div>
                                    <div className="member-info">
                                        <p>{member.user?.name || 'Team Member'}</p>
                                        <span className="member-role">
                                            {member.role === 'owner' ? <><Crown size={10} /> Owner</> : member.role}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar-card">
                        <div className="card-header">
                            <CheckCircle2 size={18} /> <h3>Active Tasks</h3>
                        </div>
                        <div className="task-content">
                            <p className="empty-text">Check the task board for updates.</p>
                            <button className="full-board-btn" onClick={() => navigate('/tasks')}>
                                Open Board
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </motion.div>
    )
}

export default TeamDetails