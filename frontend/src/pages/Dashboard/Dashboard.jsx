import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Users, ArrowRight, LayoutGrid, Activity } from 'lucide-react'
import './Dashboard.css'

import { apiCall } from '../../utils/api'

const Dashboard = () => {
    const [teams, setTeams] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    
    const user = JSON.parse(localStorage.getItem('user')) || { name: 'User' }

    useEffect(() => {
        fetchTeams()
    }, [])

    const fetchTeams = async () => {
        try {
            const data = await apiCall('/teams/my-teams')
            setTeams(data.teams)
        } catch (error) {
            console.error('Error fetching teams:', error)
        } finally {
            setLoading(false)
        }
    };

    const filteredTeams = teams.filter(team => 
        team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.teamCode.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const myManagedTeams = filteredTeams.filter(team => {
        const member = team.members?.find(m => m.user._id === user.userId || m.user === user.userId);
        return member && (member.role === 'owner' || member.role === 'sub-admin');
    });

    const myJoinedTeams = filteredTeams.filter(team => {
        const member = team.members?.find(m => m.user._id === user.userId || m.user === user.userId);
        return !member || member.role === 'member'; // fallback to member if not explicitly found
    });

    const renderTeamCard = (team, role) => (
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
                <div style={{display: 'flex', gap: '8px'}}>
                    <span className="role-tag" style={{fontSize: '0.65rem', padding: '2px 8px', marginTop: 0}}>
                        {role}
                    </span>
                    <span className={`status-tag ${team.status}`}>
                        {team.status}
                    </span>
                </div>
            </div>
            <h3>{team.teamName}</h3>
            <p>Code: <code>{team.teamCode}</code></p>
            <div className="team-card-footer">
                <span>{team.members?.length || 0} Members</span>
                <ArrowRight size={16} />
            </div>
        </motion.div>
    );

    return (
        <motion.div 
            className="dashboard-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <header className="dashboard-header">
                <div className="welcome-text">
                    <h1>Welcome, <span>{user.name?.split(' ')[0]}!</span></h1>
                    <p>You are part of <strong>{teams.length}</strong> active teams.</p>
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

            <section className="teams-section">
                <div className="section-title">
                    <div className="title-left">
                        <LayoutGrid size={20} />
                        <h2>Your Teams</h2>
                    </div>
                    <div className="search-filter">
                        <input 
                            type="text" 
                            placeholder="Search teams..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="loader-container">
                        <div className="loader"></div>
                    </div>
                ) : filteredTeams.length > 0 ? (
                    <>
                        {myManagedTeams.length > 0 && (
                            <div style={{marginBottom: '40px'}}>
                                <h3 style={{color: '#94a3b8', fontSize: '1rem', marginBottom: '15px'}}>Teams You Manage</h3>
                                <div className="teams-grid">
                                    {myManagedTeams.map(team => renderTeamCard(team, team.createdBy === user.userId ? 'Owner' : 'Sub-Admin'))}
                                </div>
                            </div>
                        )}
                        
                        {myJoinedTeams.length > 0 && (
                            <div>
                                <h3 style={{color: '#94a3b8', fontSize: '1rem', marginBottom: '15px'}}>Joined Teams</h3>
                                <div className="teams-grid">
                                    {myJoinedTeams.map(team => renderTeamCard(team, 'Member'))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state">
                        <p>No teams found.</p>
                        <button onClick={() => navigate('/community')}>Explore Community</button>
                    </div>
                )}
            </section>
        </motion.div>
    )
}

export default Dashboard