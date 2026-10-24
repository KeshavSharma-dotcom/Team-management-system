import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Plus, Search, ArrowRight, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import './MyTeams.css'

import { apiCall } from '../../utils/api'
import { getUser, getStoredUser } from '../../utils/session'

const MyTeams = () => {
    const [myTeams, setMyTeams] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    // Fallback for both session helper naming conventions
    const currentUser = (typeof getUser === 'function' ? getUser() : null) ||
        (typeof getStoredUser === 'function' ? getStoredUser() : null)

    const currentUserId = currentUser?.id || currentUser?.userId || currentUser?._id

    useEffect(() => {
        let isMounted = true

        const fetchMyTeams = async () => {
            try {
                const data = await apiCall('/teams/my-teams')
                if (isMounted) {
                    setMyTeams(data.teams || data || [])
                }
            } catch (err) {
                if (isMounted) {
                    toast.error(err.message || 'Failed to load your teams')
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchMyTeams()

        return () => {
            isMounted = false
        }
    }, [])

    const isOwner = (team) => {
        if (!currentUserId || !team?.createdBy) return false
        const creatorId = typeof team.createdBy === 'object' ? team.createdBy._id || team.createdBy.id : team.createdBy
        return String(creatorId) === String(currentUserId)
    }

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
                    {myTeams.map((team) => {
                        const displayName = team?.teamName || team?.name || 'Untitled Team'
                        const initialLetter = displayName.charAt(0).toUpperCase()
                        const memberCount = Array.isArray(team?.members) ? team.members.length : 0

                        return (
                            <motion.div
                                key={team._id || team.id}
                                className="my-team-card"
                                whileHover={{ y: -5 }}
                                onClick={() => navigate(`/team/${team._id || team.id}`)}
                            >
                                <div className="card-top">
                                    <div className="team-icon">
                                        {initialLetter}
                                    </div>
                                    {isOwner(team) && (
                                        <span className="owner-badge"><ShieldCheck size={12} /> Owner</span>
                                    )}
                                </div>
                                <h3>{displayName}</h3>
                                <p className="team-code">Code: {team?.teamCode || 'N/A'}</p>
                                <div className="card-footer">
                                    <span>{memberCount} {memberCount === 1 ? 'Member' : 'Members'}</span>
                                    <ArrowRight size={16} />
                                </div>
                            </motion.div>
                        )
                    })}
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