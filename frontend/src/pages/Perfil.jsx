import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { pedir, pedirJson, formatearFecha } from '../api'

const TAMANO_MAXIMO = 100 * 1024 * 1024  // 100 MB

function Perfil({ usuario }) {
  const [perfil, setPerfil] = useState(null)
  // datos del formulario para publicar
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [archivoVideo, setArchivoVideo] = useState(null)
  const [archivoMiniatura, setArchivoMiniatura] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const [mensaje, setMensaje] = useState("")
  // para editar un video
  const [editandoId, setEditandoId] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")

  function cargarPerfil() {
    pedir("/users/" + usuario.id)
      .then(function (datos) { setPerfil(datos) })
      .catch(function (err) { setMensaje(err.message) })
  }

  useEffect(function () {
    if (usuario) {
      cargarPerfil()
    }
  }, [usuario])

  // si no hay sesion se manda al login
  if (!usuario) {
    return <Navigate to="/login" />
  }

  async function publicar(e) {
    e.preventDefault()
    setMensaje("")
    if (archivoVideo.size > TAMANO_MAXIMO) {
      setMensaje("El video no puede pesar mas de 100 MB")
      return
    }

    // los archivos se mandan con FormData, no con json
    const datos = new FormData()
    datos.append("title", title)
    datos.append("description", description)
    datos.append("video", archivoVideo)
    datos.append("thumbnail", archivoMiniatura)

    setSubiendo(true)
    try {
      await pedir("/videos", { method: "POST", body: datos })
      setMensaje("Video publicado")
      setTitle("")
      setDescription("")
      e.target.reset()
      cargarPerfil()
    } catch (err) {
      setMensaje(err.message)
    }
    setSubiendo(false)
  }

  function empezarEdicion(video) {
    setEditandoId(video.id)
    setEditTitle(video.title)
    setEditDescription(video.description)
  }

  async function guardarEdicion(id) {
    try {
      await pedirJson("/videos/" + id, "PUT", { title: editTitle, description: editDescription })
      setEditandoId(null)
      cargarPerfil()
    } catch (err) {
      alert(err.message)
    }
  }

  async function eliminar(id) {
    if (!confirm("Seguro que quieres eliminar este video?")) {
      return
    }
    try {
      await pedir("/videos/" + id, { method: "DELETE" })
      cargarPerfil()
    } catch (err) {
      alert(err.message)
    }
  }

  if (!perfil) {
    return <p className="mensaje">Cargando perfil...</p>
  }

  return (
    <div>
      <div className="perfil-info">
        <h1>{perfil.name}</h1>
        <p>{perfil.email}</p>
        <p><strong>{perfil.total_videos}</strong> videos publicados</p>
      </div>

      <form className="formulario formulario-ancho" onSubmit={publicar}>
        <h2>Publicar video</h2>
        <label>Titulo</label>
        <input value={title} onChange={function (e) { setTitle(e.target.value) }} required />
        <label>Descripcion</label>
        <textarea value={description} onChange={function (e) { setDescription(e.target.value) }} />
        <label>Video (MP4, maximo 100 MB)</label>
        <input type="file" accept="video/mp4" onChange={function (e) { setArchivoVideo(e.target.files[0]) }} required />
        <label>Miniatura (JPG o PNG)</label>
        <input type="file" accept="image/jpeg,image/png" onChange={function (e) { setArchivoMiniatura(e.target.files[0]) }} required />
        {mensaje && <p className="mensaje">{mensaje}</p>}
        <button className="boton" type="submit" disabled={subiendo}>
          {subiendo ? "Subiendo..." : "Publicar"}
        </button>
      </form>

      <h2>Mis videos</h2>
      {perfil.videos.length === 0 && <p className="mensaje">Todavia no publicas videos</p>}
      {perfil.videos.map(function (video) {
        return (
          <div key={video.id} className="mi-video">
            <img src={video.thumbnail_url} alt={video.title} className="miniatura-chica" />
            {editandoId === video.id ? (
              <div className="mi-video-info">
                <input value={editTitle} onChange={function (e) { setEditTitle(e.target.value) }} />
                <textarea value={editDescription} onChange={function (e) { setEditDescription(e.target.value) }} />
                <div className="botones">
                  <button className="boton" onClick={function () { guardarEdicion(video.id) }}>Guardar</button>
                  <button className="boton-secundario" onClick={function () { setEditandoId(null) }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="mi-video-info">
                <Link to={"/videos/" + video.id}><h3>{video.title}</h3></Link>
                <p>{video.views} vistas · {formatearFecha(video.created_at)}</p>
                <div className="botones">
                  <button className="boton-secundario" onClick={function () { empezarEdicion(video) }}>Editar</button>
                  <button className="boton-peligro" onClick={function () { eliminar(video.id) }}>Eliminar</button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Perfil
