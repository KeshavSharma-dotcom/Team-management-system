import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, CheckSquare, Plus, BrainCircuit, ListTodo } from 'lucide-react'
import './Tasks.css'

const Tasks = () => {
    const [goal, setGoal] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(false)
    const token = localStorage.getItem('token')

    const getAiSuggestions = async () => {
    if (!goal) return alert("Please enter a project goal first!");
    setLoading(true);
    setSuggestions([]); 

    try {
        const response = await fetch('http://localhost:5000/api/v1/tasks/ai-suggest', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ goal })
        });

        const data = await response.json();

        if (response.ok) {
            if (data.suggestions && Array.isArray(data.suggestions)) {
                setSuggestions(data.suggestions);
            } else {
                console.error("AI returned unexpected format:", data);
                alert("AI had trouble formatting the tasks. Try again!");
            }
        } else {
            alert(data.msg || "AI is currently busy");
        }
    } catch (err) {
        console.error("Fetch error:", err);
        alert("Failed to connect to the AI service");
    } finally {
        setLoading(false);
    }
};
    return (
        <motion.div 
            className="tasks-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <header className="tasks-header">
                <ListTodo size={32} className="header-icon" />
                <h1>Task <span>Generator</span></h1>
                <p>Use Gemini AI to break down your big goals into actionable steps.</p>
            </header>

            <div className="ai-input-section">
                <div className="ai-input-wrapper">
                    <BrainCircuit className="brain-icon" />
                    <input 
                        type="text" 
                        placeholder="What are you trying to achieve? (e.g. Build a login system)" 
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                    />
                    <button onClick={getAiSuggestions} disabled={loading}>
                        {loading ? 'Thinking...' : <><Sparkles size={18} /> Suggest Tasks</>}
                    </button>
                </div>
            </div>

            <div className="suggestions-grid">
                {suggestions.map((task, index) => (
                    <motion.div 
                        key={index} 
                        className="suggestion-card"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="card-top">
                            <CheckSquare size={20} />
                            <span className="ai-badge">AI Generated</span>
                        </div>
                        <h3>{task.title}</h3>
                        <p>{task.description}</p>
                        <button className="add-task-btn">
                            <Plus size={16} /> Add to Project
                        </button>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}

export default Tasks