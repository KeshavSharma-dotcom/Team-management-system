const SESSION_KEY = 'auth_session'

export const setSession = (data) => {
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(data))
    } catch (error) {
        console.error('Error saving session:', error)
    }
}

export const getSession = () => {
    try {
        const item = localStorage.getItem(SESSION_KEY)
        return item ? JSON.parse(item) : null
    } catch (error) {
        console.error('Error reading session:', error)
        return null
    }
}

export const clearSession = () => {
    try {
        localStorage.removeItem(SESSION_KEY)
    } catch (error) {
        console.error('Error clearing session:', error)
    }
}

export const getToken = () => {
    const session = getSession()
    return session?.token || null
}

export const getUser = () => {
    const session = getSession()
    return session?.user || null
}

// Alias so components expecting getStoredUser work seamlessly
export const getStoredUser = getUser;