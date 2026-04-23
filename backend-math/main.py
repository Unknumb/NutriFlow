from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="NutriFlow Math Engine")

# Modelo de datos para probar la entrada de un paciente
class PacienteTest(BaseModel):
    nombre: str
    peso: float
    talla: int
    edad: int
    sexo: str  # "M" o "F"

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Bienvenido al Motor Matemático de NutriFlow",
        "version": "1.0.0 (Python 3.13)"
    }

@app.post("/test-tmb")
def test_calculo(paciente: PacienteTest):
    # Ejemplo rápido: Harris-Benedict simplificado para testear
    if paciente.sexo.upper() == "M":
        tmb_estimada = (10 * paciente.peso) + (6.25 * paciente.talla) - (5 * paciente.edad) + 5
    else:
        tmb_estimada = (10 * paciente.peso) + (6.25 * paciente.talla) - (5 * paciente.edad) - 161
        
    return {
        "paciente": paciente.nombre,
        "tmb_calculada": round(tmb_estimada, 2),
        "nota": "Este es un cálculo de prueba para validar el endpoint."
    }