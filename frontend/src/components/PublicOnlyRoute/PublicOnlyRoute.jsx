import { Navigate } from 'react-router-dom'
import { getSession } from '../../utils/session'

const PublicOnlyRoute = ({ children }) => {
    const session = getSession()
    if (session && session.token) {
        return <Navigate to="/dashboard" replace />
    }
    return children
}

export default PublicOnlyRoute