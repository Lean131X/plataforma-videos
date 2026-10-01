import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { pedir, pedirJson, formatearFecha } from '../api'
import TarjetaVideo from '../components/TarjetaVideo'

function Reproductor({ usuario }) {
  const { id } = useParams()
  const [video, setVideo] = useState(null)
  const [comentarios, setComentarios] = useState([])
  const [recomendados, setRecomendados] = useState([])
  const [texto, setTexto] = useState("")
  const [error, setError] = useState("")

  // se vuelve a cargar cada vez que cambia el id (al hacer clic en un recomendado)
  useEffect(function () {
    setError("")
    pedir("/videos/" + id)
      .then(function (datos) { setVideo(datos) })
      .catch(function (err) { setError(err.message) })
    pedir("/videos/" + id + "/comments")
      .then(function (datos) { setComentarios(datos) })
      .catch(function () { setComentarios([]) })
    pedir("/videos/" + id + "/recommended")
      .then(function (datos) { setRecomendados(datos) })
      .catch(function () { setRecomendados([]) })
    window.scrollTo(0, 0)
  }, [id])

  async function comentar(e) {
    e.preventDefault()
    try {
      const nuevo = await pedirJson("/videos/" + id + "/comments", "POST", { content: texto })
      setComentarios(comentarios.concat(nuevo))
      setTexto("")
    } catch (err) {
      alert(err.message)
    }
  }

  if (error) {
    return <p className="error">{error}</p>
  }
  if (!video) {
    return <p className="mensaje">Cargando...</p>
  }

  return (
    <div className="reproductor">
      <div className="reproductor-principal">
        <video key={video.id} src={video.video_url} controls autoPlay className="video" />
        <h1>{video.title}</h1>
        <p className="datos-video">
          {video.user_name} · {video.views} vistas · {formatearFecha(video.created_at)}
        </p>
        <p className="descripcion">{video.description ? video.description : "Sin descripcion"}</p>

        <h2>Comentarios ({comentarios.length})</h2>
        {usuario ? (
          <form className="form-comentario" onSubmit={comentar}>
            <input
              value={texto}
              onChange={function (e) { setTexto(e.target.value) }}
              placeholder="Escribe un comentario..."
              required
            />
            <button className="boton" type="submit">Comentar</button>
          </form>
        ) : (
          <p><Link to="/login">Inicia sesion</Link> para comentar</p>
        )}
        {comentarios.map(function (comentario) {
          return (
            <div key={comentario.id} className="comentario">
              <strong>{comentario.user_name}</strong>
              <span> · {formatearFecha(comentario.created_at)}</span>
              <p>{comentario.content}</p>
            </div>
          )
        })}
      </div>

      <aside className="recomendados">
        <h2>Recomendados</h2>
        {recomendados.length === 0 && <p className="mensaje">No hay otros videos</p>}
        {recomendados.map(function (rec) {
          return <TarjetaVideo key={rec.id} video={rec} />
        })}
      </aside>
    </div>
  )
}

export default Reproductor
