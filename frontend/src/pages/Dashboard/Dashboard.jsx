import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Users, ArrowRight, LayoutGrid, Activity } from 'lucide-react'
import './Dashboard.css'

const Dashboard = () => {
    const [teams, setTeams] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    
    const user = JSON.parse(localStorage.getItem('user')) || { name: 'User' }

    useEffect(() => {
        fetchTeams()
    }, [])

    const fetchTeams = async () => {
        const token = localStorage.getItem('token')
        try {
            const response = await fetch('http://localhost:5000/api/v1/teams/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.status === 401) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                navigate('/login')
                return
            }

            const data = await response.json()
            if (response.ok) {
                setTeams(data.teams)
            }
        } catch (error) {
            console.error('Error fetching teams:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div 
            className="dashboard-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <header className="dashboard-header">
                <div className="welcome-text">
                    <h1>Welcome back, <span>{user.name.split(' ')[0]}!</span></h1>
                    <p>Here's what's happening with your teams today.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => navigate('/join-team')}>
                        Join Team
                    </button>
                    <button className="btn-primary" onClick={() => navigate('/create-team')}>
                        <Plus size={18} /> Create Team
                    </button>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon"><Users size={20} /></div>
                    <div className="stat-info">
                        <h3>{teams.length}</h3>
                        <p>Active Teams</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><Activity size={20} /></div>
                    <div className="stat-info">
                        <h3>{user.role}</h3>
                        <p>Global Role</p>
                    </div>
                </div>
            </div>

            <section className="teams-section">
                <div className="section-title">
                    <LayoutGrid size={20} />
                    <h2>Your Teams</h2>
                </div>

                {loading ? (
                    <div className="loader-container">
                        <div className="loader"></div>
                    </div>
                ) : teams.length > 0 ? (
                    <div className="teams-grid">
                        {teams.map((team) => (
                            <motion.div 
                                key={team._id} 
                                className="team-card"
                                whileHover={{ y: -5 }}
                                onClick={() => navigate(`/team/${team._id}`)}
                            >
                                <div className="team-card-header">
                                    <div className="team-avatar">
                                        {team.teamName.charAt(0)}
                                    </div>
                                    <span className={`status-tag ${team.status}`}>
                                        {team.status}
                                    </span>
                                </div>
                                <h3>{team.teamName}</h3>
                                <p>Code: <code>{team.teamCode}</code></p>
                                <div className="team-card-footer">
                                    <span>{team.members?.length || 0} Members</span>
                                    <ArrowRight size={16} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>You haven't joined any teams yet.</p>
                        <button onClick={() => navigate('/teams')}>Explore Teams</button>
                    </div>
                )}
            </section>
        </motion.div>
    )
}

export default Dashboard