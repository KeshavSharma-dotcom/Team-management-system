import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import NavBar from './components/Navbar/NavBar.jsx'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx'
import Home from './pages/home/Home.jsx'
import Register from './pages/Register/Register.jsx'
import Login from './pages/Login/Login.jsx'
import VerifyOTP from './pages/verifyOTP/verifyOTP.jsx'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword/ResetPassword.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import CreateTeam from './pages/CreateTeam/CreateTeam.jsx'
import JoinTeam from './pages/JoinTeam/JoinTeam.jsx'
import TeamDetails from './pages/TeamDetails/TeamDetails.jsx'
import TeamSettings from './pages/TeamSettings/TeamSettings.jsx'
import Tasks from './pages/Tasks/Tasks.jsx'
import Profile from './pages/Profile/Profile.jsx'
import MyTeams from './pages/MyTeams/MyTeams.jsx'

const App = () => {
    const location = useLocation()
    const authRoutes = ['/register', '/login', '/forgot-password', '/verify-otp', '/reset-password']
    const showNavBar = !authRoutes.includes(location.pathname)

    return (
        <>
            {showNavBar && <NavBar />}
            
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/verify-otp" element={<VerifyOTP />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/create-team" element={<ProtectedRoute><CreateTeam /></ProtectedRoute>} />
                    <Route path="/join-team" element={<ProtectedRoute><JoinTeam /></ProtectedRoute>} />
                    <Route path="/tasks" element={<ProtectedRoute><Tasks/></ProtectedRoute>} />
                    <Route path="/team/:teamId" element={<ProtectedRoute><TeamDetails/></ProtectedRoute>} />
                    <Route path="/team/:teamId/settings" element={<ProtectedRoute><TeamSettings/></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/myteams" element={<ProtectedRoute><MyTeams/></ProtectedRoute>} />

                    <Route path="*" element={<div className="temp-page">404 - Not Found</div>} />
                </Routes>
            </AnimatePresence>
        </>
    )
}

export default App