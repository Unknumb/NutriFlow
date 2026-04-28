from fastapi import FastAPI
from api.alimentos import router as alimentos_router

app = FastAPI(title="NutriFlow Math Engine")

# Aquí le decimos a FastAPI que incluya las rutas que creaste
app.include_router(alimentos_router, prefix="/api")

@app.get("/")
def home():
    return {"status": "online", "message": "Motor NutriFlow operando"}