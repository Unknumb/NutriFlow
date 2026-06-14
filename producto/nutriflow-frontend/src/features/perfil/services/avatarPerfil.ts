// nutriflow-frontend/src/features/perfil/services/avatarPerfil.ts
import { supabase } from '../../../shared/utils/supabase';

const BUCKET = 'avatares_perfil';
/** Límite del bucket en Supabase (file_size_limit = 2 MB). */
export const TAMANO_MAXIMO_AVATAR = 2 * 1024 * 1024;
/** Tipos MIME permitidos por el bucket. */
export const TIPOS_AVATAR_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'] as const;

const EXTENSION_POR_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/** Valida tamaño y tipo antes de subir. Devuelve un mensaje de error o null si es válida. */
export function validarAvatar(file: File): string | null {
  if (!TIPOS_AVATAR_PERMITIDOS.includes(file.type as (typeof TIPOS_AVATAR_PERMITIDOS)[number])) {
    return 'Formato no soportado. Usa JPG, PNG o WebP.';
  }
  if (file.size > TAMANO_MAXIMO_AVATAR) {
    return 'La imagen supera el límite de 2 MB.';
  }
  return null;
}

/**
 * Sube el avatar a `avatares_perfil/{userId}/{uuid}.{ext}` y devuelve la URL pública.
 * Las policies del bucket exigen que el primer segmento del path sea el uid del usuario.
 */
export async function subirAvatar(file: File, userId: string): Promise<string> {
  const extension = EXTENSION_POR_MIME[file.type] ?? 'jpg';
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    throw new Error(`No se pudo subir la foto: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Borra un avatar del bucket a partir de su URL pública (best-effort: nunca lanza).
 * Solo actúa si la URL pertenece a este bucket y a la carpeta del usuario.
 */
export async function eliminarAvatar(url: string, userId: string): Promise<void> {
  try {
    const marcador = `/storage/v1/object/public/${BUCKET}/`;
    const indice = url.indexOf(marcador);
    if (indice === -1) return;

    const path = decodeURIComponent(url.slice(indice + marcador.length).split('?')[0]);
    if (!path.startsWith(`${userId}/`)) return;

    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // Best-effort: un avatar huérfano en el bucket no debe romper el flujo del usuario.
  }
}
