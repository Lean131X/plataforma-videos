import { useState, useEffect } from 'react'
import { pedir } from '../api'
import TarjetaVideo from '../components/TarjetaVideo'

function Principal() {
  const [videos, setVideos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")

  // al abrir la pagina se piden los videos a la api
  useEffect(function () {
    pedir("/videos")
      .then(function (datos) {
        setVideos(datos)
      })
      .catch(function (err) {
        setError(err.message)
      })
      .finally(function () {
        setCargando(false)
      })
  }, [])

  if (cargando) {
    return <p className="mensaje">Cargando videos...</p>
  }
  if (error) {
    return <p className="error">{error}</p>
  }

  return (
    <div>
      <h1>Videos</h1>
      {videos.length === 0 && <p className="mensaje">Todavia no hay videos publicados</p>}
      <div className="grilla">
        {videos.map(function (video) {
          return <TarjetaVideo key={video.id} video={video} />
        })}
      </div>
    </div>
  )
}

export default Principal
