import uuid
from sqlalchemy import Column, Numeric, Text, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from models.base import Base

class Preparacion(Base):
    __tablename__ = "preparaciones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    nombre = Column(Text, nullable=False)
    descripcion = Column(Text, nullable=True)
    instrucciones = Column(Text, nullable=True)

    # Relación con la tabla intermedia
    ingredientes = relationship("IngredientePreparacion", back_populates="preparacion", cascade="all, delete-orphan")


class IngredientePreparacion(Base):
    __tablename__ = "ingredientes_preparacion"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    preparacion_id = Column(UUID(as_uuid=True), ForeignKey("preparaciones.id", ondelete="CASCADE"), nullable=False)
    alimento_id = Column(UUID(as_uuid=True), ForeignKey("alimentos.id", ondelete="CASCADE"), nullable=False)
    cantidad_g = Column(Numeric(6, 2), nullable=False)

    # Relaciones
    preparacion = relationship("Preparacion", back_populates="ingredientes")
    alimento = relationship("Alimento", back_populates="preparaciones_vinculadas")
