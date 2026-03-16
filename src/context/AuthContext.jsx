"use client"

import { createContext, useContext, useState, useEffect } from "react"
import api from "../services/api"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/auth/profile")
      setUser(data)
    } catch (error) {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (identifier, password) => {
    const { data } = await api.post("/auth/login", { identifier, password })
    setToken(data.token)
    setUser(data.usuario)
    localStorage.setItem("token", data.token)
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`
    return data.usuario
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    delete api.defaults.headers.common["Authorization"]
  }

  return <AuthContext.Provider value={{ user, token, login, logout, loading }}>{children}</AuthContext.Provider>
}
