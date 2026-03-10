import React, { useState } from 'react'
import { apiService } from '../services/apiService'

export default function Menu({ user, onLogout }) {
  const [view, setView] = useState('inicio')
  const [formData, setFormData] = useState({})
  const [searchCedula, setSearchCedula] = useState('')
  const [searchCedulaCliente, setSearchCedulaCliente] = useState('')
  const [searchNit, setSearchNit] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [csvFile, setCsvFile] = useState(null)
  const [csvFileName, setCsvFileName] = useState('')
  const [uploadResults, setUploadResults] = useState(null)
  const [ventaCedula, setVentaCedula] = useState('')
  const [ventaCliente, setVentaCliente] = useState(null)
  const [ventaFilas, setVentaFilas] = useState([
    { id: 1, codigo: '', nombre: '', cantidad: '', precio: 0, total: 0, cargando: false },
    { id: 2, codigo: '', nombre: '', cantidad: '', precio: 0, total: 0, cargando: false },
    { id: 3, codigo: '', nombre: '', cantidad: '', precio: 0, total: 0, cargando: false }
  ])
  const [ventaError, setVentaError] = useState('')
  const [ventaSuccess, setVentaSuccess] = useState('')
  const [confirmandoVenta, setConfirmandoVenta] = useState(false)

  const IVA_RATE = 0.19

  const formatCurrency = (value) => {
    const amount = Number(value || 0)
    return amount.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLimpiar = () => {
    setFormData({})
    setSearchCedula('')
    setSearchResults([])
    setSearchError('')
    setCurrentPage(1)
  }

  const handleConsultar = async () => {
    if (!searchCedula || !searchCedula.trim()) {
      setSearchError('Por favor ingrese una cédula para buscar')
      return
    }

    setLoading(true)
    setSearchError('')
    setSearchResults([])

    try {
      const results = await apiService.search('/usuarios', searchCedula, 'cedula')
      setSearchResults(Array.isArray(results) ? results : [results])
      setCurrentPage(1)
      setTotalPages(1)
    } catch (error) {
      setSearchError(error.message)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleActualizar = async () => {
    let idField = formData.cedula || formData.nit || formData.id
    if (!idField) {
      setSearchError('Por favor ingrese un identificador para actualizar')
      return
    }

    setLoading(true)
    setSearchError('')

    try {
      const result = await apiService.update('/usuarios', idField, formData)
      setSearchResults([result])
      setSearchError('')
    } catch (error) {
      setSearchError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBorrar = async () => {
    let idField = formData.cedula || formData.nit || formData.id
    if (!idField) {
      setSearchError('Por favor ingrese un identificador para eliminar')
      return
    }

    if (!window.confirm('¿Está seguro de que desea eliminar este registro?')) {
      return
    }

    setLoading(true)
    setSearchError('')

    try {
      await apiService.delete('/usuarios', idField)
      setSearchResults([])
      setFormData({})
      alert('Registro eliminado correctamente')
    } catch (error) {
      setSearchError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Funciones para Clientes
  const handleConsultarClientes = async () => {
    if (!searchCedulaCliente || !searchCedulaCliente.trim()) {
      setSearchError('Por favor ingrese una cédula para buscar')
      return
    }

    setLoading(true)
    setSearchError('')
    setSearchResults([])

    try {
      const results = await apiService.search('/clientes', searchCedulaCliente, 'cedulaCliente')
      setSearchResults(Array.isArray(results) ? results : [results])
      setCurrentPage(1)
      setTotalPages(1)
    } catch (error) {
      setSearchError(error.message)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleGuardarClientes = async () => {
    if (!formData.cedulaCliente || !formData.nombreCliente) {
      setSearchError('Por favor ingrese cédula y nombre del cliente')
      return
    }

    setLoading(true)
    setSearchError('')

    try {
      const result = await apiService.create('/clientes', formData)
      setSearchResults([result])
      setFormData({})
    } catch (error) {
      setSearchError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleActualizarClientes = async () => {
    let idField = formData.cedulaCliente || formData.id
    if (!idField) {
      setSearchError('Por favor ingrese un identificador para actualizar')
      return
    }

    setLoading(true)
    setSearchError('')

    try {
      const result = await apiService.update('/clientes', idField, formData)
      setSearchResults([result])
      setSearchError('')
    } catch (error) {
      setSearchError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBorrarClientes = async () => {
    let idField = formData.cedulaCliente || formData.id
    if (!idField) {
      setSearchError('Por favor ingrese un identificador para eliminar')
      return
    }

    if (!window.confirm('¿Está seguro de que desea eliminar este registro?')) {
      return
    }

    setLoading(true)
    setSearchError('')

    try {
      await apiService.delete('/clientes', idField)
      setSearchResults([])
      setFormData({})
      alert('Registro eliminado correctamente')
    } catch (error) {
      setSearchError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Funciones para Proveedores
  const handleConsultarProveedores = async () => {
    if (!searchNit || !searchNit.trim()) {
      setSearchError('Por favor ingrese un NIT para buscar')
      return
    }

    setLoading(true)
    setSearchError('')
    setSearchResults([])

    try {
      const results = await apiService.search('/proveedores', searchNit, 'nit')
      setSearchResults(Array.isArray(results) ? results : [results])
      setCurrentPage(1)
      setTotalPages(1)
    } catch (error) {
      setSearchError(error.message)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleGuardarProveedores = async () => {
    if (!formData.nit || !formData.nombreProveedor) {
      setSearchError('Por favor ingrese NIT y nombre del proveedor')
      return
    }

    setLoading(true)
    setSearchError('')

    try {
      const result = await apiService.create('/proveedores', formData)
      setSearchResults([result])
      setFormData({})
    } catch (error) {
      setSearchError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleActualizarProveedores = async () => {
    let idField = formData.nit || formData.id
    if (!idField) {
      setSearchError('Por favor ingrese un identificador para actualizar')
      return
    }

    setLoading(true)
    setSearchError('')

    try {
      const result = await apiService.update('/proveedores', idField, formData)
      setSearchResults([result])
      setSearchError('')
    } catch (error) {
      setSearchError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBorrarProveedores = async () => {
    let idField = formData.nit || formData.id
    if (!idField) {
      setSearchError('Por favor ingrese un identificador para eliminar')
      return
    }

    if (!window.confirm('¿Está seguro de que desea eliminar este registro?')) {
      return
    }

    setLoading(true)
    setSearchError('')

    try {
      await apiService.delete('/proveedores', idField)
      setSearchResults([])
      setFormData({})
      alert('Registro eliminado correctamente')
    } catch (error) {
      setSearchError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGuardar = async () => {
    if (!formData.cedula || !formData.nombreCompleto) {
      setSearchError('Por favor ingrese cédula y nombre')
      return
    }

    setLoading(true)
    setSearchError('')

    try {
      const result = await apiService.create('/usuarios', formData)
      setSearchResults([result])
      setFormData({})
    } catch (error) {
      setSearchError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCsvFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setSearchError('Solo se permiten archivos CSV (.csv)')
        setCsvFile(null)
        setCsvFileName('')
        e.target.value = ''
        return
      }
      setCsvFile(file)
      setCsvFileName(file.name)
      setSearchError('')
      setUploadResults(null)
    }
  }

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '')
    if (lines.length < 2) {
      throw new Error('El archivo CSV debe contener al menos una fila de encabezados y una fila de datos')
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const requiredFields = ['codigo_producto', 'nombre_producto', 'nitproveedor', 'precio_compra', 'ivacompra', 'precio_venta']
    const missingFields = requiredFields.filter(f => !headers.includes(f))

    if (missingFields.length > 0) {
      throw new Error(`Faltan columnas requeridas en el CSV: ${missingFields.join(', ')}`)
    }

    const products = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      if (values.length !== headers.length) {
        throw new Error(`Error en la fila ${i + 1}: el número de columnas no coincide con los encabezados`)
      }
      const product = {}
      headers.forEach((header, idx) => {
        const val = values[idx]
        // Mapear de snake_case a camelCase
        const fieldMap = {
          'codigo_producto': 'codigoProducto',
          'nombre_producto': 'nombreProducto',
          'nitproveedor': 'nitProveedor',
          'precio_compra': 'precioCompra',
          'ivacompra': 'ivaCompra',
          'precio_venta': 'precioVenta'
        }
        const camelCaseField = fieldMap[header] || header
        if (['precioCompra', 'ivaCompra', 'precioVenta'].includes(camelCaseField)) {
          product[camelCaseField] = parseFloat(val) || 0
        } else {
          product[camelCaseField] = val
        }
      })
      products.push(product)
    }
    return products
  }

  const handleCargarCSV = async () => {
    if (!csvFile) {
      setSearchError('Por favor seleccione un archivo CSV')
      return
    }

    setLoading(true)
    setSearchError('')
    setUploadResults(null)

    try {
      const text = await csvFile.text()
      const products = parseCSV(text)

      if (products.length === 0) {
        throw new Error('El archivo CSV no contiene productos para cargar')
      }

      const result = await apiService.createBulk('/productos', products)
      setUploadResults({
        success: true,
        count: result.length,
        products: result
      })
      setCsvFile(null)
      setCsvFileName('')
      // Limpiar el input file
      const fileInput = document.getElementById('csv-file-input')
      if (fileInput) fileInput.value = ''
    } catch (error) {
      setSearchError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const resetVentaForm = () => {
    setVentaCedula('')
    setVentaCliente(null)
    setVentaFilas([
      { id: 1, codigo: '', nombre: '', cantidad: '', precio: 0, total: 0, cargando: false },
      { id: 2, codigo: '', nombre: '', cantidad: '', precio: 0, total: 0, cargando: false },
      { id: 3, codigo: '', nombre: '', cantidad: '', precio: 0, total: 0, cargando: false }
    ])
    setVentaError('')
    setVentaSuccess('')
  }

  const handleConsultarClienteVenta = async () => {
    if (!ventaCedula || !ventaCedula.trim()) {
      setVentaError('Ingrese la cedula del cliente para consultar.')
      return
    }

    setLoading(true)
    setVentaError('')
    setVentaSuccess('')

    try {
      const cliente = await apiService.getById('/clientes', ventaCedula.trim())
      setVentaCliente(cliente)
    } catch (error) {
      setVentaCliente(null)
      setVentaError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getVentaFilaTotal = (fila) => {
    const cantidad = Number(fila.cantidad || 0)
    const precio = Number(fila.precio || 0)
    return cantidad > 0 && precio > 0 ? cantidad * precio : 0
  }

  const updateVentaFila = (index, data) => {
    setVentaFilas((prev) => {
      const updated = [...prev]
      const nextRow = { ...updated[index], ...data }
      nextRow.total = getVentaFilaTotal(nextRow)
      updated[index] = nextRow
      return updated
    })
  }

  const handleVentaCantidadChange = (index, value) => {
    updateVentaFila(index, { cantidad: value })
    setVentaError('')
    setVentaSuccess('')
  }

  const handleVentaCodigoChange = (index, value) => {
    updateVentaFila(index, { codigo: value, nombre: '', precio: 0 })
    setVentaError('')
    setVentaSuccess('')
  }

  const handleConsultarProductoVenta = async (index) => {
    const fila = ventaFilas[index]
    const codigo = fila?.codigo?.trim()

    if (!codigo) {
      setVentaError(`Ingrese el codigo del producto ${index + 1}.`)
      return
    }

    setVentaError('')
    setVentaSuccess('')
    updateVentaFila(index, { cargando: true })

    try {
      const producto = await apiService.getById('/productos', codigo)
      const precioVenta = Number(producto?.precioVenta || 0)

      updateVentaFila(index, {
        codigo,
        nombre: producto?.nombreProducto || `Producto ${codigo}`,
        precio: precioVenta,
        cargando: false
      })
    } catch (error) {
      updateVentaFila(index, { cargando: false, nombre: '', precio: 0, total: 0 })
      setVentaError(error.message)
    }
  }

  const calcularTotalesVenta = () => {
    const subtotal = ventaFilas.reduce((acc, fila) => acc + Number(fila.total || 0), 0)
    const iva = subtotal * IVA_RATE
    const totalConIva = subtotal + iva
    return { subtotal, iva, totalConIva }
  }

  const handleConfirmarVenta = async () => {
    if (!ventaCliente) {
      setVentaError('Debe consultar y seleccionar un cliente para registrar la venta.')
      return
    }

    const filasValidas = ventaFilas.filter((fila) => Number(fila.cantidad) > 0 && Number(fila.precio) > 0)
    if (filasValidas.length === 0) {
      setVentaError('Debe agregar al menos un producto con cantidad y precio validos.')
      return
    }

    const { subtotal, iva, totalConIva } = calcularTotalesVenta()
    const payload = {
      cliente: {
        cedula: ventaCliente?.cedulaCliente || ventaCliente?.cedula
      },
      detalle: filasValidas.map((fila) => ({
        codigoProducto: Number(fila.codigo),
        cantidadProducto: Number(fila.cantidad),
        valorVenta: Number(fila.precio),
        valorTotal: Number(fila.total)
      })),
      valorVenta: subtotal,
      ivaVenta: iva,
      totalVenta: totalConIva
    }

    setConfirmandoVenta(true)
    setVentaError('')
    setVentaSuccess('')

    try {
      const response = await apiService.createSale(payload)
      const saleId = response?.id || 'N/A'
      const localWarning = response?.persistedLocally
        ? ' (guardada localmente en frontend)'
        : ''
      setVentaSuccess(`Venta confirmada con ID ${saleId}${localWarning}.`)
      setVentaFilas([
        { id: 1, codigo: '', nombre: '', cantidad: '', precio: 0, total: 0, cargando: false },
        { id: 2, codigo: '', nombre: '', cantidad: '', precio: 0, total: 0, cargando: false },
        { id: 3, codigo: '', nombre: '', cantidad: '', precio: 0, total: 0, cargando: false }
      ])
      setVentaCedula('')
      setVentaCliente(null)
    } catch (error) {
      setVentaError(error.message)
    } finally {
      setConfirmandoVenta(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const renderContent = () => {
    switch (view) {
      case 'usuarios':
        return (
          <div>
            <h3>Gestión de usuarios</h3>
            
            {/* Formulario de búsqueda por cédula */}
            <div style={{ marginBottom: '32px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Buscar Usuario por Cédula</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>Ingrese la cédula</label>
                  <input 
                    type="text" 
                    value={searchCedula}
                    onChange={(e) => setSearchCedula(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button" 
                    className="form-button"
                    onClick={handleConsultar}
                    disabled={loading}
                  >
                    {loading ? 'Buscando...' : 'Buscar'}
                  </button>
                  <button 
                    type="button" 
                    className="form-button"
                    onClick={handleLimpiar}
                    disabled={loading}
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            </div>

            {/* Formulario para añadir/editar información */}
            <div style={{ padding: '16px', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Añadir / Editar Usuario</h4>
              <form>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Cédula</label>
                  <input 
                    type="text" 
                    name="cedula" 
                    value={formData.cedula || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>Usuario</label>
                  <input 
                    type="text" 
                    name="usuario" 
                    value={formData.usuario || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>Nombre Completo</label>
                  <input 
                    type="text" 
                    name="nombreCompleto" 
                    value={formData.nombreCompleto || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>Contraseña</label>
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label>Correo Electrónico</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button 
                  type="button" 
                  className="form-button"
                  onClick={handleGuardar}
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button 
                  type="button" 
                  className="form-button"
                  onClick={handleActualizar}
                  disabled={loading}
                >
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
                <button 
                  type="button" 
                  className="form-button"
                  onClick={handleBorrar}
                  disabled={loading}
                >
                  {loading ? 'Eliminando...' : 'Borrar'}
                </button>
              </div>
            </form>
            </div>

            {searchError && (
              <div style={{ color: '#c44', marginTop: '12px', padding: '12px', backgroundColor: '#f8d7da', borderRadius: '6px' }}>
                Error: {searchError}
              </div>
            )}

            {searchResults.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  paddingBottom: '12px'
                }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                    Resultados: {searchResults.length} usuario(s)
                  </h4>
                </div>
                <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th style={{ width: '12%' }}>Cédula</th>
                        <th style={{ width: '15%' }}>Usuario</th>
                        <th style={{ width: '25%' }}>Nombre Completo</th>
                        <th style={{ width: '28%' }}>Email</th>
                        <th style={{ width: '20%', textAlign: 'center' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((result, idx) => (
                        <tr key={result.id || result.cedula || idx} className="users-table-row">
                          <td className="cell-cedula">
                            <span className="badge-cedula">{result.cedula || '—'}</span>
                          </td>
                          <td className="cell-usuario">
                            <span className="user-badge">{result.usuario || '—'}</span>
                          </td>
                          <td className="cell-nombre">
                            <strong>{result.nombreCompleto || result.name || '—'}</strong>
                          </td>
                          <td className="cell-email">
                            <span style={{ fontSize: '13px', color: '#666' }}>{result.email || '—'}</span>
                          </td>
                          <td className="cell-actions">
                            <button 
                              type="button"
                              className="action-btn edit-btn"
                              onClick={() => setFormData(result)}
                              title="Editar registro"
                            >
                              ✎ Editar
                            </button>
                            <button 
                              type="button"
                              className="action-btn view-btn"
                              onClick={() => {
                                alert(`Detalles de ${result.nombreCompleto}:\n\nCédula: ${result.cedula}\nUsuario: ${result.usuario}\nEmail: ${result.email}`)
                              }}
                              title="Ver detalles"
                            >
                              👁 Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )
      case 'clientes':
        return (
          <div>
            <h3>Gestión de clientes</h3>
            
            {/* Formulario de búsqueda por cédula */}
            <div style={{ marginBottom: '32px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Buscar Cliente por Cédula</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>Ingrese la cédula</label>
                  <input 
                    type="text" 
                    value={searchCedulaCliente}
                    onChange={(e) => setSearchCedulaCliente(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button" 
                    className="form-button"
                    onClick={handleConsultarClientes}
                    disabled={loading}
                  >
                    {loading ? 'Buscando...' : 'Buscar'}
                  </button>
                  <button 
                    type="button" 
                    className="form-button"
                    onClick={handleLimpiar}
                    disabled={loading}
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            </div>

            {/* Formulario para añadir/editar información */}
            <div style={{ padding: '16px', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Añadir / Editar Cliente</h4>
              <form>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Cédula</label>
                  <input 
                    type="text" 
                    name="cedulaCliente" 
                    value={formData.cedulaCliente || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>Teléfono</label>
                  <input 
                    type="tel" 
                    name="telefonoCliente" 
                    value={formData.telefonoCliente || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>Nombre Completo</label>
                  <input 
                    type="text" 
                    name="nombreCliente" 
                    value={formData.nombreCliente || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>Correo Electrónico</label>
                  <input 
                    type="email" 
                    name="emailCliente" 
                    value={formData.emailCliente || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label>Dirección</label>
                  <input 
                    type="text" 
                    name="direccionCliente" 
                    value={formData.direccionCliente || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button 
                  type="button" 
                  className="form-button"
                  onClick={handleGuardarClientes}
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button 
                  type="button" 
                  className="form-button"
                  onClick={handleActualizarClientes}
                  disabled={loading}
                >
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
                <button 
                  type="button" 
                  className="form-button"
                  onClick={handleBorrarClientes}
                  disabled={loading}
                >
                  {loading ? 'Eliminando...' : 'Borrar'}
                </button>
              </div>
            </form>
            </div>

            {searchError && (
              <div style={{ color: '#c44', marginTop: '12px', padding: '12px', backgroundColor: '#f8d7da', borderRadius: '6px' }}>
                Error: {searchError}
              </div>
            )}

            {searchResults.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #8b8b8b' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Resultados: {searchResults.length} cliente(s)</h4>
                </div>
                <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th style={{ width: '12%' }}>Cédula</th>
                        <th style={{ width: '20%' }}>Nombre</th>
                        <th style={{ width: '18%' }}>Teléfono</th>
                        <th style={{ width: '25%' }}>Email</th>
                        <th style={{ width: '25%', textAlign: 'center' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((result, idx) => (
                        <tr key={result.id || result.cedulaCliente || idx} className="users-table-row">
                          <td className="cell-cedula">
                            <span className="badge-cedula">{result.cedulaCliente || '—'}</span>
                          </td>
                          <td className="cell-nombre">
                            <strong>{result.nombreCliente || '—'}</strong>
                          </td>
                          <td style={{ color: '#666', fontSize: '13px' }}>
                            {result.telefonoCliente || '—'}
                          </td>
                          <td className="cell-email">
                            <span style={{ fontSize: '13px', color: '#666' }}>{result.emailCliente || '—'}</span>
                          </td>
                          <td className="cell-actions">
                            <button 
                              type="button"
                              className="action-btn edit-btn"
                              onClick={() => setFormData(result)}
                              title="Editar registro"
                            >
                              ✎ Editar
                            </button>
                            <button 
                              type="button"
                              className="action-btn view-btn"
                              onClick={() => {
                                alert(`Detalles de ${result.nombreCliente}:\n\nCédula: ${result.cedulaCliente}\nTeléfono: ${result.telefonoCliente}\nEmail: ${result.emailCliente}\nDirección: ${result.direccionCliente}`)
                              }}
                              title="Ver detalles"
                            >
                              👁 Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )
      case 'proveedores':
        return (
          <div>
            <h3>Gestión de proveedores</h3>
            
            {/* Formulario de búsqueda por NIT */}
            <div style={{ marginBottom: '32px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Buscar Proveedor por NIT</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '6px' }}>Ingrese el NIT</label>
                  <input 
                    type="text" 
                    value={searchNit}
                    onChange={(e) => setSearchNit(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button" 
                    className="form-button"
                    onClick={handleConsultarProveedores}
                    disabled={loading}
                  >
                    {loading ? 'Buscando...' : 'Buscar'}
                  </button>
                  <button 
                    type="button" 
                    className="form-button"
                    onClick={handleLimpiar}
                    disabled={loading}
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            </div>

            {/* Formulario para añadir/editar información */}
            <div style={{ padding: '16px', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Añadir / Editar Proveedor</h4>
              <form>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label>NIT</label>
                  <input 
                    type="text" 
                    name="nit" 
                    value={formData.nit || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>Teléfono</label>
                  <input 
                    type="tel" 
                    name="telefonoProveedor" 
                    value={formData.telefonoProveedor || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>Nombre Proveedor</label>
                  <input 
                    type="text" 
                    name="nombreProveedor" 
                    value={formData.nombreProveedor || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>Ciudad</label>
                  <input 
                    type="text" 
                    name="ciudadProveedor" 
                    value={formData.ciudadProveedor || formData.ciudad || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label>Dirección</label>
                  <input 
                    type="text" 
                    name="direccionProveedor" 
                    value={formData.direccionProveedor || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button 
                  type="button" 
                  className="form-button"
                  onClick={handleGuardarProveedores}
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button 
                  type="button" 
                  className="form-button"
                  onClick={handleActualizarProveedores}
                  disabled={loading}
                >
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
                <button 
                  type="button" 
                  className="form-button"
                  onClick={handleBorrarProveedores}
                  disabled={loading}
                >
                  {loading ? 'Eliminando...' : 'Borrar'}
                </button>
              </div>
            </form>
            </div>

            {searchError && (
              <div style={{ color: '#c44', marginTop: '12px', padding: '12px', backgroundColor: '#f8d7da', borderRadius: '6px' }}>
                Error: {searchError}
              </div>
            )}

            {searchResults.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #8b8b8b' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Resultados: {searchResults.length} proveedor(es)</h4>
                </div>
                <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th style={{ width: '12%' }}>NIT</th>
                        <th style={{ width: '20%' }}>Nombre</th>
                        <th style={{ width: '15%' }}>Teléfono</th>
                        <th style={{ width: '18%' }}>Ciudad</th>
                        <th style={{ width: '20%' }}>Dirección</th>
                        <th style={{ width: '15%', textAlign: 'center' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((result, idx) => (
                        <tr key={result.id || result.nit || idx} className="users-table-row">
                          <td className="cell-cedula">
                            <span className="badge-cedula">{result.nit || '—'}</span>
                          </td>
                          <td className="cell-nombre">
                            <strong>{result.nombreProveedor || '—'}</strong>
                          </td>
                          <td style={{ color: '#666', fontSize: '13px' }}>
                            {result.telefonoProveedor || '—'}
                          </td>
                          <td style={{ color: '#666', fontSize: '13px' }}>
                            {result.ciudadProveedor || result.ciudad || '—'}
                          </td>
                          <td style={{ color: '#666', fontSize: '13px' }}>
                            {result.direccionProveedor || '—'}
                          </td>
                          <td className="cell-actions">
                            <button 
                              type="button"
                              className="action-btn edit-btn"
                              onClick={() => setFormData(result)}
                              title="Editar registro"
                            >
                              ✎ Editar
                            </button>
                            <button 
                              type="button"
                              className="action-btn view-btn"
                              onClick={() => {
                                alert(`Detalles de ${result.nombreProveedor}:\n\nNIT: ${result.nit}\nTeléfono: ${result.telefonoProveedor}\nCiudad: ${result.ciudadProveedor || result.ciudad}\nDirección: ${result.direccionProveedor}`)
                              }}
                              title="Ver detalles"
                            >
                              👁 Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )
      case 'productos':
        return (
          <div>
            <h3>Gestión de productos</h3>

            <div style={{ padding: '24px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <h4 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Cargar Productos desde CSV</h4>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', color: '#666', whiteSpace: 'nowrap', minWidth: '120px' }}>Nombre del Archivo</label>
                <input 
                  type="text" 
                  value={csvFileName}
                  readOnly
                  placeholder="Ningún archivo seleccionado"
                  style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff' }}
                />
                <input 
                  type="file" 
                  id="csv-file-input"
                  accept=".csv"
                  onChange={handleCsvFileSelect}
                  style={{ display: 'none' }}
                />
                <button 
                  type="button" 
                  className="form-button"
                  onClick={() => document.getElementById('csv-file-input').click()}
                >
                  Examinar
                </button>
              </div>

              <div style={{ textAlign: 'center' }}>
                <button 
                  type="button" 
                  className="form-button csv-upload-btn"
                  onClick={handleCargarCSV}
                  disabled={loading || !csvFile}
                >
                  {loading ? 'Cargando...' : 'Cargar'}
                </button>
              </div>

              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#e8f4f8', borderRadius: '6px', fontSize: '12px', color: '#555' }}>
                <strong>Formato esperado del CSV:</strong><br />
                El archivo debe incluir las columnas en este orden: <code>codigo_producto, nombre_producto, nitproveedor, precio_compra, ivacompra, precio_venta</code>
              </div>
            </div>

            {searchError && (
              <div style={{ color: '#c44', marginTop: '12px', padding: '12px', backgroundColor: '#f8d7da', borderRadius: '6px' }}>
                Error: {searchError}
              </div>
            )}

            {uploadResults && uploadResults.success && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ padding: '12px', backgroundColor: '#d4edda', borderRadius: '6px', color: '#155724', marginBottom: '16px' }}>
                  Se cargaron exitosamente <strong>{uploadResults.count}</strong> producto(s) desde el archivo CSV.
                </div>

                <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th style={{ width: '12%' }}>Código</th>
                        <th style={{ width: '22%' }}>Nombre</th>
                        <th style={{ width: '14%' }}>P. Compra</th>
                        <th style={{ width: '12%' }}>IVA</th>
                        <th style={{ width: '14%' }}>P. Venta</th>
                        <th style={{ width: '16%' }}>NIT Proveedor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadResults.products.map((prod, idx) => (
                        <tr key={prod.id || idx} className="users-table-row">
                          <td className="cell-cedula">
                            <span className="badge-cedula">{prod.codigoProducto}</span>
                          </td>
                          <td className="cell-nombre">
                            <strong>{prod.nombreProducto}</strong>
                          </td>
                          <td style={{ color: '#666', fontSize: '13px' }}>
                            ${prod.precioCompra?.toLocaleString()}
                          </td>
                          <td style={{ color: '#666', fontSize: '13px' }}>
                            ${prod.ivaCompra?.toLocaleString()}
                          </td>
                          <td style={{ color: '#2d6a1f', fontSize: '13px', fontWeight: '600' }}>
                            ${prod.precioVenta?.toLocaleString()}
                          </td>
                          <td style={{ color: '#666', fontSize: '13px' }}>
                            {typeof prod.nitProveedor === 'object'
                              ? prod.nitProveedor?.nitProveedor
                              : prod.nitProveedor}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )
      case 'ventas': {
        const { subtotal, iva, totalConIva } = calcularTotalesVenta()

        return (
          <div>
            <h3>Registro de ventas</h3>

            <div className="ventas-panel">
              <div className="ventas-cliente-row">
                <div className="ventas-field ventas-cedula-field">
                  <label>Cedula</label>
                  <input
                    type="text"
                    value={ventaCedula}
                    onChange={(e) => setVentaCedula(e.target.value)}
                    placeholder="Ingrese cedula del cliente"
                  />
                </div>
                <button
                  type="button"
                  className="form-button"
                  onClick={handleConsultarClienteVenta}
                  disabled={loading}
                >
                  {loading ? 'Consultando...' : 'Consultar'}
                </button>
                <div className="ventas-field ventas-cliente-info">
                  <label>Cliente</label>
                  <input
                    type="text"
                    readOnly
                    value={ventaCliente?.nombreCliente || ventaCliente?.nombre || ''}
                    placeholder="Sin cliente seleccionado"
                  />
                </div>
              </div>

              <div className="ventas-table-wrap">
                <table className="ventas-table">
                  <thead>
                    <tr>
                      <th>Cod. Producto</th>
                      <th>Accion</th>
                      <th>Nombre Producto</th>
                      <th>Cant.</th>
                      <th>Vlr. Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventaFilas.map((fila, index) => (
                      <tr key={fila.id}>
                        <td>
                          <input
                            type="text"
                            value={fila.codigo}
                            onChange={(e) => handleVentaCodigoChange(index, e.target.value)}
                            placeholder={`Cod ${index + 1}`}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="form-button ventas-consultar-btn"
                            onClick={() => handleConsultarProductoVenta(index)}
                            disabled={fila.cargando}
                          >
                            {fila.cargando ? '...' : 'Consultar'}
                          </button>
                        </td>
                        <td>
                          <input type="text" readOnly value={fila.nombre} placeholder="Nombre" />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            value={fila.cantidad}
                            onChange={(e) => handleVentaCantidadChange(index, e.target.value)}
                            placeholder="0"
                          />
                        </td>
                        <td>
                          <input type="text" readOnly value={formatCurrency(fila.total)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="ventas-totales">
                <div>
                  <span>Total Venta</span>
                  <strong>{formatCurrency(subtotal)}</strong>
                </div>
                <div>
                  <span>Total IVA</span>
                  <strong>{formatCurrency(iva)}</strong>
                </div>
                <div>
                  <span>Total con IVA</span>
                  <strong>{formatCurrency(totalConIva)}</strong>
                </div>
              </div>

              <div className="ventas-actions">
                <button
                  type="button"
                  className="form-button"
                  onClick={handleConfirmarVenta}
                  disabled={confirmandoVenta}
                >
                  {confirmandoVenta ? 'Confirmando...' : 'Confirmar'}
                </button>
                <button
                  type="button"
                  className="form-button"
                  onClick={resetVentaForm}
                  disabled={confirmandoVenta}
                >
                  Limpiar
                </button>
              </div>
            </div>

            {ventaError && (
              <div style={{ color: '#c44', marginTop: '12px', padding: '12px', backgroundColor: '#f8d7da', borderRadius: '6px' }}>
                Error: {ventaError}
              </div>
            )}

            {ventaSuccess && (
              <div style={{ color: '#155724', marginTop: '12px', padding: '12px', backgroundColor: '#d4edda', borderRadius: '6px' }}>
                {ventaSuccess}
              </div>
            )}
          </div>
        )
      }
      default:
        return (
          <div>
            <h3>Inicio</h3>
            <p>Seleccione una opción del menú lateral.</p>
          </div>
        )
    }
  }

  return (
    <div className="menu-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <strong>Tienda Genérica</strong>
          <div className="user">Usuario: {user.name}</div>
        </div>
        <button onClick={() => setView('inicio')}>Inicio</button>
        <button onClick={() => setView('usuarios')}>Gestión de usuarios</button>
        <button onClick={() => setView('clientes')}>Gestión de clientes</button>
        <button onClick={() => setView('proveedores')}>Gestión de proveedores</button>
        <button onClick={() => setView('productos')}>Gestión de productos</button>
        <button onClick={() => setView('ventas')}>Ventas</button>
        <button className="logout" onClick={onLogout}>Cerrar sesión</button>
      </aside>
      <main className="content">{renderContent()}</main>
    </div>
  )
}

