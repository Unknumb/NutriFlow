import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings

logger = logging.getLogger(__name__)
from api.alimentos import router as alimentos_router
from api.calculos import router as calculos_router
from api.pautas import router as pautas_router
from api.pizarra import router as pizarra_router
from api.menus import router as menus_router

app = FastAPI(title=settings.PROJECT_NAME)

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=204)

# Configuración de CORS. A los orígenes de desarrollo (localhost) se suman los
# definidos en ALLOWED_ORIGINS (separados por coma) para el entorno desplegado.
origins = [
    "http://localhost:5173",  # Vite (React/Vue/Svelte) default
    "http://localhost:3000",  # Next.js / Create React App default
]
if settings.ALLOWED_ORIGINS:
    origins += [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# Límite de tamaño de payload (1 MB): evita abuso/DoS enviando cuerpos enormes
# a los endpoints de cálculo (p. ej. /cuadrador o distribución de macros).
MAX_BODY_BYTES = 1 * 1024 * 1024


@app.middleware("http")
async def limitar_tamano_payload(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length is not None:
        try:
            if int(content_length) > MAX_BODY_BYTES:
                return JSONResponse(
                    status_code=413,
                    content={
                        "error": "Payload Too Large",
                        "message": "El cuerpo de la petición excede el tamaño permitido.",
                    },
                )
        except ValueError:
            return JSONResponse(
                status_code=400,
                content={
                    "error": "Bad Request",
                    "message": "Cabecera Content-Length inválida.",
                },
            )
    return await call_next(request)

# Manejador Global de Excepciones No Controladas (500)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Logueamos el error internamente (solo visible en los logs del servidor),
    # con traza completa para diagnóstico. El cliente solo recibe un mensaje genérico.
    logger.error("Excepción no controlada procesando la petición", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "Se ha producido un error inesperado en el servidor."
        }
    )

# Inclusión de rutas
app.include_router(alimentos_router, prefix="/api")
app.include_router(calculos_router, prefix="/api/calculadoras")
app.include_router(pautas_router, prefix="/api")
app.include_router(pizarra_router, prefix="/api")
app.include_router(menus_router, prefix="/api")

@app.get("/")
def home():
    return {"status": "online", "message": f"{settings.PROJECT_NAME} operando correctamente"}