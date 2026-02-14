import React, { useState } from 'react'

export default function Menu({ user, onLogout }) {
  const [view, setView] = useState('inicio')

  const renderContent = () => {
    switch (view) {
      case 'usuarios':
        return (
          <div>
            <h3>Gestión de usuarios</h3>
            <p>Área para crear/editar/consultar usuarios.</p>
          </div>
        )
      case 'clientes':
        return (
          <div>
            <h3>Gestión de clientes</h3>
            <p>Área para crear/editar/consultar clientes.</p>
          </div>
        )
      case 'proveedores':
        return (
          <div>
            <h3>Gestión de proveedores</h3>
            <p>Área para crear/editar/consultar proveedores.</p>
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

