import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Globe, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiCall } from '../../utils/api';
import './Community.css';

const Community = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPublicTeams();
    }, [page]);

    const fetchPublicTeams = async () => {
        setLoading(true);
        try {
            const data = await apiCall(`/teams/all?page=${page}&limit=12`);
            if (data.teams) {
                if (page === 1) setTeams(data.teams);
                else setTeams(prev => [...prev, ...data.teams]);
                
                if (data.teams.length < 12) setHasMore(false);
            }
        } catch (err) {
            console.error("Failed to fetch public teams:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (teamId) => {
        try {
            const data = await apiCall(`/teams/${teamId}/request-join`, { method: 'POST' });
            toast.success(data.message || "Join request sent!");
        } catch (err) {
            toast.error(err.message || "Failed to join team.");
        }
    };

    return (
        <motion.div 
            className="community-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="community-header">
                <h1><Globe size={32} style={{display: 'inline', verticalAlign: 'middle', marginRight: '10px'}}/> Community Teams</h1>
                <p>Discover and join public teams to collaborate and grow together.</p>
            </div>

            {teams.length === 0 && !loading ? (
                <div style={{textAlign: 'center', marginTop: '50px', color: '#94a3b8'}}>
                    <p>No public teams found.</p>
                </div>
            ) : (
                <div className="community-grid">
                    {teams.map((team, idx) => (
                        <motion.div 
                            key={team._id} 
                            className="community-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <div className="community-card-header">
                                <div className="community-avatar">
                                    {team.teamName.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <h3>{team.teamName}</h3>
                            <p>Created by {team.createdBy?.name || 'Unknown'}</p>
                            <div className="community-footer">
                                <div className="member-count">
                                    <Users size={16} /> {team.members?.length || 0} Members
                                </div>
                                <button className="btn-join" onClick={() => handleJoin(team._id)}>
                                    Join Team
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {loading && <div className="loader" style={{margin: '40px auto'}}></div>}

            {hasMore && !loading && teams.length > 0 && (
                <div className="pagination">
                    <button onClick={() => setPage(page + 1)}>Load More</button>
                </div>
            )}
        </motion.div>
    );
};

export default Community;
