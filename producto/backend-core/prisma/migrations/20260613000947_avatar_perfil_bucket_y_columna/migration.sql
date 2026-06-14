-- Foto de perfil del nutricionista: columna + bucket público de avatares

ALTER TABLE public.perfiles_nutricionistas ADD COLUMN IF NOT EXISTS avatar_url text;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatares_perfil', 'avatares_perfil', true, 2097152, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Lectura publica avatares_perfil"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatares_perfil');

CREATE POLICY "Subida avatares_perfil carpeta propia"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatares_perfil' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Actualizacion avatares_perfil carpeta propia"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatares_perfil' AND (storage.foldername(name))[1] = (auth.uid())::text)
WITH CHECK (bucket_id = 'avatares_perfil' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Borrado avatares_perfil carpeta propia"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatares_perfil' AND (storage.foldername(name))[1] = (auth.uid())::text);
