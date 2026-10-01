import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { pedirJson } from '../api'

function Registro() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  async function registrar(e) {
    e.preventDefault()
    setError("")
    try {
      await pedirJson("/users", "POST", { name: name, email: email, password: password })
      // despues de registrarse se manda al login
      navigate("/login?registrado=1")
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form className="formulario" onSubmit={registrar}>
      <h1>Crear cuenta</h1>
      <label>Nombre</label>
      <input value={name} onChange={function (e) { setName(e.target.value) }} required />
      <label>Correo</label>
      <input type="email" value={email} onChange={function (e) { setEmail(e.target.value) }} required />
      <label>Contrasena</label>
      <input type="password" value={password} onChange={function (e) { setPassword(e.target.value) }} required minLength={6} />
      {error && <p className="error">{error}</p>}
      <button className="boton" type="submit">Registrarse</button>
      <p>Ya tienes cuenta? <Link to="/login">Inicia sesion</Link></p>
    </form>
  )
}

export default Registro
