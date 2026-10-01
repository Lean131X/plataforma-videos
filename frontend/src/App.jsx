import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { obtenerUsuario } from './api'
import Navbar from './components/Navbar'
import Principal from './pages/Principal'
import Registro from './pages/Registro'
import Login from './pages/Login'
import Reproductor from './pages/Reproductor'
import Perfil from './pages/Perfil'

function App() {
  // el usuario se guarda aca para que el navbar se actualice al hacer login
  const [usuario, setUsuario] = useState(obtenerUsuario())

  return (
    <div>
      <Navbar usuario={usuario} setUsuario={setUsuario} />
      <main className="contenido">
        <Routes>
          <Route path="/" element={<Principal />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/login" element={<Login setUsuario={setUsuario} />} />
          <Route path="/videos/:id" element={<Reproductor usuario={usuario} />} />
          <Route path="/perfil" element={<Perfil usuario={usuario} />} />
          <Route path="*" element={<p className="mensaje">Pagina no encontrada</p>} />
        </Routes>
      </main>
    </div>
  )
}

export default App
