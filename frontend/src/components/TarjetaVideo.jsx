import { Link } from 'react-router-dom'
import { formatearFecha } from '../api'

// tarjeta que se usa en la principal y en los recomendados
function TarjetaVideo({ video }) {
  return (
    <Link to={"/videos/" + video.id} className="tarjeta">
      <img src={video.thumbnail_url} alt={video.title} className="miniatura" />
      <div className="tarjeta-info">
        <h3>{video.title}</h3>
        <p>{video.user_name}</p>
        <p>{video.views} vistas · {formatearFecha(video.created_at)}</p>
      </div>
    </Link>
  )
}

export default TarjetaVideo
