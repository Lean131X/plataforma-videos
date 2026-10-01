import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { pedirJson, guardarSesion } from '../api'

// una sola pagina para crear cuenta e iniciar sesion (pagina 1 del enunciado)
function Acceso({ setUsuario }) {
  const [parametros, setParametros] = useSearchParams()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [exito, setExito] = useState("")
  const navigate = useNavigate()

  // el modo sale de la url: /login o /login?modo=registro
  let modo = "login"
  if (parametros.get("modo") === "registro") {
    modo = "registro"
  }

  function cambiarModo(nuevoModo) {
    setError("")
    setExito("")
    if (nuevoModo === "registro") {
      setParametros({ modo: "registro" })
    } else {
      setParametros({})
    }
  }

  async function enviar(e) {
    e.preventDefault()
    setError("")
    setExito("")
    try {
      if (modo === "registro") {
        await pedirJson("/users", "POST", { name: name, email: email, password: password })
        // despues de registrarse se cambia a iniciar sesion
        setPassword("")
        cambiarModo("login")
        setExito("Cuenta creada, ahora inicia sesion")
      } else {
        const datos = await pedirJson("/login", "POST", { email: email, password: password })
        // se guarda el token para usarlo en las demas peticiones
        guardarSesion(datos.token, datos.user)
        setUsuario(datos.user)
        navigate("/")
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <div className="pestanas">
        <button type="button" className={modo === "login" ? "pestana activa" : "pestana"} onClick={function () { cambiarModo("login") }}>
          Iniciar sesion
        </button>
        <button type="button" className={modo === "registro" ? "pestana activa" : "pestana"} onClick={function () { cambiarModo("registro") }}>
          Crear cuenta
        </button>
      </div>

      {modo === "registro" && (
        <>
          <label>Nombre</label>
          <input value={name} onChange={function (e) { setName(e.target.value) }} required />
        </>
      )}
      <label>Correo</label>
      <input type="email" value={email} onChange={function (e) { setEmail(e.target.value) }} required />
      <label>Contrasena</label>
      <input type="password" value={password} onChange={function (e) { setPassword(e.target.value) }} required minLength={modo === "registro" ? 6 : 1} />

      {exito && <p className="exito">{exito}</p>}
      {error && <p className="error">{error}</p>}
      <button className="boton" type="submit">
        {modo === "registro" ? "Registrarse" : "Entrar"}
      </button>
    </form>
  )
}

export default Acceso
