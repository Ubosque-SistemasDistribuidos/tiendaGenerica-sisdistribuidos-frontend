import axios from 'axios'
import { mockBackend } from './mockBackend'

// Usar VITE_USE_MOCK_BACKEND=true para usar datos locales
// O VITE_USE_MOCK_BACKEND=false para usar el backend real
const USE_MOCK = import.meta.env.VITE_USE_MOCK_BACKEND === 'false'
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088'
const LOCAL_SALES_KEY = 'ventasFallbackLocal'

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
})

const normalizeEndpoint = (endpoint = '') => {
  if (!endpoint) return ''
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`
}

const resolveResourcePath = (endpoint = '') => {
  const normalized = normalizeEndpoint(endpoint)
  const aliases = {
    '/clientes': '/cliente',
    '/cliente': '/cliente',
    '/proveedores': '/proveedores',
    '/usuarios': '/usuarios',
    '/ventas': '/ventas',
    '/venta': '/venta'
  }
  return aliases[normalized] || normalized
}

const saveSaleLocally = (salePayload = {}) => {
  if (typeof window === 'undefined') {
    return {
      ...salePayload,
      id: `LOCAL-${Date.now()}`,
      createdAt: new Date().toISOString(),
      persistedLocally: true
    }
  }

  const localSales = JSON.parse(localStorage.getItem(LOCAL_SALES_KEY) || '[]')
  const sale = {
    ...salePayload,
    id: `LOCAL-${Date.now()}`,
    createdAt: new Date().toISOString(),
    persistedLocally: true
  }
  localSales.push(sale)
  localStorage.setItem(LOCAL_SALES_KEY, JSON.stringify(localSales))
  return sale
}

const toLongNumber = (value) => {
  if (value === undefined || value === null || value === '') return value

  if (typeof value === 'number') {
    return Number.isSafeInteger(value) ? value : value
  }

  const normalizedValue = String(value).trim()

  if (!/^\d+$/.test(normalizedValue)) {
    return value
  }

  const parsedValue = Number(normalizedValue)
  return Number.isSafeInteger(parsedValue) ? parsedValue : value
}

const normalizeResourceId = (endpoint = '', id) => {
  const resource = resolveResourcePath(endpoint)

  if (resource === '/cliente') {
    return toLongNumber(id)
  }

  return id
}

const getFirstNonEmptyValue = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null) continue
    if (typeof value === 'string' && value.trim() === '') continue
    return value
  }
  return undefined
}

const toFiniteNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

const normalizeSalePayload = (data = {}) => {
  if (!data || typeof data !== 'object') return data

  const normalizedData = { ...data }

  if (data.cliente && typeof data.cliente === 'object') {
    const customerCedula = getFirstNonEmptyValue(data.cliente.cedula, data.cliente.cedulaCliente)
    const normalizedCedula = toLongNumber(customerCedula)

    normalizedData.cliente = { ...data.cliente }
    // Evita enviar valores no numericos que Java serializa como null.
    delete normalizedData.cliente.cedula
    if (Number.isSafeInteger(normalizedCedula)) {
      normalizedData.cliente.cedula = normalizedCedula
    }
  }

  if (Array.isArray(data.detalle)) {
    normalizedData.detalle = data.detalle.map((detailItem = {}) => {
      const normalizedDetail = { ...detailItem }

      const codeValue = toLongNumber(
        getFirstNonEmptyValue(detailItem.codigoProducto, detailItem.codigo_producto, detailItem.codigo)
      )
      const quantityValue = toFiniteNumber(
        getFirstNonEmptyValue(detailItem.cantidadProducto, detailItem.cantidad_producto, detailItem.cantidad)
      )
      const saleValue = toFiniteNumber(getFirstNonEmptyValue(detailItem.valorVenta, detailItem.valor_venta))
      const totalValue = toFiniteNumber(getFirstNonEmptyValue(detailItem.valorTotal, detailItem.valor_total))

      // Limpia campos potencialmente NaN para no serializarlos como null.
      delete normalizedDetail.codigoProducto
      delete normalizedDetail.cantidadProducto
      delete normalizedDetail.valorVenta
      delete normalizedDetail.valorTotal

      if (Number.isSafeInteger(codeValue)) {
        normalizedDetail.codigoProducto = codeValue
      }
      if (quantityValue !== undefined) {
        normalizedDetail.cantidadProducto = quantityValue
      }
      if (saleValue !== undefined) {
        normalizedDetail.valorVenta = saleValue
      }
      if (totalValue !== undefined) {
        normalizedDetail.valorTotal = totalValue
      }

      return normalizedDetail
    })
  }

  return normalizedData
}

const mapSearchField = (endpoint = '', searchField = '') => {
  const resource = resolveResourcePath(endpoint)

  if (resource === '/cliente') {
    if (searchField === 'cedulaCliente') return 'cedula'
    if (searchField === 'nombreCliente') return 'nombre'
  }

  if (resource === '/proveedores') {
    if (searchField === 'nit') return 'nitProveedor'
  }

  return searchField
}

const mapDataToBackend = (endpoint = '', data = {}) => {
  const resource = resolveResourcePath(endpoint)

  if (resource === '/cliente') {
    const cedulaValue = toLongNumber(data.cedula ?? data.cedulaCliente)
    const payload = {
      cedula: toLongNumber(data.cedula ?? data.cedulaCliente),
      nombre: data.nombre ?? data.nombreCliente,
      direccion: data.direccion ?? data.direccionCliente,
      email: data.email ?? data.emailCliente ?? data.correo,
      telefono: data.telefono ?? data.telefonoCliente
    }
    if (cedulaValue != null && cedulaValue !== '') {
    payload.cedula = cedulaValue
    }
    return payload
  }

  if (resource === '/proveedores') {
    return {
      nitProveedor: data.nitProveedor ?? data.nit,
      nombreProveedor: data.nombreProveedor,
      ciudadProveedor: data.ciudadProveedor ?? data.ciudad,
      direccionProveedor: data.direccionProveedor,
      telefonoProveedor: data.telefonoProveedor
    }
  }

  return data
}

const mapDataFromBackend = (endpoint = '', data) => {
  if (Array.isArray(data)) {
    return data.map(item => mapDataFromBackend(endpoint, item))
  }

  if (!data || typeof data !== 'object') {
    return data
  }

  const resource = resolveResourcePath(endpoint)

  if (resource === '/cliente') {
    return {
      ...data,
      id: data.id ?? data.cedula,
      cedulaCliente: toLongNumber(data.cedula),
      nombreCliente: data.nombre,
      direccionCliente: data.direccion,
      emailCliente: data.email,
      telefonoCliente: data.telefono
    }
  }

  if (resource === '/proveedores') {
    return {
      ...data,
      id: data.id ?? data.nitProveedor,
      nit: data.nitProveedor,
      ciudad: data.ciudadProveedor
    }
  }

  return data
}

const getErrorMessage = (error, fallback) => {
  const apiMessage = error?.response?.data?.message || error?.response?.data?.error
  if (apiMessage) return apiMessage
  if (error?.code === 'ECONNABORTED') return 'Tiempo de espera agotado al conectar con el backend'
  return `${fallback}: ${error.message}`
}

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

      const resource = resolveResourcePath(endpoint)
      const response = await http.get(`${resource}/listar`, { params })
      return mapDataFromBackend(endpoint, response.data)
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Error al obtener datos'))
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

      const resource = resolveResourcePath(endpoint)
      const normalizedId = normalizeResourceId(endpoint, id)
      const response = await http.get(`${resource}/buscar/${normalizedId}`)
      return mapDataFromBackend(endpoint, response.data)
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Error al obtener registro'))
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

      const list = await apiService.getAll(endpoint)
      const field = mapSearchField(endpoint, searchField)
      const queryValue = String(query ?? '').toLowerCase()

      if (!queryValue) return list
      if (!Array.isArray(list)) return []

      return list.filter((item) => {
        const value = String(item?.[field] ?? '').toLowerCase()
        return value.includes(queryValue)
      })
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Error en búsqueda'))
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

      const resource = resolveResourcePath(endpoint)
      const payload = mapDataToBackend(endpoint, data)
      const response = await http.post(`${resource}/guardar`, payload)
      return mapDataFromBackend(endpoint, response.data)
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Error al crear registro'))
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

      const resource = resolveResourcePath(endpoint)
      const normalizedId = normalizeResourceId(endpoint, id)
      const payload = mapDataToBackend(endpoint, data)
      const response = await http.put(`${resource}/actualizar/${normalizedId}`, payload)
      return mapDataFromBackend(endpoint, response.data)
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Error al actualizar registro'))
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

      const resource = resolveResourcePath(endpoint)
      const normalizedId = normalizeResourceId(endpoint, id)
      const response = await http.delete(`${resource}/eliminar/${normalizedId}`)
      return mapDataFromBackend(endpoint, response.data)
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Error al eliminar registro'))
    }
  },

  /**
   * Crear múltiples registros desde un array
   * @param {string} endpoint - El endpoint específico
   * @param {Array} dataArray - Array de objetos a crear
   */
  createBulk: async (endpoint, dataArray) => {
    try {
      if (USE_MOCK) {
        return await backend.createBulk(endpoint, dataArray)
      }

      const results = []

      for (const row of dataArray) {
        const created = await apiService.create(endpoint, row)
        results.push(created)
      }

      return results
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Error al crear registros masivos'))
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

      const method = (options.method || 'GET').toLowerCase()
      const data = options.body ? JSON.parse(options.body) : options.data
      const params = options.params
      const fullPath = url.startsWith('http') ? url : normalizeEndpoint(url)
      const response = await http.request({
        url: fullPath,
        method,
        data,
        params,
        headers: options.headers
      })
      return response.data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Error en consulta personalizada'))
    }
  },

  /**
   * Registrar una venta con sus detalles.
   * Si el endpoint no existe en backend, se guarda en localStorage como respaldo.
   * @param {object} data - Venta con cliente, totales y detalle de productos.
   */
  createSale: async (data) => {
    try {
      const normalizedSaleData = normalizeSalePayload(data)
       if (!normalizedSaleData.codigoVenta) {
      normalizedSaleData.codigoVenta = Date.now()
    } else {
      normalizedSaleData.codigoVenta = Number(normalizedSaleData.codigoVenta)
    }
      if (USE_MOCK) {
        return await backend.create('/ventas', normalizedSaleData)
      }

      const candidatePaths = ['/ventas/guardar', '/venta/guardar']
      let firstNon404Error = null

      for (const path of candidatePaths) {
        try {
          const response = await http.post(path, normalizedSaleData)
          return response.data
        } catch (error) {
          const status = error?.response?.status
          if (status === 404 || status === 405) {
            continue
          }
          firstNon404Error = error
          break
        }
      }

      if (firstNon404Error) {
        throw firstNon404Error
      }

      const localSale = saveSaleLocally(normalizedSaleData)
      return {
        ...localSale,
        warning: 'La venta se guardo localmente porque el endpoint de ventas no esta disponible.'
      }
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Error al registrar venta'))
    }
  }
}

