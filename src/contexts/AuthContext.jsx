import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('smartfarm_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('smartfarm_token')
    if (token) {
      authAPI.me()
        .then(res => {
          setUser(res.data.user)
          localStorage.setItem('smartfarm_user', JSON.stringify(res.data.user))
        })
        .catch(() => {
          localStorage.removeItem('smartfarm_token')
          localStorage.removeItem('smartfarm_user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    const { token, user } = res.data
    localStorage.setItem('smartfarm_token', token)
    localStorage.setItem('smartfarm_user', JSON.stringify(user))
    setUser(user)
    return user
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } finally {
      localStorage.removeItem('smartfarm_token')
      localStorage.removeItem('smartfarm_user')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
