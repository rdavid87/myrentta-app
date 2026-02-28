"use client"

import { useState, useEffect } from "react"
import api from "../services/api"

const Arrendatarios = () => {
  const [arrendatarios, setArrendatarios] = useState([])
  const [apartamentos, setApartamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    nombre_completo: "",
    documento_identidad: "",
    telefono: "",
    email: "",
  })

  useEffect(() => {
    fetchArrendatarios()
    fetchApartamentos()
  }, [])

  const fetchArrendatarios = async () => {
    try {
      const { data } = await api.get("/arrendatarios")
      setArrendatarios(data || [])
    } catch (error) {
      console.error("Error fetching arrendatarios:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApartamentos = async () => {
    try {
      const { data } = await api.get("/apartamentos")
      setApartamentos(data || [])
    } catch (error) {
      console.error("Error fetching apartamentos:", error)
    }
  }

  // Filtrar arrendatarios por nombre, documento o email
  const filteredArrendatarios = arrendatarios.filter(arr => 
    arr.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    arr.documento_identidad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    arr.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    arr.telefono?.includes(searchTerm)
  )

  // Obtener nombre del apartamento por ID (solo para visualización)
  const getApartamentoNombre = (apartamentoId) => {
    if (!apartamentoId) return null
    const apt = apartamentos.find(a => a.id === apartamentoId)
    return apt ? apt.numero : null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`/arrendatarios/${editingId}`, formData)
      } else {
        await api.post("/arrendatarios", formData)
      }
      
      closeModal()
      fetchArrendatarios()
    } catch (error) {
      console.error("Error saving arrendatario:", error)
      alert("Error al guardar arrendatario: " + (error.response?.data?.error || error.message))
    }
  }

  const handleEdit = (arrendatario) => {
    setEditingId(arrendatario.id)
    setFormData({
      nombre_completo: arrendatario.nombre_completo,
      documento_identidad: arrendatario.documento_identidad,
      telefono: arrendatario.telefono,
      email: arrendatario.email,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este arrendatario?")) {
      try {
        await api.delete(`/arrendatarios/${id}`)
        fetchArrendatarios()
      } catch (error) {
        console.error("Error deleting arrendatario:", error)
        alert("Error al eliminar: " + (error.response?.data?.error || error.message))
      }
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({
      nombre_completo: "",
      documento_identidad: "",
      telefono: "",
      email: "",
    })
  }

  const openNewModal = () => {
    setEditingId(null)
    setFormData({
      nombre_completo: "",
      documento_identidad: "",
      telefono: "",
      email: "",
    })
    setShowModal(true)
  }

  // Obtener iniciales del nombre
  const getInitials = (name) => {
    if (!name) return "?"
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl blur-xl opacity-20"></div>
          <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 sm:p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  👥 Arrendatarios
                </h1>
                <p className="text-sm sm:text-base text-gray-400">Gestiona la información de tus inquilinos</p>
              </div>
              <button
                onClick={openNewModal}
                className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl
                         font-semibold shadow-lg hover:shadow-violet-500/50 transition-all duration-300
                         hover:scale-105 active:scale-95 overflow-hidden text-sm sm:text-base"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 opacity-0 
                              group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Nuevo Arrendatario
                </span>
              </button>
            </div>

            {/* Barra de búsqueda */}
            <div className="mt-4 sm:mt-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre, documento, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 
                           transition-all duration-300"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {searchTerm && (
                <p className="mt-2 text-sm text-gray-400">
                  {filteredArrendatarios.length} resultado(s) encontrado(s)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Tabla Desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 border-b border-gray-700">
                <tr>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-violet-300 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-violet-300 uppercase tracking-wider">Documento</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-violet-300 uppercase tracking-wider">Teléfono</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-violet-300 uppercase tracking-wider">Email</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-violet-300 uppercase tracking-wider">Apartamento</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-violet-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredArrendatarios.map((arr) => (
                  <tr key={arr.id} className="hover:bg-violet-500/5 transition-colors duration-200">
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {getInitials(arr.nombre_completo)}
                        </div>
                        <span className="font-medium text-gray-200">{arr.nombre_completo}</span>
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <span className="px-2 py-1 bg-gray-700/50 rounded text-gray-300 text-sm font-mono">
                        {arr.documento_identidad}
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <a href={`tel:${arr.telefono}`} className="text-violet-300 hover:text-violet-200 transition-colors flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {arr.telefono}
                      </a>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <a href={`mailto:${arr.email}`} className="text-purple-300 hover:text-purple-200 transition-colors text-sm truncate max-w-[200px] block">
                        {arr.email}
                      </a>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      {getApartamentoNombre(arr.apartamento_id) ? (
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
                          🏠 {getApartamentoNombre(arr.apartamento_id)}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-600/30 text-gray-400 border border-gray-600/30 rounded-full text-xs">
                          Sin asignar
                        </span>
                      )}
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(arr)}
                          className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg
                                   font-medium shadow-lg hover:shadow-violet-500/50 transition-all duration-300
                                   hover:scale-105 active:scale-95 text-xs"
                        >
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(arr.id)}
                          className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg
                                   font-medium shadow-lg hover:shadow-red-500/50 transition-all duration-300
                                   hover:scale-105 active:scale-95 text-xs"
                        >
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredArrendatarios.length === 0 && (
              <div className="px-6 py-16 text-center">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-gray-400 text-lg">
                  {searchTerm ? "No se encontraron arrendatarios" : "No hay arrendatarios registrados"}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {searchTerm ? "Intenta con otro término de búsqueda" : "Agrega tu primer arrendatario para comenzar"}
                </p>
              </div>
            )}
          </div>

          {/* Cards Mobile */}
          <div className="lg:hidden p-4 space-y-4">
            {filteredArrendatarios.map((arr) => (
              <div 
                key={arr.id}
                className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-4
                         hover:border-violet-500/50 transition-all duration-300"
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {getInitials(arr.nombre_completo)}
                  </div>
                  
                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-white font-semibold text-lg truncate">{arr.nombre_completo}</h3>
                      {getApartamentoNombre(arr.apartamento_id) ? (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold flex-shrink-0">
                          🏠 {getApartamentoNombre(arr.apartamento_id)}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-600/30 text-gray-400 rounded-full text-xs flex-shrink-0">
                          Sin asignar
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1.5 text-sm">
                      <p className="text-gray-400 font-mono">
                        🪪 {arr.documento_identidad}
                      </p>
                      <a href={`tel:${arr.telefono}`} className="text-violet-300 hover:text-violet-200 flex items-center gap-1">
                        📞 {arr.telefono}
                      </a>
                      <a href={`mailto:${arr.email}`} className="text-purple-300 hover:text-purple-200 truncate block">
                        ✉️ {arr.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-600/50">
                  <button
                    onClick={() => handleEdit(arr)}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg
                             font-medium shadow-lg hover:shadow-violet-500/50 transition-all duration-300
                             active:scale-95 text-sm"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </span>
                  </button>
                  <button
                    onClick={() => handleDelete(arr.id)}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg
                             font-medium shadow-lg hover:shadow-red-500/50 transition-all duration-300
                             active:scale-95 text-sm"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </span>
                  </button>
                </div>
              </div>
            ))}

            {filteredArrendatarios.length === 0 && (
              <div className="py-16 text-center">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-gray-400 text-lg">
                  {searchTerm ? "No se encontraron arrendatarios" : "No hay arrendatarios registrados"}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {searchTerm ? "Intenta con otro término de búsqueda" : "Agrega tu primer arrendatario para comenzar"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-violet-400">{arrendatarios.length}</p>
            <p className="text-xs sm:text-sm text-gray-400">Total</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-emerald-400">
              {arrendatarios.filter(a => a.apartamento_id).length}
            </p>
            <p className="text-xs sm:text-sm text-gray-400">Con Apartamento</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-amber-400">
              {arrendatarios.filter(a => !a.apartamento_id).length}
            </p>
            <p className="text-xs sm:text-sm text-gray-400">Sin Asignar</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-purple-400">
              {arrendatarios.filter(a => a.email).length}
            </p>
            <p className="text-xs sm:text-sm text-gray-400">Con Email</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-lg w-full 
                        border border-gray-700/50 overflow-hidden my-8">
            <div className="relative bg-gradient-to-r from-violet-600/20 to-purple-600/20 border-b border-gray-700/50 p-4 sm:p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 opacity-10"></div>
              <h2 className="relative text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">{editingId ? "✏️" : "👤"}</span>
                <span className="leading-tight">{editingId ? "Editar Arrendatario" : "Nuevo Arrendatario"}</span>
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  👤 Nombre Completo
                </label>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez García"
                  value={formData.nombre_completo}
                  onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 
                           transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  🪪 Documento de Identidad
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1234567890"
                  value={formData.documento_identidad}
                  onChange={(e) => setFormData({ ...formData, documento_identidad: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 
                           transition-all duration-300"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    📞 Teléfono
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej: 3001234567"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 
                             transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    ✉️ Email
                  </label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 
                             transition-all duration-300"
                    required
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl
                           font-semibold shadow-lg hover:shadow-violet-500/50 transition-all duration-300
                           hover:scale-105 active:scale-95 text-sm sm:text-base"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {editingId ? "Actualizar" : "Guardar"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold
                           transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancelar
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Arrendatarios
