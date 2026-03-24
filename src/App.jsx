import React, { useState } from 'react'
import Login from './components/Login'
import Menu from './components/Menu'

export default function App() {
  const [user, setUser] = useState(null)

  const handleLogin = (userData) => {
    // userData contiene: { id, cedula, usuario, nombreCompleto, email, password: ... }
    // Guardar usuario completo para acceso en otros componentes
    setUser({
      id: userData.id,
      cedula: userData.cedula,
      name: userData.usuario || userData.nombreCompleto,
      usuario: userData.usuario,
      nombreCompleto: userData.nombreCompleto,
      email: userData.email
    })
  }
  const handleLogout = () => setUser(null)

  return (
    <div className="app">
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Menu user={user} onLogout={handleLogout} />
      )}
    </div>
  )
}
