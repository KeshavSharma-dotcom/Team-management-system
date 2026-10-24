import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, CheckCircle2, Plus, BrainCircuit, ListTodo, Users, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import './Tasks.css'
import { apiCall } from '../../utils/api'

const Tasks = () => {
    const [goal, setGoal] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [teams, setTeams] = useState([])
    const [selectedTeam, setSelectedTeam] = useState('')
    const [loading, setLoading] = useState(false)
    const [addingIndex, setAddingIndex] = useState(null)
    const [addedIndices, setAddedIndices] = useState(new Set())

    useEffect(() => {
        let isMounted = true

        const fetchUserTeams = async () => {
            try {
                const data = await apiCall('/teams/my-teams')
                const teamList = data?.teams || data?.data?.teams || (Array.isArray(data) ? data : [])

                if (isMounted) {
                    setTeams(teamList)
                    if (teamList.length > 0) {
                        const firstTeamId = teamList[0]._id || teamList[0].id
                        setSelectedTeam(firstTeamId)
                    }
                }
            } catch (err) {
                if (isMounted) {
                    toast.error('Failed to load your teams')
                }
            }
        }

        fetchUserTeams()

        return () => {
            isMounted = false
        }
    }, [])

    const getAiSuggestions = async () => {
        if (!goal.trim()) return toast.error('Please enter a project goal first!')
        setLoading(true)
        setSuggestions([])
        setAddedIndices(new Set())

        try {
            const data = await apiCall('/tasks/ai-suggest', {
                method: 'POST',
                body: JSON.stringify({ goal: goal.trim() })
            })

            const taskList = data?.suggestions || data?.data?.suggestions || (Array.isArray(data) ? data : null)

            if (Array.isArray(taskList) && taskList.length > 0) {
                setSuggestions(taskList)
            } else {
                toast.error('No valid suggestions returned. Try rephrasing your goal.')
            }
        } catch (err) {
            toast.error(err.message || 'Failed to generate task suggestions')
        } finally {
            setLoading(false)
        }
    }

    const handleAddTask = async (task, index) => {
        if (!selectedTeam) return toast.error('Please select a team first!')
        setAddingIndex(index)

        try {
            await apiCall('/tasks/create', {
                method: 'POST',
                body: JSON.stringify({
                    teamId: selectedTeam,
                    title: task.title,
                    description: task.description
                })
            })

            toast.success(`"${task.title}" added to project!`)
            setAddedIndices(prev => new Set([...prev, index]))
        } catch (err) {
            toast.error(err.message || 'Failed to add task')
        } finally {
            setAddingIndex(null)
        }
    }

    return (
        <motion.div className="tasks-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="tasks-header">
                <div className="tasks-header-icon"><BrainCircuit size={28} /></div>
                <div>
                    <h1>Task <span>Suggestions</span></h1>
                    <p>Describe a project goal and generate a short task list for review.</p>
                </div>
            </header>

            <div className="ai-control-panel">
                <div className="panel-row">
                    <div className="team-select-wrapper">
                        <Users size={16} />
                        <select
                            value={selectedTeam}
                            onChange={(e) => setSelectedTeam(e.target.value)}
                            disabled={teams.length === 0}
                        >
                            {teams.length === 0 ? (
                                <option value="">No teams available — join or create one first</option>
                            ) : (
                                teams.map(t => {
                                    const teamId = t._id || t.id
                                    return (
                                        <option key={teamId} value={teamId}>
                                            {t.teamName || t.name}
                                        </option>
                                    )
                                })
                            )}
                        </select>
                    </div>
                </div>

                <div className="ai-input-row">
                    <div className="ai-input-wrapper">
                        <Sparkles size={18} className="spark-icon" />
                        <input
                            type="text"
                            placeholder="e.g. Build a user authentication system with JWT..."
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !loading && getAiSuggestions()}
                        />
                    </div>
                    <button className="generate-btn" onClick={getAiSuggestions} disabled={loading || !goal.trim()}>
                        {loading ? <span className="btn-loader-dark" /> : <><Zap size={16} /> Generate</>}
                    </button>
                </div>
            </div>

            {loading && (
                <div className="ai-thinking">
                    <div className="thinking-dots"><span /><span /><span /></div>
                    <p>Reviewing the project goal...</p>
                </div>
            )}

            {suggestions.length > 0 && (
                <div className="suggestions-section">
                    <div className="suggestions-header">
                        <ListTodo size={18} />
                        <h3>{suggestions.length} Suggested Tasks</h3>
                    </div>
                    <div className="suggestions-grid">
                        {suggestions.map((task, index) => {
                            const isDone = addedIndices.has(index)
                            const isAddingThis = addingIndex === index

                            return (
                                <motion.div
                                    key={index}
                                    className={`suggestion-card ${isDone ? 'added' : ''}`}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="card-number">{String(index + 1).padStart(2, '0')}</div>
                                    <h3>{task.title}</h3>
                                    <p>{task.description}</p>
                                    <button
                                        className={`add-task-btn ${isDone ? 'done' : ''}`}
                                        onClick={() => !isDone && handleAddTask(task, index)}
                                        disabled={isAddingThis || isDone || !selectedTeam}
                                    >
                                        {isDone ? (
                                            <><CheckCircle2 size={15} /> Added</>
                                        ) : isAddingThis ? (
                                            'Adding...'
                                        ) : (
                                            <><Plus size={15} /> Add to Project</>
                                        )}
                                    </button>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            )}
        </motion.div>
    )
}

export default Tasks