const BASE_URL = 'http://localhost:5000/api/v1';

export const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        throw new Error(data.message || data.msg || 'Something went wrong');
    }

    // Handle both old shape { teams, msg } and new { success, data, message }
    if (data.data !== undefined) return data.data;
    return data;
};
