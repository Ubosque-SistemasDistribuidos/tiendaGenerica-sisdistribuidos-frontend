import React, { useState } from 'react'
import { apiService } from '../services/apiService'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    
    const trimmed = username.trim()
    if (!trimmed || !password) {
      setError('Usuario y contraseña son requeridos')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Validar contra tabla de usuarios usando apiService
      const user = await apiService.loginUser(trimmed, password)
      // Pasar usuario completo (incluye cedula, email, nombreCompleto, etc)
      onLogin(user)
    } catch (err) {
      setError(err.message || 'Usuario o contraseña incorrecto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="login" onSubmit={submit}>
      <h2>Login - Tienda Genérica</h2>
      <label>
        Usuario
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Digite su usuario..."
          disabled={loading}
        />
      </label>
      <label>
        Contraseña
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Digite su contraseña..."
          disabled={loading}
        />
      </label>
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>{loading ? 'Validando...' : 'Entrar'}</button>
    </form>
  )
}
