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
    const [adding, setAdding] = useState(null)
    const [addedTasks, setAddedTasks] = useState(new Set())

    useEffect(() => {
        fetchUserTeams()
    }, [])

    const fetchUserTeams = async () => {
        try {
            const data = await apiCall('/teams/my-teams')
            const teamList = data.teams || data
            setTeams(teamList)
            if (teamList.length > 0) setSelectedTeam(teamList[0]._id)
        } catch (err) {
            console.error(err)
        }
    }

    const getAiSuggestions = async () => {
        if (!goal.trim()) return toast.error('Please enter a project goal first!')
        setLoading(true)
        setSuggestions([])
        setAddedTasks(new Set())
        try {
            const data = await apiCall('/tasks/ai-suggest', {
                method: 'POST',
                body: JSON.stringify({ goal })
            })
            const taskList = data.suggestions || data
            if (Array.isArray(taskList)) {
                setSuggestions(taskList)
            } else {
                toast.error('Task suggestions returned an unexpected format. Try again.')
            }
        } catch (err) {
            toast.error(err.message || 'Failed to generate task suggestions')
        } finally {
            setLoading(false)
        }
    }

    const handleAddTask = async (task) => {
        if (!selectedTeam) return toast.error('Please select a team first!')
        setAdding(task.title)
        try {
            await apiCall('/tasks/create', {
                method: 'POST',
                body: JSON.stringify({ teamId: selectedTeam, title: task.title, description: task.description })
            })
            toast.success(`"${task.title}" added to project!`)
            setAddedTasks(prev => new Set([...prev, task.title]))
        } catch (err) {
            toast.error(err.message || 'Failed to add task')
        } finally {
            setAdding(null)
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
                        <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
                            {teams.length === 0
                                ? <option value="">No teams — join one first</option>
                                : teams.map(t => <option key={t._id} value={t._id}>{t.teamName}</option>)
                            }
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
                            onKeyDown={(e) => e.key === 'Enter' && getAiSuggestions()}
                        />
                    </div>
                    <button className="generate-btn" onClick={getAiSuggestions} disabled={loading}>
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
                            const isDone = addedTasks.has(task.title)
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
                                        onClick={() => !isDone && handleAddTask(task)}
                                        disabled={adding === task.title || isDone}
                                    >
                                        {isDone
                                            ? <><CheckCircle2 size={15} /> Added</>
                                            : adding === task.title
                                                ? 'Adding...'
                                                : <><Plus size={15} /> Add to Project</>}
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
