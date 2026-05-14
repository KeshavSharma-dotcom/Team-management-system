const USER_KEY = 'user'
const TOKEN_KEY = 'token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const getStoredUser = (fallback = null) => {
    const rawUser = localStorage.getItem(USER_KEY)
    if (!rawUser) return fallback

    try {
        return JSON.parse(rawUser)
    } catch {
        localStorage.removeItem(USER_KEY)
        return fallback
    }
}

export const setSession = ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
}
