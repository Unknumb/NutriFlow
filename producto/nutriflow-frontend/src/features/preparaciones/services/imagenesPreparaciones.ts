// nutriflow-frontend/src/features/preparaciones/services/imagenesPreparaciones.ts
import { supabase } from '../../../shared/utils/supabase';

const BUCKET = 'imagenes_preparaciones';
/** Límite del bucket en Supabase (file_size_limit = 2 MB). */
export const TAMANO_MAXIMO_IMAGEN = 2 * 1024 * 1024;
/** Tipos MIME permitidos por el bucket. */
export const TIPOS_IMAGEN_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'] as const;

const EXTENSION_POR_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/** Valida tamaño y tipo antes de subir. Devuelve un mensaje de error o null si es válida. */
export function validarImagenPreparacion(file: File): string | null {
  if (!TIPOS_IMAGEN_PERMITIDOS.includes(file.type as (typeof TIPOS_IMAGEN_PERMITIDOS)[number])) {
    return 'Formato no soportado. Usa JPG, PNG o WebP.';
  }
  if (file.size > TAMANO_MAXIMO_IMAGEN) {
    return 'La imagen supera el límite de 2 MB.';
  }
  return null;
}

/**
 * Sube la imagen a `imagenes_preparaciones/{userId}/{uuid}.{ext}` y devuelve la URL pública.
 * Las policies del bucket exigen que el primer segmento del path sea el uid del usuario.
 */
export async function subirImagenPreparacion(file: File, userId: string): Promise<string> {
  const extension = EXTENSION_POR_MIME[file.type] ?? 'jpg';
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    throw new Error(`No se pudo subir la imagen: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Borra una imagen del bucket a partir de su URL pública (best-effort: nunca lanza).
 * Solo actúa si la URL pertenece a este bucket y a la carpeta del usuario,
 * para no intentar borrar imágenes de sistema o de otros usuarios.
 */
export async function eliminarImagenPreparacion(url: string, userId: string): Promise<void> {
  try {
    const marcador = `/storage/v1/object/public/${BUCKET}/`;
    const indice = url.indexOf(marcador);
    if (indice === -1) return;

    const path = decodeURIComponent(url.slice(indice + marcador.length).split('?')[0]);
    if (!path.startsWith(`${userId}/`)) return;

    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // Best-effort: una imagen huérfana en el bucket no debe romper el flujo del usuario.
  }
}
