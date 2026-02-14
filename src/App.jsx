import React, { useState } from 'react'
import Login from './components/Login'
import Menu from './components/Menu'

export default function App() {
  const [user, setUser] = useState(null)

  const handleLogin = (username) => setUser({ name: username })
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
