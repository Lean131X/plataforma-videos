import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { obtenerUsuario } from './api'
import Navbar from './components/Navbar'
import Principal from './pages/Principal'
import Acceso from './pages/Acceso'
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
          <Route path="/login" element={<Acceso setUsuario={setUsuario} />} />
          <Route path="/videos/:id" element={<Reproductor usuario={usuario} />} />
          <Route path="/perfil" element={<Perfil usuario={usuario} />} />
          {/* cualquier otra ruta vuelve a la principal */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
