"use client"

import { useState } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import ArrendatarioIcon from "./ArrendatarioIcon"

const Layout = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Iconos SVG futuristas
  const icons = {
    dashboard: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    apartamentos: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    arrendatarios: <ArrendatarioIcon className="w-5 h-5" />,
    contratos: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    pagos: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    ayuda: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  const userNavItems = [
    { path: "/dashboard", label: "Inicio", icon: icons.dashboard, color: "from-cyan-500 to-blue-500" },
    { path: "/apartamentos", label: "Apartamentos", icon: icons.apartamentos, color: "from-blue-500 to-blue-600" },
    { path: "/arrendatarios", label: "Arrendatarios", icon: icons.arrendatarios, color: "from-fuchsia-500 to-cyan-500" },
    { path: "/contratos", label: "Contratos", icon: icons.contratos, color: "from-amber-500 to-yellow-500" },
    { path: "/pagos", label: "Pagos", icon: icons.pagos, color: "from-emerald-500 to-teal-500" },
    { path: "/ayuda", label: "Ayuda", icon: icons.ayuda, color: "from-violet-500 to-indigo-500" },
  ]

  const navItems = userNavItems

  const currentNav = navItems.find(item => item.path === location.pathname)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/80 border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
          <div className="flex justify-between items-center h-16 overflow-visible">
            {/* Logo */}
            <div className="flex-shrink-0 overflow-visible">
              <div className="logo-wrapper">
                <h1 className="brand-text"><span className="accent-m">M</span>y<span className="light-text">Rentta</span></h1>
                <p className="brand-sub">in safe hands</p>
              </div>
            </div>

            {/* User section - Desktop */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-sm">
                  {user?.full_name?.charAt(0) || "U"}
                </div>
                <span className="text-sm text-gray-300 font-medium">{user?.full_name || "Usuario"}</span>
              </div>
              <button
                onClick={logout}
                className="group px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-xl text-sm font-medium
                         shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Salir
                </span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation - Desktop */}
      <nav className="hidden sm:block sticky top-16 z-40 bg-gray-800/50 border-b border-gray-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
          <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide">
            {navItems.map(({ path, label, icon, color }) => {
              const isActive = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  className={`relative group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${isActive
                      ? `bg-gradient-to-r ${color} text-white shadow-lg`
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                    }`}
                >
                  <span className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                    {icon}
                  </span>
                  <span>{label}</span>
{isActive && (
                     <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                   )}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-xl">
          <div className="flex flex-col h-full">
            {/* Mobile header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
              <h2 className="text-lg font-bold text-white">Menú</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile nav items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {navItems.map(({ path, label, icon, color }) => {
                const isActive = location.pathname === path
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-4 p-3.5 rounded-2xl border transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-r ${color} text-white shadow-lg border-white/10`
                        : "text-gray-200 bg-gray-800/60 border-gray-700/50 hover:bg-gray-700/60 hover:border-gray-600/60"
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 ${
                        isActive
                          ? "bg-white/20 text-white border border-white/25 shadow-inner"
                          : `bg-gradient-to-br ${color} text-white shadow-md border border-white/10`
                      }`}
                    >
                      <span className="w-5 h-5 [&>svg]:w-5 [&>svg]:h-5">{icon}</span>
                    </span>
                    <span className="text-base font-medium flex-1">{label}</span>
                    {isActive ? (
                      <svg className="w-5 h-5 flex-shrink-0 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    ) : (
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 bg-gradient-to-br ${color} opacity-80`} aria-hidden />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Mobile user section */}
            <div className="p-4 border-t border-gray-700/50 space-y-3">
              <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-xl">
                  {user?.full_name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-white font-medium">{user?.full_name || "Usuario"}</p>
                  <p className="text-gray-400 text-sm">Arrendador</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout()
                  setMobileMenuOpen(false)
                }}
                className="w-full p-4 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-2xl font-medium
                         shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="min-h-[calc(100vh-8rem)]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700/30 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-gray-500 text-xs">
            <p>© 2026 Sistema de Administración de Apartamentos</p>
            <p className="flex items-center gap-1">
              Desarrollado con <span className="text-red-400">❤️</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
