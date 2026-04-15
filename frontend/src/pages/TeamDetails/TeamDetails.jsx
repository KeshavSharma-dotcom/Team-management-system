import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
    MessageSquare, 
    CheckCircle2, 
    Sparkles, 
    Send, 
    Bot, 
    Clock, 
    Users as UsersIcon 
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
        } catch (err) {
            console.error(err)
        }
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

    return (
        <motion.div 
            className="team-details-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <header className="team-header">
                <div>
                    <h1>{team.teamName || 'Team Dashboard'}</h1>
                    <p className="team-meta"><UsersIcon size={14} /> {team.members?.length} Members</p>
                </div>
                <button className="ai-summary-btn" onClick={getAiSummary} disabled={aiLoading}>
                    {aiLoading ? 'Analyzing...' : <><Sparkles size={18} /> Summarize Chat</>}
                </button>
            </header>

            <div className="team-main-grid">
                <section className="discussion-box">
                    <div className="box-header">
                        <MessageSquare size={20} /> <h2>Team Discussion</h2>
                    </div>
                    
                    <div className="chat-messages">
                        {team.discussions?.map((msg, index) => (
                            <div key={index} className="msg-bubble">
                                <span className="msg-user">{msg.userName}</span>
                                <p>{msg.text}</p>
                            </div>
                        ))}
                    </div>

                    <form className="chat-input-area" onSubmit={handleSendMessage}>
                        <input 
                            type="text" 
                            placeholder="Type a message..." 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button type="submit"><Send size={18} /></button>
                    </form>
                </section>

                <aside className="insights-sidebar">
                    {summary && (
                        <motion.div 
                            className="summary-card"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            <h3><Bot size={18} /> AI Summary</h3>
                            <p>{summary}</p>
                        </motion.div>
                    )}

                    <div className="task-preview-card">
                        <div className="box-header">
                            <CheckCircle2 size={20} /> <h2>Quick Tasks</h2>
                        </div>
                        <p className="empty-text">No tasks assigned yet. Go to Task Board to add some!</p>
                        <button className="btn-secondary" onClick={() => navigate('/tasks')}>
                            View Full Board
                        </button>
                    </div>
                </aside>
            </div>
        </motion.div>
    )
}

export default TeamDetails