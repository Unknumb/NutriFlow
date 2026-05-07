from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from api.alimentos import router as alimentos_router
from api.calculos import router as calculos_router
from api.pautas import router as pautas_router
from api.pizarra import router as pizarra_router
from api.menus import router as menus_router

app = FastAPI(title=settings.PROJECT_NAME)

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=204)

# Configuración de CORS
origins = [
    "http://localhost:5173",  # Vite (React/Vue/Svelte) default
    "http://localhost:3000",  # Next.js / Create React App default
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Manejador Global de Excepciones No Controladas (500)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc)
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