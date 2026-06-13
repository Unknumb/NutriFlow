// nutriflow-frontend/src/features/perfil/types/perfil.types.ts

/** Fila de la tabla public.perfiles_nutricionistas (acceso directo vía supabase-js, protegido por RLS auth.uid() = id) */
export interface PerfilNutricionista {
  id: string;
  nombre: string;
  apellido: string;
  registro_profesional: string | null;
  email: string;
  avatar_url: string | null;
  fecha_creacion: string; // ISO string DateTime
}

export interface UpdatePerfilPayload {
  nombre: string;
  apellido: string;
  registro_profesional: string | null;
  /** URL pública del avatar; null para quitar la foto. Si se omite, no se toca. */
  avatar_url?: string | null;
}
