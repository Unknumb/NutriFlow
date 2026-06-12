// nutriflow-frontend/src/features/perfil/components/MiPerfil.tsx
import React, { useEffect, useState } from 'react';
import { Loader2, Save, UserCircle, BadgeCheck, Mail } from 'lucide-react';
import { usePerfilNutricionista, useUpdatePerfil } from '../hooks/usePerfil';

export const MiPerfil: React.FC = () => {
  const { data: perfil, isLoading, error } = usePerfilNutricionista();
  const updatePerfil = useUpdatePerfil();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [registroProfesional, setRegistroProfesional] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  return (
    <div className="flex flex-col h-full bg-gray-50 flex-1 overflow-y-auto w-full">
      <div className="p-8 max-w-3xl mx-auto w-full">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-1">Datos de tu cuenta profesional</p>
        </div>

        {isLoading && (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        )}

        {error && (
          <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-xl text-sm">
            {error instanceof Error ? error.message : 'Error al cargar el perfil.'}
          </div>
        )}

        {perfil && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-xl font-medium">
                {`${(nombre[0] || '?')}${(apellido[0] || '')}`.toUpperCase()}
              </span>
              <div>
                <h2 className="font-semibold text-lg text-gray-900 leading-none mb-1">
                  {nombre} {apellido}
                </h2>
                <p className="text-sm text-gray-600 flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-teal-600" />
                  Nutricionista
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {feedback && (
                <div
                  className={`p-3 rounded-lg text-sm border animate-in fade-in duration-300 ${
                    feedback.type === 'success'
                      ? 'bg-teal-50 border-teal-200 text-teal-800'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              {/* Email (solo lectura) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="perfil-email">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="perfil-email"
                    type="email"
                    value={perfil.email}
                    readOnly
                    className="w-full p-2 pl-9 border border-gray-300 rounded-md text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">El correo de acceso no se puede modificar desde aquí.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="perfil-nombre">
                    Nombre
                  </label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="perfil-nombre"
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                      maxLength={60}
                      disabled={updatePerfil.isPending}
                      className="w-full p-2 pl-9 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="perfil-apellido">
                    Apellido
                  </label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="perfil-apellido"
                      type="text"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      required
                      maxLength={60}
                      disabled={updatePerfil.isPending}
                      className="w-full p-2 pl-9 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="perfil-registro">
                  Registro Profesional
                </label>
                <input
                  id="perfil-registro"
                  type="text"
                  value={registroProfesional}
                  onChange={(e) => setRegistroProfesional(e.target.value)}
                  placeholder="Ej. N° de registro de la Superintendencia de Salud"
                  maxLength={100}
                  disabled={updatePerfil.isPending}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={updatePerfil.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
                >
                  {updatePerfil.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar Cambios
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
