import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    signup: (data: { name: string; email: string; password: string }) =>
        api.post('/auth/signup', data),
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

// Water API
export const waterAPI = {
    log: (amount: number) => api.post('/water/log', { amount }),
    getToday: () => api.get('/water/today'),
    getHistory: (days = 7) => api.get(`/water/history?days=${days}`),
    updateGoal: (goalAmount: number) => api.put('/water/goal', { goalAmount }),
};

// Friends API
export const friendsAPI = {
    getFriends: () => api.get('/friends'),
    searchUsers: (query: string) => api.get(`/friends/search?query=${query}`),
    sendRequest: (friendId: string) => api.post('/friends/request', { friendId }),
    getRequests: () => api.get('/friends/requests'),
    acceptRequest: (requestId: string) => api.post(`/friends/accept/${requestId}`),
    removeFriend: (friendId: string) => api.delete(`/friends/${friendId}`),
};

// Messages API
export const messagesAPI = {
    getMessages: (friendId: string, limit = 50) =>
        api.get(`/messages/${friendId}?limit=${limit}`),
    sendMessage: (friendId: string, content: string, isReminder = false) =>
        api.post(`/messages/${friendId}`, { content, isReminder }),
    sendReminder: (friendId: string, message?: string) =>
        api.post(`/messages/reminder/${friendId}`, { message }),
    getUnreadCount: () => api.get('/messages/unread/count'),
};

// Statistics API
export const statisticsAPI = {
    getDaily: (date?: string) => api.get(`/statistics/daily${date ? `?date=${date}` : ''}`),
    getWeekly: () => api.get('/statistics/weekly'),
    getMonthly: () => api.get('/statistics/monthly'),
    getStreak: () => api.get('/statistics/streak'),
    getHourly: () => api.get('/statistics/hourly'),
};

export default api;
