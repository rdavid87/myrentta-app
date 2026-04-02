"use client"

import { useState, useEffect } from "react"
import api from "../services/api"

const Apartamentos = () => {
  const [apartamentos, setApartamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    numero: "",
    direccion: "",
    ciudad: "",
    valor_arriendo: "",
  })

  useEffect(() => {
    fetchApartamentos()
  }, [])

  const fetchApartamentos = async () => {
    try {
      const { data } = await api.get("/apartamentos")
      setApartamentos(data || [])
    } catch (error) {
      console.error("Error fetching apartamentos:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar apartamentos por nombre o ciudad
  const filteredApartamentos = apartamentos.filter(apt => 
    apt.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.ciudad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.direccion?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSend = {
        ...formData,
        valor_arriendo: parseFloat(formData.valor_arriendo.toString().replace(/\./g, "").replace(",", "."))
      }
      
      if (editingId) {
        await api.put(`/apartamentos/${editingId}`, dataToSend)
      } else {
        await api.post("/apartamentos", dataToSend)
      }
      
      closeModal()
      fetchApartamentos()
    } catch (error) {
      console.error("Error saving apartamento:", error)
      alert("Error al guardar apartamento: " + (error.response?.data?.error || error.message))
    }
  }

  const handleEdit = (apartamento) => {
    setEditingId(apartamento.id)
    setFormData({
      numero: apartamento.numero,
      direccion: apartamento.direccion,
      ciudad: apartamento.ciudad,
      valor_arriendo: apartamento.valor_arriendo.toString(),
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({ numero: "", direccion: "", ciudad: "", valor_arriendo: "" })
  }

  const openNewModal = () => {
    setEditingId(null)
    setFormData({ numero: "", direccion: "", ciudad: "", valor_arriendo: "" })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este apartamento?")) {
      try {
        await api.delete(`/apartamentos/${id}`)
        fetchApartamentos()
      } catch (error) {
        console.error("Error deleting apartamento:", error)
        alert("Error al eliminar: " + (error.response?.data?.error || error.message))
      }
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getEstadoBadge = (estado) => {
    return estado === "disponible" 
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl blur-xl opacity-20"></div>
          <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 sm:p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent mb-2">
                  🏢 Apartamentos
                </h1>
                <p className="text-sm sm:text-base text-gray-400">Gestiona tus propiedades de arriendo</p>
              </div>
              <button
                onClick={openNewModal}
                className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl
                         font-semibold shadow-lg hover:shadow-blue-500/50 transition-all duration-300
                         hover:scale-105 active:scale-95 overflow-hidden text-sm sm:text-base"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 
                              group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Nuevo Apartamento
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
                  placeholder="Buscar por nombre, ciudad o dirección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
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
                  {filteredApartamentos.length} resultado(s) encontrado(s)
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
              <thead className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-b border-gray-700">
                <tr>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider">Dirección</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider">Ciudad</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider">Valor Arriendo</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider">Estado</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-blue-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredApartamentos.map((apt) => (
                  <tr key={apt.id} className="hover:bg-blue-500/5 transition-colors duration-200">
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                          {apt.numero?.charAt(0)?.toUpperCase() || "A"}
                        </div>
                        <span className="font-medium text-gray-200">{apt.numero}</span>
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4 text-gray-300 text-sm">{apt.direccion}</td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <span className="px-2 py-1 bg-gray-700/50 rounded text-blue-300 text-sm">
                        📍 {apt.ciudad}
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4 text-blue-300 font-semibold">{formatCurrency(apt.valor_arriendo)}</td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoBadge(apt.estado)}`}>
                        {apt.estado === "disponible" ? "✅ Disponible" : "🏠 Arrendado"}
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(apt)}
                          className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg
                                   font-medium shadow-lg hover:shadow-blue-500/50 transition-all duration-300
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
                          onClick={() => handleDelete(apt.id)}
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

            {filteredApartamentos.length === 0 && (
              <div className="px-6 py-16 text-center">
                <div className="text-6xl mb-4">🏢</div>
                <p className="text-gray-400 text-lg">
                  {searchTerm ? "No se encontraron apartamentos" : "No hay apartamentos registrados"}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {searchTerm ? "Intenta con otro término de búsqueda" : "Agrega tu primer apartamento para comenzar"}
                </p>
              </div>
            )}
          </div>

          {/* Cards Mobile */}
          <div className="lg:hidden p-4 space-y-4">
            {filteredApartamentos.map((apt) => (
              <div 
                key={apt.id}
                className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-4
                         hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {apt.numero?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                  
                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-white font-semibold text-lg truncate">{apt.numero}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ${getEstadoBadge(apt.estado)}`}>
                        {apt.estado === "disponible" ? "Disponible" : "Arrendado"}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-400 truncate">📍 {apt.direccion}</p>
                      <p className="text-blue-300">🏙️ {apt.ciudad}</p>
                      <p className="text-blue-300 font-semibold text-base">{formatCurrency(apt.valor_arriendo)}/mes</p>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-600/50">
                  <button
                    onClick={() => handleEdit(apt)}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg
                             font-medium shadow-lg hover:shadow-blue-500/50 transition-all duration-300
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
                    onClick={() => handleDelete(apt.id)}
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

            {filteredApartamentos.length === 0 && (
              <div className="py-16 text-center">
                <div className="text-6xl mb-4">🏢</div>
                <p className="text-gray-400 text-lg">
                  {searchTerm ? "No se encontraron apartamentos" : "No hay apartamentos registrados"}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {searchTerm ? "Intenta con otro término de búsqueda" : "Agrega tu primer apartamento para comenzar"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-blue-400">{apartamentos.length}</p>
            <p className="text-xs sm:text-sm text-gray-400">Total</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-emerald-400">
              {apartamentos.filter(a => a.estado === "disponible").length}
            </p>
            <p className="text-xs sm:text-sm text-gray-400">Disponibles</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-amber-400">
              {apartamentos.filter(a => a.estado !== "disponible").length}
            </p>
            <p className="text-xs sm:text-sm text-gray-400">Arrendados</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-blue-400">
              {[...new Set(apartamentos.map(a => a.ciudad))].length}
            </p>
            <p className="text-xs sm:text-sm text-gray-400">Ciudades</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-lg w-full 
                        border border-gray-700/50 overflow-hidden my-8">
            <div className="relative bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-b border-gray-700/50 p-4 sm:p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-10"></div>
              <h2 className="relative text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">{editingId ? "✏️" : "🏢"}</span>
                <span className="leading-tight">{editingId ? "Editar Apartamento" : "Nuevo Apartamento"}</span>
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  🏠 Nombre del Apartamento
                </label>
                <input
                  type="text"
                  placeholder="Ej: Apartamento 101"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
                           transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  📍 Dirección
                </label>
                <input
                  type="text"
                  placeholder="Ej: Calle 123 # 45-67"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
                           transition-all duration-300"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    🏙️ Ciudad
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Bogotá"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
                             transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    💰 Valor Arriendo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 500000 o 500.000"
                    value={formData.valor_arriendo}
                    onChange={(e) => setFormData({ ...formData, valor_arriendo: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
                             transition-all duration-300"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Puedes escribir con o sin puntos. Ej: 400000 o 400.000</p>
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl
                           font-semibold shadow-lg hover:shadow-blue-500/50 transition-all duration-300
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

export default Apartamentos
