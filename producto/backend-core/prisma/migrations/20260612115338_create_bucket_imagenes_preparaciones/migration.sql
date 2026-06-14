-- Bucket público en lectura para imágenes de preparaciones (decisión aprobada F3)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'imagenes_preparaciones',
  'imagenes_preparaciones',
  true,
  2097152, -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Lectura pública (el bucket es public, pero la policy hace explícito el acceso vía API)
CREATE POLICY "Lectura publica imagenes_preparaciones"
ON storage.objects FOR SELECT
USING (bucket_id = 'imagenes_preparaciones');

-- Escritura solo authenticated y bajo su propia carpeta {auth.uid()}/...
-- (mismo patrón que el bucket expedientes_pacientes)
CREATE POLICY "Subida imagenes_preparaciones carpeta propia"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'imagenes_preparaciones'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Actualizacion imagenes_preparaciones carpeta propia"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'imagenes_preparaciones'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'imagenes_preparaciones'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Borrado imagenes_preparaciones carpeta propia"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'imagenes_preparaciones'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
