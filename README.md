# Plataforma de Videos - Arquitectura en la Nube (AWS)

Examen practico del primer parcial de Arquitectura en la Nube para Tecnologias de la Informacion (UIDE).
Es una plataforma tipo YouTube: los usuarios se registran, inician sesion, publican videos con su
miniatura, ven el catalogo, reproducen videos, comentan y ven recomendados.

## URLs

- Frontend (SPA en S3): http://leandro-videoapp-frontend.s3-website-us-east-1.amazonaws.com
- API (FastAPI en EC2): http://52.87.151.199:8000
- Documentacion de la API: http://52.87.151.199:8000/docs
- Verificacion de la conexion con RDS: http://52.87.151.199:8000/check_db

## Arquitectura

```
Navegador --HTTP--> S3 frontend (sitio estatico, contenido de dist/)
    |
    +--HTTP :8000--> EC2 (FastAPI + pm2, con IAM Role)
                        |--5432--> RDS PostgreSQL (sin acceso publico)
                        +--boto3--> S3 videos / S3 miniaturas
```

1. El frontend en React se compila con `npm run build` y solo el contenido de `dist/` se sube al bucket del frontend.
2. El navegador llama a la API que corre en la EC2.
3. Cuando se publica un video, la API sube el MP4 y la miniatura a sus buckets con boto3 y en RDS solo guarda las URLs.
4. Los videos y miniaturas se leen directo desde S3 (lectura publica, sin permiso para escribir).

## Infraestructura en AWS (us-east-1)

| Recurso | Configuracion |
|---------|---------------|
| EC2 | `videoapp-api`, Ubuntu Server 26.04 LTS, t3.micro, IP publica 52.87.151.199 |
| IAM Role | `videoapp-ec2-role`, solo `s3:PutObject` y `s3:DeleteObject` en los buckets de videos y miniaturas |
| RDS | `videoapp-db`, PostgreSQL 18.3, db.t4g.micro, base `videoapp_db`, sin acceso publico, backups de 1 dia |
| SG de la EC2 | `videoapp-ec2-sg`: 22 (SSH, solo mi IP) y 8000 (API) |
| SG del RDS | `videoapp-rds-sg`: 5432 solo desde `videoapp-ec2-sg` |
| Bucket frontend | `leandro-videoapp-frontend`, alojamiento de sitio web estatico (index y error = index.html) |
| Bucket videos | `leandro-videoapp-videos`, archivos MP4 de maximo 100 MB |
| Bucket miniaturas | `leandro-videoapp-miniaturas`, imagenes JPG o PNG |
| VPC | la predeterminada, la EC2 y el RDS estan en la misma VPC |

Los tres buckets tienen una politica que solo permite `s3:GetObject` al publico. Nadie puede subir ni
borrar archivos desde afuera: eso solo lo hace la EC2 con el IAM Role.

## Seguridad

- No hay credenciales en el codigo: todo se lee de variables de entorno (`.env`, que no se sube al repo).
- En la EC2 no hay claves de AWS: boto3 usa los permisos del IAM Role.
- El RDS no tiene acceso publico y su SG solo acepta conexiones desde el SG de la EC2.
- Las contrasenas se guardan con hash (bcrypt) y el login devuelve un token JWT.
- Solo el dueno de un video puede editarlo o eliminarlo (403 si no es suyo).
- El CORS de la API solo permite el origen del bucket del frontend.

## Base de datos

- **users**: id, name, email, password_hash
- **videos**: id, title, description, video_url, thumbnail_url, views, user_id, created_at
- **comments**: id, content, user_id, video_id, created_at

Se agrego `created_at` a videos porque la pagina principal muestra la fecha. La tabla se llama `users`
porque `user` es palabra reservada en PostgreSQL.

## Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/users` | registrar usuario |
| POST | `/login` | iniciar sesion (devuelve token) |
| GET | `/users/{id}` | perfil con cantidad y lista de videos |
| POST | `/videos` | publicar video (requiere token) |
| GET | `/videos` | listar videos |
| GET | `/videos/{id}` | obtener un video (suma una vista) |
| PUT | `/videos/{id}` | editar titulo o descripcion (solo el dueno) |
| DELETE | `/videos/{id}` | eliminar video y sus archivos (solo el dueno) |
| GET | `/videos/{id}/recommended` | recomendados (los mas vistos) |
| POST | `/videos/{id}/comments` | comentar (requiere token) |
| GET | `/videos/{id}/comments` | listar comentarios |
| GET | `/check_db` | comprueba la conexion con RDS |

## Estructura

```
plataforma-videos/
├── backend/
│   ├── config.py        # lee las variables de entorno
│   ├── db.py            # engine y sesion
│   ├── models.py        # tablas
│   ├── security.py      # bcrypt y JWT
│   ├── s3.py            # subir y borrar archivos con boto3
│   ├── routers/         # users, videos, comments
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api.js       # llamadas a la API
    │   ├── components/  # Navbar, TarjetaVideo
    │   └── pages/       # Registro, Login, Principal, Reproductor, Perfil
    ├── package.json
    └── .env.example
```

## Variables de entorno

**backend/.env** (se crea a partir de `.env.example`)

| Variable | Descripcion |
|----------|-------------|
| `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME` | conexion a RDS |
| `AWS_REGION` | region de los buckets |
| `BUCKET_VIDEOS`, `BUCKET_MINIATURAS` | nombres de los buckets |
| `JWT_SECRET` | secreto para firmar los tokens |
| `FRONTEND_URL` | origen permitido en CORS |

**frontend/.env**

| Variable | Descripcion |
|----------|-------------|
| `VITE_API_URL` | URL de la API en la EC2 |

## Despliegue

**Backend (en la EC2)**
```bash
git clone https://github.com/Lean131X/plataforma-videos.git
cd plataforma-videos/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
nano .env    # se llena con los valores reales
pm2 start venv/bin/uvicorn --name api --interpreter venv/bin/python -- main:app --host 0.0.0.0 --port 8000
pm2 save
```

**Frontend**
```bash
cd frontend
cp .env.example .env
npm install
npm run build
```
Despues se sube el contenido de `dist/` (index.html y la carpeta assets) al bucket del frontend.

## Tecnologias

FastAPI, SQLModel, psycopg, boto3, bcrypt, PyJWT, React, Vite, react-router-dom,
Amazon EC2, Amazon RDS (PostgreSQL), Amazon S3, IAM, pm2.
