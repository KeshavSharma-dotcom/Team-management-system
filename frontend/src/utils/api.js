import { clearSession, getToken } from './session'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

const parseResponse = async (response) => {
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
        return response.json()
    }

    const text = await response.text()
    return text ? { message: text } : {}
}

export const apiCall = async (endpoint, options = {}) => {
    const token = getToken()

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    })

    const data = await parseResponse(response)

    if (!response.ok) {
        if (response.status === 401) {
            clearSession()
            window.location.href = '/login'
        }
        throw new Error(data.message || data.msg || 'Something went wrong')
    }

    if (data.data !== undefined) {
        if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
            return { ...data.data, message: data.message }
        }
        return data.data
    }

    return data
}
