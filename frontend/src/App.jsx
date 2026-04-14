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

                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } 
                    />
                    
                    <Route path="*" element={<div className="temp-page">404 - Not Found</div>} />
                </Routes>
            </AnimatePresence>
        </>
    )
}

export default App