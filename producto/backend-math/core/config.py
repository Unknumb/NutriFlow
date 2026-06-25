from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    """
    Gestión centralizada de variables de entorno usando pydantic-settings.
    """
    PROJECT_NAME: str = "NutriFlow Math Engine"
    # Por defecto apunta a SQLite, pero leerá DATABASE_URL desde .env si existe.
    DATABASE_URL: str = "sqlite:///./nutriflow.db"
    # Orígenes adicionales permitidos para CORS (separados por coma), p.ej. el
    # dominio del frontend y del backend-core desplegados. Se suman a los de localhost.
    ALLOWED_ORIGINS: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

@lru_cache()
def get_settings() -> Settings:
    """
    Retorna la configuración instanciada de manera cacheada para rendimiento.
    """
    return Settings()

settings = get_settings()
