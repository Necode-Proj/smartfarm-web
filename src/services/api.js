import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
})

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartfarm_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('smartfarm_token')
      localStorage.removeItem('smartfarm_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
}

// ─── Blocks ───────────────────────────────────────────────────────────────────
export const blocksAPI = {
  getAll: () => api.get('/blocks'),
  getOne: (id) => api.get(`/blocks/${id}`),
  getReadings: (id, params) => api.get(`/blocks/${id}/readings`, { params }),
}

// ─── Watering ─────────────────────────────────────────────────────────────────
export const wateringAPI = {
  trigger: (blockId, note = '') => api.post(`/blocks/${blockId}/water`, { note }),
  getLogs: (params) => api.get('/watering-logs', { params }),
}

export default api
