// nutriflow-frontend/src/features/perfil/components/MiPerfil.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Save, UserCircle, BadgeCheck, Mail, Camera, Trash2 } from 'lucide-react';
import { usePerfilNutricionista, useUpdatePerfil } from '../hooks/usePerfil';
import { subirAvatar, eliminarAvatar, validarAvatar, TIPOS_AVATAR_PERMITIDOS } from '../services/avatarPerfil';
import { PageHeader } from '../../../shared/ui/organisms/PageHeader';

export const MiPerfil: React.FC = () => {
  const { data: perfil, isLoading, error } = usePerfilNutricionista();
  const updatePerfil = useUpdatePerfil();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [registroProfesional, setRegistroProfesional] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  // Sincronizar el formulario cuando llega el perfil desde la DB
  useEffect(() => {
    if (perfil) {
      setNombre(perfil.nombre);
      setApellido(perfil.apellido);
      setRegistroProfesional(perfil.registro_profesional || '');
    }
  }, [perfil]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!nombre.trim() || !apellido.trim()) {
      setFeedback({ type: 'error', message: 'El nombre y el apellido son obligatorios.' });
      return;
    }

    updatePerfil.mutate(
      {
        nombre,
        apellido,
        registro_profesional: registroProfesional || null,
      },
      {
        onSuccess: () => setFeedback({ type: 'success', message: 'Perfil actualizado correctamente.' }),
        onError: (err) =>
          setFeedback({
            type: 'error',
            message: err instanceof Error ? err.message : 'Ocurrió un error al guardar el perfil.',
          }),
      },
    );
  };

  // La foto se aplica de inmediato (independiente del botón Guardar):
  // sube al bucket, persiste la URL y elimina la foto anterior best-effort.
  const handleFotoSeleccionada = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite re-seleccionar el mismo archivo
    if (!file || !perfil) return;

    setFeedback(null);
    const errorValidacion = validarAvatar(file);
    if (errorValidacion) {
      setFeedback({ type: 'error', message: errorValidacion });
      return;
    }

    setSubiendoFoto(true);
    try {
      const urlAnterior = perfil.avatar_url;
      const url = await subirAvatar(file, perfil.id);
      await new Promise<void>((resolve, reject) =>
        updatePerfil.mutate(
          {
            nombre: nombre || perfil.nombre,
            apellido: apellido || perfil.apellido,
            registro_profesional: registroProfesional || null,
            avatar_url: url,
          },
          { onSuccess: () => resolve(), onError: reject },
        ),
      );
      if (urlAnterior) await eliminarAvatar(urlAnterior, perfil.id);
      setFeedback({ type: 'success', message: 'Foto de perfil actualizada.' });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'No se pudo actualizar la foto.',
      });
    } finally {
      setSubiendoFoto(false);
    }
  };

  const handleQuitarFoto = async () => {
    if (!perfil?.avatar_url) return;
    setFeedback(null);
    setSubiendoFoto(true);
    try {
      const urlAnterior = perfil.avatar_url;
      await new Promise<void>((resolve, reject) =>
        updatePerfil.mutate(
          {
            nombre: nombre || perfil.nombre,
            apellido: apellido || perfil.apellido,
            registro_profesional: registroProfesional || null,
            avatar_url: null,
          },
          { onSuccess: () => resolve(), onError: reject },
        ),
      );
      await eliminarAvatar(urlAnterior, perfil.id);
      setFeedback({ type: 'success', message: 'Foto de perfil eliminada.' });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'No se pudo quitar la foto.',
      });
    } finally {
      setSubiendoFoto(false);
    }
  };

  const iniciales = `${nombre[0] || '?'}${apellido[0] || ''}`.toUpperCase();

  return (
    <div className="flex flex-col h-full bg-porcelain flex-1 overflow-y-auto w-full">
      <div className="p-8 max-w-3xl mx-auto w-full">
        <PageHeader eyebrow="Cuenta" title="Mi Perfil" description="Datos de tu cuenta profesional" />

        {isLoading && (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-pine-soft" />
          </div>
        )}

        {error && (
          <div className="p-4 text-clinical-red bg-clinical-red/5 border border-clinical-red/30 rounded-card text-sm">
            {error instanceof Error ? error.message : 'Error al cargar el perfil.'}
          </div>
        )}

        {perfil && (
          <div className="bg-white rounded-card border border-mist shadow-card overflow-hidden">
            <div className="px-6 pt-6 pb-5 border-b border-mist flex items-center gap-5">
              {/* Avatar: foto o iniciales */}
              <div className="relative shrink-0">
                {perfil.avatar_url ? (
                  <img
                    src={perfil.avatar_url}
                    alt={`Foto de ${nombre} ${apellido}`}
                    className="h-20 w-20 rounded-full object-cover border border-mist"
                  />
                ) : (
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-apricot text-pine text-2xl font-semibold">
                    {iniciales}
                  </span>
                )}
                {subiendoFoto && (
                  <span className="absolute inset-0 rounded-full bg-ink/40 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-porcelain" />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-display font-semibold text-lg text-ink leading-none mb-1 truncate">
                  {nombre} {apellido}
                </h2>
                <p className="text-sm text-ink-soft flex items-center gap-1.5 mb-3">
                  <BadgeCheck className="w-4 h-4 text-pine-soft" />
                  Nutricionista
                </p>
                <div className="flex items-center gap-2">
                  <input
                    ref={inputFotoRef}
                    type="file"
                    accept={TIPOS_AVATAR_PERMITIDOS.join(',')}
                    onChange={handleFotoSeleccionada}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => inputFotoRef.current?.click()}
                    disabled={subiendoFoto}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-mist bg-white text-xs font-medium text-ink-soft hover:border-pine-soft hover:text-pine-soft transition-colors duration-150 disabled:opacity-50"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    {perfil.avatar_url ? 'Cambiar foto' : 'Subir foto'}
                  </button>
                  {perfil.avatar_url && (
                    <button
                      type="button"
                      onClick={handleQuitarFoto}
                      disabled={subiendoFoto}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-transparent text-xs font-medium text-ink-soft/70 hover:text-clinical-red hover:bg-clinical-red/5 transition-colors duration-150 disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Quitar
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-ink-soft/70 mt-1.5">JPG, PNG o WebP, máximo 2 MB.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {feedback && (
                <div
                  className={`p-3 rounded-md text-sm border animate-in fade-in duration-300 ${
                    feedback.type === 'success'
                      ? 'bg-pine-soft/5 border-pine-soft/30 text-pine-soft'
                      : 'bg-clinical-red/5 border-clinical-red/30 text-clinical-red'
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              {/* Email (solo lectura) */}
              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1" htmlFor="perfil-email">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft/50" />
                  <input
                    id="perfil-email"
                    type="email"
                    value={perfil.email}
                    readOnly
                    className="w-full p-2 pl-9 border border-mist rounded-md text-sm bg-mist/40 text-ink-soft cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-ink-soft/70 mt-1">El correo de acceso no se puede modificar desde aquí.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-ink-soft mb-1" htmlFor="perfil-nombre">
                    Nombre
                  </label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft/50" />
                    <input
                      id="perfil-nombre"
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                      maxLength={60}
                      disabled={updatePerfil.isPending}
                      className="w-full p-2 pl-9 border border-mist rounded-md text-sm text-ink outline-none focus:border-pine-soft focus:ring-1 focus:ring-pine-soft"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-soft mb-1" htmlFor="perfil-apellido">
                    Apellido
                  </label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft/50" />
                    <input
                      id="perfil-apellido"
                      type="text"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      required
                      maxLength={60}
                      disabled={updatePerfil.isPending}
                      className="w-full p-2 pl-9 border border-mist rounded-md text-sm text-ink outline-none focus:border-pine-soft focus:ring-1 focus:ring-pine-soft"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1" htmlFor="perfil-registro">
                  Registro profesional
                </label>
                <input
                  id="perfil-registro"
                  type="text"
                  value={registroProfesional}
                  onChange={(e) => setRegistroProfesional(e.target.value)}
                  placeholder="Ej. N° de registro de la Superintendencia de Salud"
                  maxLength={100}
                  disabled={updatePerfil.isPending}
                  className="w-full p-2 border border-mist rounded-md text-sm text-ink outline-none focus:border-pine-soft focus:ring-1 focus:ring-pine-soft"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={updatePerfil.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-pine hover:bg-pine-soft disabled:opacity-60 text-porcelain text-sm font-medium rounded-md transition-colors duration-150"
                >
                  {updatePerfil.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
