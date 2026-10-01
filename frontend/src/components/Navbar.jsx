import { Link, useNavigate } from 'react-router-dom'
import { cerrarSesion } from '../api'

function Navbar({ usuario, setUsuario }) {
  const navigate = useNavigate()

  function salir() {
    cerrarSesion()
    setUsuario(null)
    navigate("/")
  }

  return (
    <nav className="navbar">
      <Link to="/" className="logo">VideoApp</Link>
      <div className="navbar-links">
        {usuario ? (
          <>
            <span>Hola, {usuario.name}</span>
            <Link to="/perfil">Mi perfil</Link>
            <button className="boton-secundario" onClick={salir}>Cerrar sesion</button>
          </>
        ) : (
          <>
            <Link to="/login">Iniciar sesion</Link>
            <Link to="/login?modo=registro" className="boton">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
