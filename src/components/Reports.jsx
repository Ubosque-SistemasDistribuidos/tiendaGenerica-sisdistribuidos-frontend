import React, { useState } from 'react'
import { apiService } from '../services/apiService'

export default function Reports() {
  const [reporteView, setReporteView] = useState(null)
  const [usuariosData, setUsuariosData] = useState([])
  const [clientesData, setClientesData] = useState([])
  const [ventasClienteData, setVentasClienteData] = useState([])
  const [reportError, setReportError] = useState('')
  const [reportLoading, setReportLoading] = useState(false)
  const [totalVentasGlobal, setTotalVentasGlobal] = useState(0)

  const formatCurrency = (value) => {
    const amount = Number(value || 0)
    return amount.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  }

  const handleCargarReporteUsuarios = async () => {
    setReportError('')
    setReportLoading(true)
    try {
      const usuarios = await apiService.getAll('/usuarios')
      setUsuariosData(Array.isArray(usuarios.results) ? usuarios.results : usuarios)
      setReporteView('usuarios')
    } catch (error) {
      setReportError(error.message)
    } finally {
      setReportLoading(false)
    }
  }

  const handleCargarReporteClientes = async () => {
    setReportError('')
    setReportLoading(true)
    try {
      const clientes = await apiService.getAll('/clientes')
      setClientesData(Array.isArray(clientes.results) ? clientes.results : clientes)
      setReporteView('clientes')
    } catch (error) {
      setReportError(error.message)
    } finally {
      setReportLoading(false)
    }
  }

  const handleCargarReporteVentasCliente = async () => {
    setReportError('')
    setReportLoading(true)
    try {
      const ventas = await apiService.getAll('/ventas')
      const ventasPorCliente = {}
      let total = 0

      const ventasArray = Array.isArray(ventas.results) ? ventas.results : ventas
      
      if (Array.isArray(ventasArray)) {
        ventasArray.forEach(venta => {
          const cedula = venta.cliente?.cedula || 'Sin cliente'
          const nombreCliente = venta.cliente?.nombreCliente || venta.nombreCliente || 'Desconocido'
          const totalVenta = venta.totalVenta || 0
          
          if (!ventasPorCliente[cedula]) {
            ventasPorCliente[cedula] = {
              cedula,
              nombreCliente: nombreCliente,
              totalVentas: 0,
              cantidadVentas: 0
            }
          }
          ventasPorCliente[cedula].totalVentas += totalVenta
          ventasPorCliente[cedula].cantidadVentas += 1
          total += totalVenta
        })
      }

      setVentasClienteData(Object.values(ventasPorCliente))
      setTotalVentasGlobal(total)
      setReporteView('ventasCliente')
    } catch (error) {
      setReportError(error.message)
    } finally {
      setReportLoading(false)
    }
  }

  if (!reporteView) {
    return (
      <div>
        <h3>Reportes</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          <button 
            onClick={handleCargarReporteUsuarios}
            style={{ padding: '12px', fontSize: '16px', cursor: 'pointer' }}
          >
            Listado de Usuarios
          </button>
          <button 
            onClick={handleCargarReporteClientes}
            style={{ padding: '12px', fontSize: '16px', cursor: 'pointer' }}
          >
            Listado de Clientes
          </button>
          <button 
            onClick={handleCargarReporteVentasCliente}
            style={{ padding: '12px', fontSize: '16px', cursor: 'pointer' }}
          >
            Total de Ventas por Cliente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button 
        onClick={() => setReporteView(null)}
        style={{ marginBottom: '12px', padding: '8px 16px', cursor: 'pointer' }}
      >
        ← Volver
      </button>

      {reportError && (
        <div style={{ color: '#c44', marginTop: '12px', padding: '12px', backgroundColor: '#f8d7da', borderRadius: '6px' }}>
          Error: {reportError}
        </div>
      )}

      {reportLoading && (
        <div style={{ padding: '20px', textAlign: 'center' }}>Cargando...</div>
      )}

      {!reportLoading && reporteView === 'usuarios' && (
        <div>
          <h4>Listado de Usuarios</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Cédula</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nombre</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Correo Electrónico</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {usuariosData.length > 0 ? (
                usuariosData.map((usuario, idx) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{usuario.cedula}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{usuario.nombreCompleto}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{usuario.email}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{usuario.usuario}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!reportLoading && reporteView === 'clientes' && (
        <div>
          <h4>Listado de Clientes</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Cédula</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nombre</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Correo Electrónico</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Dirección</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {clientesData.length > 0 ? (
                clientesData.map((cliente, idx) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{cliente.cedulaCliente}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{cliente.nombreCliente}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{cliente.emailCliente}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{cliente.direccionCliente}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{cliente.telefonoCliente}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                    No hay clientes registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!reportLoading && reporteView === 'ventasCliente' && (
        <div>
          <h4>Total de Ventas por Cliente</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Cédula</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nombre</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Valor Total Ventas</th>
              </tr>
            </thead>
            <tbody>
              {ventasClienteData.length > 0 ? (
                ventasClienteData.map((venta, idx) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{venta.cedula}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{venta.nombreCliente}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                      {formatCurrency(venta.totalVentas)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                    No hay ventas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
            <strong>Total Ventas: {formatCurrency(totalVentasGlobal)}</strong>
          </div>
        </div>
      )}
    </div>
  )
}
