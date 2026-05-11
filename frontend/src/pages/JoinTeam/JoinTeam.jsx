import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Users, ArrowRight, Sparkles, CheckCircle, Clock, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import './JoinTeam.css'
import { apiCall } from '../../utils/api'

const JoinTeam = () => {
    const [allTeams, setAllTeams] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [requestedTeams, setRequestedTeams] = useState(new Set())
    const navigate = useNavigate()

    useEffect(() => {
        fetchPublicTeams()
    }, [])

    const fetchPublicTeams = async () => {
        try {
            const data = await apiCall('/teams/all')
            setAllTeams(data.teams)
        } catch (error) {
            console.error('Fetch error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRequest = async (team) => {
        if (requestedTeams.has(team._id)) return

        if (team.status === 'public') {
            // Public team: direct join with team code
            try {
                const data = await apiCall('/teams/join', {
                    method: 'POST',
                    body: JSON.stringify({ teamCode: team.teamCode })
                })
                toast.success(data.msg || 'Joined team!')
                navigate('/dashboard')
            } catch (error) {
                toast.error(error.message || 'Failed to join')
            }
        } else {
            // Private team: send a join request
            try {
                const data = await apiCall(`/teams/${team._id}/request-join`, { method: 'POST' })
                toast.success(data.msg)
                setRequestedTeams(prev => new Set([...prev, team._id]))
            } catch (error) {
                toast.error(error.message || 'Failed to send request')
            }
        }
    }

    const filteredTeams = allTeams.filter(team =>
        team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.teamCode.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <motion.div 
            className="join-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="join-header">
                <Sparkles className="sparkle-icon" size={32} />
                <h1>Discover <span>Teams</span></h1>
                <p>Join public communities or send a request to private squads.</p>
                
                <div className="search-container">
                    <Search size={20} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search for a team, topic, or code..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {searchTerm === '' && allTeams.length > 0 && (
                <div className="recommendations">
                    <div className="section-label">
                        <Sparkles size={16} /> Recommended for you
                    </div>
                    <div className="recommendation-grid">
                        {allTeams.slice(0, 2).map(team => (
                            <motion.div 
                                key={team._id} 
                                className="recommend-card"
                                onClick={() => handleRequest(team)}
                                whileHover={{ y: -5 }}
                            >
                                <div className="recommend-info">
                                    <h4>{team.teamName}</h4>
                                    <span>#{team.teamCode}</span>
                                </div>
                                <ArrowRight size={20} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {loading ? (
                <div className="loader"></div>
            ) : (
                <div className="join-grid">
                    {filteredTeams.map(team => {
                        const isPending = requestedTeams.has(team._id)
                        const isPrivate = team.status === 'private'

                        return (
                            <motion.div 
                                key={team._id} 
                                className={`join-card ${isPrivate ? 'private-team' : ''}`}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="card-top">
                                    <div className="team-type-badge">
                                        {isPrivate ? <Lock size={14} /> : <Users size={14} />}
                                        <span>{isPrivate ? 'Private' : 'Public'}</span>
                                    </div>
                                    <span className="member-count">{team.members.length} members</span>
                                </div>
                                <h3>{team.teamName}</h3>
                                <p className="team-code-badge">#{team.teamCode}</p>
                                
                                <button 
                                    className={`join-btn ${isPending ? 'pending' : ''} ${isPrivate ? 'request-btn' : ''}`}
                                    onClick={() => handleRequest(team)}
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <><Clock size={16} /> Request Sent</>
                                    ) : isPrivate ? (
                                        <><Lock size={16} /> Request to Join</>
                                    ) : (
                                        <>Join Team <ArrowRight size={16} /></>
                                    )}
                                </button>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            <div className="private-join-footer">
                <Lock size={18} />
                <p>Private teams require owner approval before you can join.</p>
            </div>
        </motion.div>
    )
}

export default JoinTeam