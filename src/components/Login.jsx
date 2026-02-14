import React, { useState } from 'react'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const trimmed = username.trim()
    // Validación combinada: si usuario no es 'admininicial' o la contraseña es incorrecta
    const passwordWrong = password !== '' && password !== 'admin123456'
    if (trimmed !== 'admininicial' || passwordWrong) {
      setError('Usuario o contraseña incorrecto')
      return
    }
    setError('')
    onLogin(username.trim())
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
        />
      </label>
      <label>
        Contraseña
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Digite su contraseña..."
        />
      </label>
      {error && <div className="error">{error}</div>}
      <button type="submit">Entrar</button>
    </form>
  )
}
