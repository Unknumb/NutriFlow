import uuid
from sqlalchemy import Column, Numeric, Text, text, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from models.base import Base

class Alimento(Base):
    __tablename__ = "alimentos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    nombre = Column(Text, nullable=False)
    marca = Column(Text, nullable=True)
    categoria = Column(Text, nullable=True)
    restricciones = Column(ARRAY(Text), default=[])
    calorias_100g = Column(Numeric(6, 2), nullable=False)
    proteinas_100g = Column(Numeric(6, 2), nullable=False)
    carbohidratos_100g = Column(Numeric(6, 2), nullable=False)
    grasas_100g = Column(Numeric(6, 2), nullable=False)

    # Relación a ingredientes_preparacion (definido como string para evitar dependencias circulares)
    preparaciones_vinculadas = relationship("IngredientePreparacion", back_populates="alimento")

    def __repr__(self):
        return f"<Alimento(nombre='{self.nombre}', marca='{self.marca}', categoria='{self.categoria}')>"