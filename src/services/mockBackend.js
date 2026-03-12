// Servicio Mock para simular un backend con datos en localStorage
// Útil para testing durante el desarrollo

class MockBackend {
  constructor() {
    this.storageKey = 'mockBackendData'
    this.initializeData()
  }

  toLongNumber(value) {
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

  normalizeRecord(endpoint, data = {}) {
    if (endpoint !== '/clientes') {
      return data
    }

    if ('cedula' in data) {
      return {
        ...data,
        cedula: this.toLongNumber(data.cedula)
      }
    }

    if ('cedulaCliente' in data) {
      return {
        ...data,
        cedulaCliente: this.toLongNumber(data.cedulaCliente)
      }
    }

    return data
  }

  matchesIdentifier(item, id) {
    const identifier = item.cedula ?? item.cedulaCliente ?? item.nit ?? item.nitProveedor
    return item.id == id || String(identifier ?? '') === String(id)
  }

  async initializeData() {
    // Si no hay datos, cargar desde mockData.json
    if (!localStorage.getItem(this.storageKey)) {
      try {
        const response = await fetch('/mockData.json')
        const data = await response.json()
        localStorage.setItem(this.storageKey, JSON.stringify(data))
      } catch (error) {
        console.log('MockData.json no encontrado, usando datos vacíos')
        localStorage.setItem(this.storageKey, JSON.stringify({
          '/usuarios': [],
          '/clientes': [],
          '/proveedores': [],
          '/productos': [],
          '/ventas': []
        }))
      }
    }
  }

  getData(endpoint) {
    const allData = JSON.parse(localStorage.getItem(this.storageKey) || '{}')
    return allData[endpoint] || []
  }

  setData(endpoint, data) {
    const allData = JSON.parse(localStorage.getItem(this.storageKey) || '{}')
    allData[endpoint] = data
    localStorage.setItem(this.storageKey, JSON.stringify(allData))
  }

  // Simular delay de red
  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // GET - Obtener todos
  async getAll(endpoint, params = {}) {
    await this.delay()
    let data = this.getData(endpoint)
    
    // Filtrar por parámetros de búsqueda
    if (params && Object.keys(params).length > 0) {
      data = data.filter(item => {
        return Object.keys(params).every(key => {
          const value = params[key]?.toString().toLowerCase()
          const itemValue = (item[key] || '')?.toString().toLowerCase()
          return itemValue.includes(value)
        })
      })
    }
    
    return {
      results: data,
      total: data.length,
      page: params.page || 1,
      pages: 1
    }
  }

  // GET - Obtener por ID
  async getById(endpoint, id) {
    await this.delay()
    const data = this.getData(endpoint)
    const item = data.find(item => this.matchesIdentifier(item, id))
    
    if (!item) {
      throw new Error('Registro no encontrado')
    }
    return item
  }

  // SEARCH - Buscar
  async search(endpoint, query, searchField = 'nombre') {
    await this.delay()
    let data = this.getData(endpoint)
    
    if (!query) return data
    
    const queryLower = query.toLowerCase()
    return data.filter(item => {
      const fieldValue = (item[searchField] || '').toString().toLowerCase()
      return fieldValue.includes(queryLower)
    })
  }

  // POST - Crear
  async create(endpoint, data) {
    await this.delay()
    const items = this.getData(endpoint)
    
    // Generar ID automático
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id || 0)) + 1 : 1
    
    const newItem = {
      ...this.normalizeRecord(endpoint, data),
      id: newId,
      createdAt: new Date().toISOString()
    }
    
    items.push(newItem)
    this.setData(endpoint, items)
    
    return newItem
  }

  // PUT - Actualizar
  async update(endpoint, id, data) {
    await this.delay()
    const items = this.getData(endpoint)
    
    const index = items.findIndex(item => this.matchesIdentifier(item, id))
    
    if (index === -1) {
      throw new Error('Registro no encontrado para actualizar')
    }
    
    const updatedItem = {
      ...items[index],
      ...this.normalizeRecord(endpoint, data),
      updatedAt: new Date().toISOString()
    }
    
    items[index] = updatedItem
    this.setData(endpoint, items)
    
    return updatedItem
  }

  // DELETE - Eliminar
  async delete(endpoint, id) {
    await this.delay()
    const items = this.getData(endpoint)
    
    const index = items.findIndex(item => this.matchesIdentifier(item, id))
    
    if (index === -1) {
      throw new Error('Registro no encontrado para eliminar')
    }
    
    const deletedItem = items[index]
    items.splice(index, 1)
    this.setData(endpoint, items)
    
    return deletedItem
  }

  // POST BULK - Crear múltiples registros
  async createBulk(endpoint, dataArray) {
    await this.delay()
    const items = this.getData(endpoint)
    let maxId = items.length > 0 ? Math.max(...items.map(i => i.id || 0)) : 0
    const newItems = []

    for (const data of dataArray) {
      maxId++
      const newItem = {
        ...this.normalizeRecord(endpoint, data),
        id: maxId,
        createdAt: new Date().toISOString()
      }
      items.push(newItem)
      newItems.push(newItem)
    }

    this.setData(endpoint, items)
    return newItems
  }

  // Limpiar todos los datos
  clearAll() {
    localStorage.removeItem(this.storageKey)
    this.initializeData()
  }

  // Exportar datos
  export() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '{}')
  }

  // Importar datos
  import(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data))
  }
}

export const mockBackend = new MockBackend()
