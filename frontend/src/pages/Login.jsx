import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { pedirJson, guardarSesion } from '../api'

function Login({ setUsuario }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const [parametros] = useSearchParams()

  async function ingresar(e) {
    e.preventDefault()
    setError("")
    try {
      const datos = await pedirJson("/login", "POST", { email: email, password: password })
      // se guarda el token para usarlo en las demas peticiones
      guardarSesion(datos.token, datos.user)
      setUsuario(datos.user)
      navigate("/")
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form className="formulario" onSubmit={ingresar}>
      <h1>Iniciar sesion</h1>
      {parametros.get("registrado") && <p className="exito">Cuenta creada, ahora inicia sesion</p>}
      <label>Correo</label>
      <input type="email" value={email} onChange={function (e) { setEmail(e.target.value) }} required />
      <label>Contrasena</label>
      <input type="password" value={password} onChange={function (e) { setPassword(e.target.value) }} required />
      {error && <p className="error">{error}</p>}
      <button className="boton" type="submit">Entrar</button>
      <p>No tienes cuenta? <Link to="/registro">Registrate</Link></p>
    </form>
  )
}

export default Login
