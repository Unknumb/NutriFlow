#!/bin/bash
# ==============================================================================
# NutriFlow SaaS - Script de Restauración y Sincronización para Entorno de Pruebas
# Autor: Álvaro Uribe
# ==============================================================================

DB_NAME="postgres"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

echo "=== PROTOCOLO DE ACTUALIZACIÓN DE ENTORNO DE PRUEBAS ==="
read -p "Arrastra aquí o ingresa la ruta del archivo .backup descargado: " BACKUP_PATH

# Limpiar posibles comillas de la ruta al arrastrar en Mac
BACKUP_PATH=$(echo $BACKUP_PATH | tr -d "'\"")

if [ ! -f "$BACKUP_PATH" ]; then
    echo "[ERROR] El archivo de respaldo especificado no existe en la ruta: $BACKUP_PATH"
    exit 1
fi

echo "[1/3] Limpiando esquema local público en la base de datos '$DB_NAME'..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo "[2/3] Ejecutando restauración física (pg_restore)..."
pg_restore -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -v "$BACKUP_PATH"

echo "[3/3] Sincronizando cliente Prisma..."
npx prisma db pull
npx prisma generate

echo ""
echo "✅ Esquema relacional y tablas de alimentos actualizadas con éxito."
echo "=== AMBIENTE DE PRUEBAS LOCAL LISTO PARA OPERAR ==="
