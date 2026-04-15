import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Hash, Lock, Users, ArrowRight, Sparkles } from 'lucide-react'
import './JoinTeam.css'

const JoinTeam = () => {
    const [allTeams, setAllTeams] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchPublicTeams()
    }, [])

    const fetchPublicTeams = async () => {
        const token = localStorage.getItem('token')
        try {
            const response = await fetch('http://localhost:5000/api/v1/teams/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (response.ok) setAllTeams(data.teams)
        } catch (error) {
            console.error('Fetch error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleJoin = async (teamCode) => {
        const token = localStorage.getItem('token')
        try {
            const response = await fetch('http://localhost:5000/api/v1/teams/join', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ teamCode })
            })
            const data = await response.json()
            if (response.ok) {
                alert(data.msg)
                navigate('/dashboard')
            } else {
                alert(data.msg)
            }
        } catch (error) {
            alert('Error joining team')
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
                <h1>Find Your <span>Squad.</span></h1>
                <p>Browse public teams or enter a private code to collaborate.</p>
                
                <div className="search-container">
                    <Search size={20} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by name or #teamcode..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loader"></div>
            ) : (
                <div className="join-grid">
                    {filteredTeams.map(team => (
                        <motion.div 
                            key={team._id} 
                            className="join-card"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="card-top">
                                <Users size={24} />
                                <span className="member-count">{team.members.length} members</span>
                            </div>
                            <h3>{team.teamName}</h3>
                            <p className="team-code-badge">#{team.teamCode}</p>
                            
                            <button 
                                className="join-btn"
                                onClick={() => handleJoin(team.teamCode)}
                            >
                                Join Team <ArrowRight size={16} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            <div className="private-join-footer">
                <Sparkles size={18} />
                <p>Have a private passcode? Click a team to enter it.</p>
            </div>
        </motion.div>
    )
}

export default JoinTeam