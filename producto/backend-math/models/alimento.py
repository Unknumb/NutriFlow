import uuid
from sqlalchemy import Column, Numeric, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base

# Esto le dice a SQLAlchemy cómo mapear la tabla
Base = declarative_base()

class Alimento(Base):
    __tablename__ = "alimentos"

    # Mapeo exacto de tus columnas
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    nombre = Column(Text, nullable=False, unique=True)
    categoria = Column(Text, nullable=True)
    calorias_100g = Column(Numeric(6, 2), nullable=False)
    proteinas_100g = Column(Numeric(6, 2), nullable=False)
    carbohidratos_100g = Column(Numeric(6, 2), nullable=False)
    grasas_100g = Column(Numeric(6, 2), nullable=False)

    def __repr__(self):
        return f"<Alimento(nombre='{self.nombre}', categoria='{self.categoria}')>"