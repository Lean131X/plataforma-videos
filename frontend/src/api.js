// la url de la api viene de la variable de entorno (archivo .env)
const API = import.meta.env.VITE_API_URL

export function obtenerToken() {
  return localStorage.getItem("token")
}

export function obtenerUsuario() {
  const usuario = localStorage.getItem("usuario")
  if (usuario) {
    return JSON.parse(usuario)
  }
  return null
}

export function guardarSesion(token, usuario) {
  localStorage.setItem("token", token)
  localStorage.setItem("usuario", JSON.stringify(usuario))
}

export function cerrarSesion() {
  localStorage.removeItem("token")
  localStorage.removeItem("usuario")
}

// funcion general para llamar a la api
export async function pedir(ruta, opciones) {
  if (!opciones) {
    opciones = {}
  }
  if (!opciones.headers) {
    opciones.headers = {}
  }

  // si hay sesion se manda el token
  const token = obtenerToken()
  if (token) {
    opciones.headers["Authorization"] = "Bearer " + token
  }

  const respuesta = await fetch(API + ruta, opciones)
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    let mensaje = "Ocurrio un error"
    if (typeof datos.detail === "string") {
      mensaje = datos.detail
    }
    throw new Error(mensaje)
  }
  return datos
}

// para mandar json (login, registro, comentarios, editar)
export function pedirJson(ruta, metodo, cuerpo) {
  return pedir(ruta, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo)
  })
}

export function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString("es-EC")
}
