import json
import logging
from fastapi import APIRouter, Depends
from fastapi.responses import Response
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from core.db import get_db
from models.alimento import Alimento
from upstash_redis import Redis

logger = logging.getLogger(__name__)

# APIRouter nos permite separar las rutas en distintos archivos
router = APIRouter()

try:
    redis_client = Redis.from_env()
except Exception as e:
    logger.warning("No se pudo inicializar Upstash Redis: %s", e)
    redis_client = None

@router.get("/alimentos")
def obtener_alimentos(db: Session = Depends(get_db)):
    cache_key = "alimentos:catalogo_completo"

    if redis_client:
        try:
            cached = redis_client.get(cache_key)
            if cached:
                # Retornamos directamente el string JSON para máxima velocidad (0 latencia de parsing)
                return Response(content=cached, media_type="application/json")
        except Exception as e:
            logger.warning("Redis get error (ignorado): %s", e)

    # ¡Aquí ocurre la magia! Usamos el molde de SQLAlchemy para buscar todo
    lista_alimentos = db.query(Alimento).all()

    if redis_client:
        try:
            # Serializamos los objetos SQLAlchemy a diccionarios y guardamos en Redis por 7 días
            alimentos_dict = jsonable_encoder(lista_alimentos)
            redis_client.set(cache_key, json.dumps(alimentos_dict), ex=604800)
        except Exception as e:
            logger.warning("Redis set error (ignorado): %s", e)

    return lista_alimentos
