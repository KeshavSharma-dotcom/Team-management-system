import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Plus, Search, ArrowRight, ShieldCheck } from 'lucide-react'
import './MyTeams.css'

const MyTeams = () => {
    const [myTeams, setMyTeams] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    useEffect(() => {
        const fetchMyTeams = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/v1/teams/my-teams', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await response.json()
                if (response.ok) setMyTeams(data.teams)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchMyTeams()
    }, [token])

    return (
        <motion.div 
            className="my-teams-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <header className="page-header">
                <div className="title-area">
                    <h1>My <span>Squads</span></h1>
                    <p>Manage and access the teams you are currently leading or attending.</p>
                </div>
                <div className="action-area">
                    <button className="discover-btn" onClick={() => navigate('/join-team')}>
                        <Search size={18} /> Discover Teams
                    </button>
                    <button className="create-btn" onClick={() => navigate('/create-team')}>
                        <Plus size={18} /> Create New
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="loader"></div>
            ) : myTeams.length > 0 ? (
                <div className="my-teams-grid">
                    {myTeams.map((team) => (
                        <motion.div 
                            key={team._id} 
                            className="my-team-card"
                            whileHover={{ y: -5 }}
                            onClick={() => navigate(`/team/${team._id}`)}
                        >
                            <div className="card-top">
                                <div className="team-icon">
                                    {team.teamName.charAt(0)}
                                </div>
                                {team.createdBy === JSON.parse(localStorage.getItem('user')).userId && (
                                    <span className="owner-badge"><ShieldCheck size={12}/> Owner</span>
                                )}
                            </div>
                            <h3>{team.teamName}</h3>
                            <p className="team-code">Code: {team.teamCode}</p>
                            <div className="card-footer">
                                <span>{team.members?.length} Members</span>
                                <ArrowRight size={16} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="empty-teams">
                    <Users size={48} />
                    <h2>No Teams Found</h2>
                    <p>You haven't joined any teams yet. Start by creating one or exploring public squads.</p>
                    <button onClick={() => navigate('/join-team')}>Browse Public Teams</button>
                </div>
            )}
        </motion.div>
    )
}

export default MyTeams