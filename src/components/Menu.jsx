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
                    name="ciudad" 
                    value={formData.ciudad || ''}
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
                            {result.ciudad || '—'}
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
                                alert(`Detalles de ${result.nombreProveedor}:\n\nNIT: ${result.nit}\nTeléfono: ${result.telefonoProveedor}\nCiudad: ${result.ciudad}\nDirección: ${result.direccionProveedor}`)
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
        <button className="logout" onClick={onLogout}>Cerrar sesión</button>
      </aside>
      <main className="content">{renderContent()}</main>
    </div>
  )
}

