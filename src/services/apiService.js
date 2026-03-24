import axios from 'axios'
import { mockBackend } from './mockBackend'

// Usar VITE_USE_MOCK_BACKEND=true para usar datos locales
// O VITE_USE_MOCK_BACKEND=false para usar el backend real
const USE_MOCK = import.meta.env.VITE_USE_MOCK_BACKEND === 'false'

// URLs de Microservicios por Servicio
const MICROSERVICES_URLS = {
  backend: import.meta.env.VITE_BACKEND_URL || 'https://cautious-space-waffle-5gqx67xjvw9v24qp6-8088.app.github.dev/',
  cliente: import.meta.env.VITE_CLIENTE_URL || 'https://cautious-space-waffle-5gqx67xjvw9v24qp6-8089.app.github.dev/',
  usuario: import.meta.env.VITE_USUARIO_URL || 'https://cautious-space-waffle-5gqx67xjvw9v24qp6-8090.app.github.dev/',
  proveedor: import.meta.env.VITE_PROVEEDOR_URL || 'https://cautious-space-waffle-5gqx67xjvw9v24qp6-8091.app.github.dev/',
  producto: import.meta.env.VITE_PRODUCTO_URL || 'https://cautious-space-waffle-5gqx67xjvw9v24qp6-8092.app.github.dev/',
  venta: import.meta.env.VITE_VENTA_URL || 'https://cautious-space-waffle-5gqx67xjvw9v24qp6-8093.app.github.dev/',
  detalleVenta: import.meta.env.VITE_DETALLE_VENTA_URL || 'https://cautious-space-waffle-5gqx67xjvw9v24qp6-8094.app.github.dev/'
}

const LOCAL_SALES_KEY = 'ventasFallbackLocal'

// Crear cliente HTTP con URL dinámica basada en el recurso
const createHttpClient = (baseURL) => {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 15000
  })
}

const getHttpClient = (endpoint = '') => {
  const resource = resolveResourcePath(endpoint)
  
  // Mapeo de recursos a microservicios
  const serviceMap = {
    '/cliente': MICROSERVICES_URLS.cliente,
    '/clientes': MICROSERVICES_URLS.cliente,
    '/usuarios': MICROSERVICES_URLS.usuario,
    '/usuario': MICROSERVICES_URLS.usuario,
    '/proveedores': MICROSERVICES_URLS.proveedor,
    '/proveedor': MICROSERVICES_URLS.proveedor,
    '/productos': MICROSERVICES_URLS.producto,
    '/producto': MICROSERVICES_URLS.producto,
    '/ventas': MICROSERVICES_URLS.venta,
    '/venta': MICROSERVICES_URLS.venta,
    '/detalleVenta': MICROSERVICES_URLS.detalleVenta,
    '/detalle-venta': MICROSERVICES_URLS.detalleVenta
  }
  
  const baseURL = serviceMap[resource] || MICROSERVICES_URLS.backend
  return createHttpClient(baseURL)
}

// Cliente HTTP por defecto (para compatibilidad con custom)
const http = createHttpClient(MICROSERVICES_URLS.backend)

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

  // Normalizar usuario (agregar cédula como número)
  if (data.usuario && typeof data.usuario === 'object') {
    const userCedula = getFirstNonEmptyValue(data.usuario.cedula)
    const normalizedUserCedula = toLongNumber(userCedula)

    normalizedData.usuario = { ...data.usuario }
    // Evita enviar valores no numéricos que Java serializa como null
    delete normalizedData.usuario.cedula
    if (Number.isSafeInteger(normalizedUserCedula)) {
      normalizedData.usuario.cedula = normalizedUserCedula
    }
  }

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
  console.log(`🔌 Modo: ${USE_MOCK ? '📦 MOCK (localStorage)' : '🌐 API Real (Microservicios)'}`)
  if (!USE_MOCK) {
    console.log('📍 URLs de Microservicios:')
    console.log(`   Backend: ${MICROSERVICES_URLS.backend}`)
    console.log(`   Cliente: ${MICROSERVICES_URLS.cliente}`)
    console.log(`   Usuario: ${MICROSERVICES_URLS.usuario}`)
    console.log(`   Proveedor: ${MICROSERVICES_URLS.proveedor}`)
    console.log(`   Producto: ${MICROSERVICES_URLS.producto}`)
    console.log(`   Venta: ${MICROSERVICES_URLS.venta}`)
    console.log(`   Detalle Venta: ${MICROSERVICES_URLS.detalleVenta}`)
  }
}

// Seleccionar backend activo
const backend = USE_MOCK ? mockBackend : null

/**
 * Autenticar usuario contra tabla de usuarios
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Promise<{usuario: string, id: number, nombreCompleto: string, email: string, cedula: string}>} Usuario autenticado
 */
const loginUser = async (username, password) => {
  try {
    if (!username || !password) {
      throw new Error('Usuario y contraseña son requeridos')
    }

    if (USE_MOCK) {
      // Usar mock backend
      return await backend.loginUser(username, password)
    } else {
      // Usar backend real - intentar primero el servicio de usuarios, luego el backend principal
      try {
        const httpClientUsuario = createHttpClient(MICROSERVICES_URLS.usuario)
        const response = await httpClientUsuario.post('/usuarios/login', {
          usuario: username,
          password: password
        })
        return response.data
      } catch (userServiceError) {
        // Si falla, intentar con el backend principal
        const httpClientBackend = createHttpClient(MICROSERVICES_URLS.backend)
        const response = await httpClientBackend.post('/usuarios/login', {
          usuario: username,
          password: password
        })
        return response.data
      }
    }
  } catch (error) {
    const message = getErrorMessage(error, 'Error en autenticación')
    throw new Error(message)
  }
}

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

      const httpClient = getHttpClient(endpoint)
      const resource = resolveResourcePath(endpoint)
      const response = await httpClient.get(`${resource}/listar`, { params })
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

      const httpClient = getHttpClient(endpoint)
      const resource = resolveResourcePath(endpoint)
      const normalizedId = normalizeResourceId(endpoint, id)
      const response = await httpClient.get(`${resource}/buscar/${normalizedId}`)
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

      const httpClient = getHttpClient(endpoint)
      const resource = resolveResourcePath(endpoint)
      const payload = mapDataToBackend(endpoint, data)
      const response = await httpClient.post(`${resource}/guardar`, payload)
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

      const httpClient = getHttpClient(endpoint)
      const resource = resolveResourcePath(endpoint)
      const normalizedId = normalizeResourceId(endpoint, id)
      const payload = mapDataToBackend(endpoint, data)
      const response = await httpClient.put(`${resource}/actualizar/${normalizedId}`, payload)
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

      const httpClient = getHttpClient(endpoint)
      const resource = resolveResourcePath(endpoint)
      const normalizedId = normalizeResourceId(endpoint, id)
      const response = await httpClient.delete(`${resource}/eliminar/${normalizedId}`)
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
   * Autenticar usuario
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   */
  loginUser,

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
      
      console.log('🔍 Venta normalizada antes de enviar:', JSON.stringify(normalizedSaleData, null, 2))
      
      if (USE_MOCK) {
        return await backend.create('/ventas', normalizedSaleData)
      }

      const httpClient = getHttpClient('/ventas')
      const candidatePaths = ['/ventas/guardar', '/venta/guardar']
      let firstNon404Error = null

      for (const path of candidatePaths) {
        try {
          console.log('📡 Enviando a:', path, normalizedSaleData)
          const response = await httpClient.post(path, normalizedSaleData)
          console.log('✅ Respuesta del backend:', response.data)
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

