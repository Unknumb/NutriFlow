from fastapi import FastAPI
from api.alimentos import router as alimentos_router
from api.calculos import router as calculos_router
from api.pautas import router as pautas_router
from api.pizarra import router as pizarra_router

app = FastAPI(title="NutriFlow Math Engine")

# Aquí le decimos a FastAPI que incluya las rutas que creaste
app.include_router(alimentos_router, prefix="/api")
app.include_router(calculos_router, prefix="/api/calculadoras")
app.include_router(pautas_router, prefix="/api")
app.include_router(pizarra_router, prefix="/api")


@app.get("/")
def home():
    return {"status": "online", "message": "Motor NutriFlow operando"}