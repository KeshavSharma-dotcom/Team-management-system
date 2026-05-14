import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
    AlertCircle,
    Briefcase,
    CheckCircle2,
    FileSearch,
    FileText,
    Loader2,
    Upload,
    XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { apiCall } from '../../utils/api'
import './ResumeChecker.css'

const ResumeChecker = () => {
    const [teams, setTeams] = useState([])
    const [selectedTeam, setSelectedTeam] = useState('')
    const [candidateName, setCandidateName] = useState('')
    const [requirements, setRequirements] = useState('')
    const [resumeText, setResumeText] = useState('')
    const [resumeFile, setResumeFile] = useState(null)
    const [jobId, setJobId] = useState('')
    const [analysis, setAnalysis] = useState(null)
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(false)
    const pollTimer = useRef(null)

    useEffect(() => {
        fetchTeams()
        fetchHistory()

        return () => {
            if (pollTimer.current) clearTimeout(pollTimer.current)
        }
    }, [])

    const fetchTeams = async () => {
        try {
            const data = await apiCall('/teams/my-teams')
            const teamList = data.teams || []
            setTeams(teamList)
            if (teamList.length > 0) setSelectedTeam(teamList[0]._id)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchHistory = async () => {
        try {
            const data = await apiCall('/resume/history?limit=5')
            setHistory(data.analyses || [])
        } catch (error) {
            console.error(error)
        }
    }

    const readPdfAsBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const result = String(reader.result || '')
            resolve(result.includes(',') ? result.split(',')[1] : result)
        }
        reader.onerror = () => reject(new Error('Unable to read PDF'))
        reader.readAsDataURL(file)
    })

    const pollAnalysis = async (id) => {
        try {
            const data = await apiCall(`/resume/${id}`)
            const nextAnalysis = data.analysis
            setAnalysis(nextAnalysis)

            if (nextAnalysis.status === 'processing') {
                pollTimer.current = setTimeout(() => pollAnalysis(id), 2000)
                return
            }

            setLoading(false)
            fetchHistory()

            if (nextAnalysis.status === 'completed') {
                toast.success('Resume analysis complete')
            } else {
                toast.error(nextAnalysis.error || 'Resume analysis failed')
            }
        } catch (error) {
            setLoading(false)
            toast.error(error.message || 'Unable to fetch analysis status')
        }
    }

    const handleFileChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (file.type !== 'application/pdf') {
            toast.error('Please upload a PDF resume')
            return
        }

        setResumeFile(file)
        setResumeText('')
    }

    const handleAnalyze = async (event) => {
        event.preventDefault()

        if (!requirements.trim()) return toast.error('Add project requirements first')
        if (!resumeFile && !resumeText.trim()) return toast.error('Upload a PDF or paste resume text')

        if (pollTimer.current) clearTimeout(pollTimer.current)
        setLoading(true)
        setAnalysis(null)
        setJobId('')

        try {
            const payload = {
                candidateName: candidateName.trim(),
                requirements: requirements.trim(),
                teamId: selectedTeam || undefined,
                fileName: resumeFile?.name || ''
            }

            if (resumeFile) {
                payload.pdfBase64 = await readPdfAsBase64(resumeFile)
            } else {
                payload.resumeText = resumeText.trim()
            }

            const data = await apiCall('/resume/analyze', {
                method: 'POST',
                body: JSON.stringify(payload)
            })

            setJobId(data.jobId)
            setAnalysis({ status: data.status, jobId: data.jobId })
            pollAnalysis(data.jobId)
        } catch (error) {
            setLoading(false)
            toast.error(error.message || 'Resume analysis failed')
        }
    }

    const completed = analysis?.status === 'completed'
    const failed = analysis?.status === 'failed'

    return (
        <motion.div className="resume-checker-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="resume-header">
                <div className="resume-title-block">
                    <div className="resume-icon">
                        <FileSearch size={28} />
                    </div>
                    <div>
                        <h1>Resume <span>Checker</span></h1>
                        <p>Compare candidate resumes with project requirements and review the gaps.</p>
                    </div>
                </div>
                {jobId && (
                    <div className={`job-status ${analysis?.status || 'processing'}`}>
                        {loading ? <Loader2 size={16} className="spin" /> : completed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        <span>{analysis?.status || 'processing'}</span>
                    </div>
                )}
            </header>

            <div className="resume-layout">
                <form className="resume-form-panel" onSubmit={handleAnalyze}>
                    <div className="form-row two-columns">
                        <label>
                            <span>Candidate</span>
                            <input
                                type="text"
                                value={candidateName}
                                onChange={(e) => setCandidateName(e.target.value)}
                                placeholder="Candidate name"
                            />
                        </label>
                        <label>
                            <span>Team Context</span>
                            <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
                                {teams.length === 0 ? (
                                    <option value="">No team selected</option>
                                ) : teams.map(team => (
                                    <option key={team._id} value={team._id}>{team.teamName}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label className="field-block">
                        <span>Project Requirements</span>
                        <textarea
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                            placeholder="Example: Need a React, Node.js, MongoDB developer with JWT auth, REST APIs, and deployment experience."
                            rows={6}
                        />
                    </label>

                    <div className="resume-source-grid">
                        <label className={`upload-box ${resumeFile ? 'has-file' : ''}`}>
                            <Upload size={24} />
                            <strong>{resumeFile ? resumeFile.name : 'Upload PDF Resume'}</strong>
                            <span>The file is submitted to an authenticated analysis job.</span>
                            <input type="file" accept="application/pdf" onChange={handleFileChange} />
                        </label>

                        <label className="field-block text-source">
                            <span>Or Paste Resume Text</span>
                            <textarea
                                value={resumeText}
                                onChange={(e) => {
                                    setResumeText(e.target.value)
                                    if (e.target.value.trim()) setResumeFile(null)
                                }}
                                placeholder="Paste resume text here when you do not have a PDF."
                                rows={8}
                            />
                        </label>
                    </div>

                    <button type="submit" className="analyze-btn" disabled={loading}>
                        {loading ? <><Loader2 size={17} className="spin" /> Processing</> : <><FileSearch size={17} /> Analyze Resume</>}
                    </button>
                </form>

                <aside className="resume-results-panel">
                    {!analysis && (
                        <div className="empty-result">
                            <FileText size={38} />
                            <h3>No analysis yet</h3>
                            <p>Submit a resume to see score, matched skills, missing skills, and interview recommendations.</p>
                        </div>
                    )}

                    {analysis?.status === 'processing' && (
                        <div className="processing-result">
                            <Loader2 size={42} className="spin" />
                            <h3>Analyzing resume</h3>
                            <p>The analysis job is processing the resume.</p>
                            <div className="progress-bar"><span /></div>
                        </div>
                    )}

                    {completed && (
                        <div className="analysis-result">
                            <div className="score-ring">
                                <strong>{analysis.score}</strong>
                                <span>/100</span>
                            </div>
                            <h3>{analysis.candidateName || 'Candidate'} Match</h3>
                            <p className="summary-text">{analysis.summary}</p>

                            <div className="skill-section">
                                <h4>Matched Skills</h4>
                                <div className="skill-list matched">
                                    {(analysis.matchedSkills || []).length > 0
                                        ? analysis.matchedSkills.map(skill => <span key={skill}>{skill}</span>)
                                        : <em>No mapped requirement skills matched.</em>}
                                </div>
                            </div>

                            <div className="skill-section">
                                <h4>Missing Skills</h4>
                                <div className="skill-list missing">
                                    {(analysis.missingSkills || []).length > 0
                                        ? analysis.missingSkills.map(skill => <span key={skill}>{skill}</span>)
                                        : <em>No mapped gaps found.</em>}
                                </div>
                            </div>

                            <div className="recommendations">
                                <h4>Recommendations</h4>
                                {(analysis.recommendations || []).map((item, index) => (
                                    <p key={`${item}-${index}`}><Briefcase size={14} /> {item}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {failed && (
                        <div className="failed-result">
                            <AlertCircle size={38} />
                            <h3>Analysis failed</h3>
                            <p>{analysis.error || 'The analysis service could not process this resume.'}</p>
                        </div>
                    )}

                    {history.length > 0 && (
                        <div className="history-list">
                            <h4>Recent Checks</h4>
                            {history.map(item => (
                                <button
                                    key={item.jobId}
                                    type="button"
                                    onClick={() => {
                                        setJobId(item.jobId)
                                        pollAnalysis(item.jobId)
                                    }}
                                >
                                    <span>{item.candidateName || item.fileName || 'Resume analysis'}</span>
                                    <strong>{item.status === 'completed' ? `${item.score}/100` : item.status}</strong>
                                </button>
                            ))}
                        </div>
                    )}
                </aside>
            </div>
        </motion.div>
    )
}

export default ResumeChecker
