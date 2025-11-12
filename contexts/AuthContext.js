'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { getSession, clearSession, loginUser, registerUser } from '@/lib/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const session = getSession()
    if (session) {
      setUser(session)
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    try {
      const userData = await loginUser(credentials)
      setUser(userData)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    try {
      const newUser = await registerUser(userData)
      setUser({ id: newUser.id, username: newUser.username, email: newUser.email })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

