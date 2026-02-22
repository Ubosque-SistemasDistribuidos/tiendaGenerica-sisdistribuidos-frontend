import { mockBackend } from './mockBackend'

// Usar VITE_USE_MOCK_BACKEND=true para usar datos locales
// O VITE_USE_MOCK_BACKEND=false para usar el backend real
const USE_MOCK = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Log de conexión para debugging
if (typeof window !== 'undefined') {
  console.log(`🔌 Modo: ${USE_MOCK ? '📦 MOCK (localStorage)' : '🌐 API Real'}`)
  if (!USE_MOCK) console.log(`📍 API URL: ${API_BASE_URL}`)
}

// Seleccionar backend activo
const backend = USE_MOCK ? mockBackend : null

export const apiService = {
  /**
   * Obtener todos los registros
   * @param {string} endpoint - El endpoint específico (ej: /usuarios, /clientes)
   * @param {object} params - Parámetros de query (página, filtros, etc)
   */
  getAll: async (endpoint, params = {}) => {
    try {
      if (USE_MOCK) {
        return await backend.getAll(endpoint, params)
      }
      
      const queryString = new URLSearchParams(params).toString()
      const url = `${API_BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Error ${response.status}: No se pudieron cargar los datos`)
      return await response.json()
    } catch (error) {
      throw new Error(`Error al obtener datos: ${error.message}`)
    }
  },

  /**
   * Obtener un registro por ID
   * @param {string} endpoint - El endpoint específico
   * @param {number|string} id - ID del registro
   */
  getById: async (endpoint, id) => {
    try {
      if (USE_MOCK) {
        return await backend.getById(endpoint, id)
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}/${id}`)
      if (!response.ok) throw new Error(`Error ${response.status}: Registro no encontrado`)
      return await response.json()
    } catch (error) {
      throw new Error(`Error al obtener registro: ${error.message}`)
    }
  },

  /**
   * Buscar registros
   * @param {string} endpoint - El endpoint específico
   * @param {string} query - Término de búsqueda
   * @param {string} searchField - Campo por el que buscar
   */
  search: async (endpoint, query, searchField = 'nombre') => {
    try {
      if (USE_MOCK) {
        return await backend.search(endpoint, query, searchField)
      }

      const params = { [searchField]: query }
      return await apiService.getAll(endpoint, params)
    } catch (error) {
      throw new Error(`Error en búsqueda: ${error.message}`)
    }
  },

  /**
   * Crear un nuevo registro
   * @param {string} endpoint - El endpoint específico
   * @param {object} data - Datos del nuevo registro
   */
  create: async (endpoint, data) => {
    try {
      if (USE_MOCK) {
        return await backend.create(endpoint, data)
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error(`Error ${response.status}: No se pudo crear el registro`)
      return await response.json()
    } catch (error) {
      throw new Error(`Error al crear registro: ${error.message}`)
    }
  },

  /**
   * Actualizar un registro
   * @param {string} endpoint - El endpoint específico
   * @param {number|string} id - ID del registro
   * @param {object} data - Datos a actualizar
   */
  update: async (endpoint, id, data) => {
    try {
      if (USE_MOCK) {
        return await backend.update(endpoint, id, data)
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error(`Error ${response.status}: No se pudo actualizar el registro`)
      return await response.json()
    } catch (error) {
      throw new Error(`Error al actualizar registro: ${error.message}`)
    }
  },

  /**
   * Eliminar un registro
   * @param {string} endpoint - El endpoint específico
   * @param {number|string} id - ID del registro
   */
  delete: async (endpoint, id) => {
    try {
      if (USE_MOCK) {
        return await backend.delete(endpoint, id)
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      if (!response.ok) throw new Error(`Error ${response.status}: No se pudo eliminar el registro`)
      return await response.json()
    } catch (error) {
      throw new Error(`Error al eliminar registro: ${error.message}`)
    }
  },

  /**
   * Realizar una consulta personalizada
   * @param {string} url - URL completa o endpoint relativo
   * @param {object} options - Opciones adicionales de fetch
   */
  custom: async (url, options = {}) => {
    try {
      if (USE_MOCK) {
        throw new Error('Operación personalizada no disponible en modo mock')
      }

      const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
      const response = await fetch(fullUrl, options)
      if (!response.ok) throw new Error(`Error ${response.status}`)
      return await response.json()
    } catch (error) {
      throw new Error(`Error en consulta personalizada: ${error.message}`)
    }
  }
}

