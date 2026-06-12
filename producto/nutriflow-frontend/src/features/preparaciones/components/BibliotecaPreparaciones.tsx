// nutriflow-frontend/src/features/preparaciones/components/BibliotecaPreparaciones.tsx
import React, { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ImageOff, Loader2, Pencil, Plus, Search, Sparkles, Trash2 } from 'lucide-react';
import { ModalNuevaPreparacion } from './ModalNuevaPreparacion';
import { useEliminarPreparacion, usePreparaciones } from '../hooks/usePreparaciones';
import { TIPO_COMIDA_LABELS, type Preparacion } from '../types/preparacion.types';

const COLORES_TAGS = [
  'bg-yellow-100 text-yellow-800',
  'bg-orange-100 text-orange-800',
  'bg-blue-100 text-blue-800',
  'bg-purple-100 text-purple-800',
  'bg-green-100 text-green-800',
  'bg-red-100 text-red-800',
];

const TarjetaPreparacion: React.FC<{
  preparacion: Preparacion;
  onEditar: (prep: Preparacion) => void;
  onEliminar: (prep: Preparacion) => void;
  eliminando: boolean;
}> = ({ preparacion, onEditar, onEliminar, eliminando }) => (
  <div className="bg-white text-gray-900 flex flex-col rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow animate-in fade-in duration-300">
    {/* Imagen */}
    <div className="aspect-video bg-gray-100 relative overflow-hidden flex items-center justify-center">
      {preparacion.imagen_url ? (
        <img
          src={preparacion.imagen_url}
          alt={preparacion.nombre}
          className="w-full h-full object-cover"
        />
      ) : (
        <ImageOff className="w-10 h-10 text-gray-300" />
      )}

      <div className="absolute top-3 right-3">
        <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium bg-white/90 backdrop-blur text-gray-700 shadow-sm">
          {Math.round(preparacion.totales.calorias)} kcal
        </span>
      </div>

      {preparacion.es_sistema && (
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium bg-teal-600/90 text-white shadow-sm">
            Sistema
          </span>
        </div>
      )}
    </div>

    {/* Contenido */}
    <div className="p-4 pb-5 flex flex-col flex-1">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 truncate">{preparacion.nombre}</h3>
          <p className="text-xs text-gray-500">
            {preparacion.tipo_comida ? TIPO_COMIDA_LABELS[preparacion.tipo_comida] : 'Sin clasificar'}
            {' · '}P {preparacion.totales.proteinas}g · CHO {preparacion.totales.carbohidratos}g · G{' '}
            {preparacion.totales.grasas}g
          </p>
        </div>
        {!preparacion.es_sistema && (
          <div className="flex items-center shrink-0">
            <button
              onClick={() => onEditar(preparacion)}
              title="Editar preparación"
              className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEliminar(preparacion)}
              disabled={eliminando}
              title="Eliminar preparación"
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Ingredientes */}
      <div className="flex flex-wrap gap-1.5">
        {preparacion.ingredientes.map((ing, idx) => (
          <span
            key={ing.id}
            title={`${ing.cantidad_g} g`}
            className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium border-0 ${COLORES_TAGS[idx % COLORES_TAGS.length]}`}
          >
            {ing.nombre}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export const BibliotecaPreparaciones: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  /** Preparación en edición; null = el modal crea una nueva. */
  const [preparacionEnEdicion, setPreparacionEnEdicion] = useState<Preparacion | null>(null);

  const { data: preparaciones, isLoading, isError } = usePreparaciones();
  const { mutate: eliminarPreparacion, isPending: eliminando } = useEliminarPreparacion();

  const preparacionesFiltradas = useMemo(() => {
    const lista = preparaciones ?? [];
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return lista;
    return lista.filter(
      (p) =>
        p.nombre.toLowerCase().includes(termino) ||
        p.ingredientes.some((ing) => ing.nombre.toLowerCase().includes(termino)),
    );
  }, [preparaciones, busqueda]);

  const handleEliminar = (prep: Preparacion) => {
    if (window.confirm(`¿Eliminar la preparación "${prep.nombre}"? Esta acción no se puede deshacer.`)) {
      eliminarPreparacion(prep.id);
    }
  };

  const handleEditar = (prep: Preparacion) => {
    setPreparacionEnEdicion(prep);
    setIsModalOpen(true);
  };

  const handleCerrarModal = () => {
    setIsModalOpen(false);
    setPreparacionEnEdicion(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Biblioteca de Preparaciones</h1>
        <p className="text-gray-600 mt-1">
          Gestiona tus preparaciones y utiliza las del sistema
          {preparaciones ? ` · ${preparaciones.length} disponibles` : ''}
        </p>
      </div>

      {/* Controles */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            className="flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base transition-colors outline-none focus-visible:border-gray-400 focus-visible:ring-2 focus-visible:ring-gray-200 pl-10"
            placeholder="Buscar por nombre o ingrediente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border bg-white text-gray-900 hover:bg-gray-100 h-9 px-4 py-2 gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Preparación
        </button>

        <Link
          to="/generador"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors text-white h-9 px-4 py-2 gap-2 bg-teal-600 hover:bg-teal-700 shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          Ir al Generador de Menús
        </Link>
      </div>

      {/* Estados de carga / error */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 text-teal-600 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Cargando preparaciones...
        </div>
      )}
      {isError && (
        <div className="text-center py-20 text-red-600">
          No se pudieron cargar las preparaciones. Intenta nuevamente.
        </div>
      )}

      {/* Grid */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-3 gap-6">
          {preparacionesFiltradas.map((prep) => (
            <TarjetaPreparacion
              key={prep.id}
              preparacion={prep}
              onEditar={handleEditar}
              onEliminar={handleEliminar}
              eliminando={eliminando}
            />
          ))}
          {preparacionesFiltradas.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-500">
              No se encontraron preparaciones
            </div>
          )}
        </div>
      )}

      <ModalNuevaPreparacion
        isOpen={isModalOpen}
        onClose={handleCerrarModal}
        preparacion={preparacionEnEdicion}
      />
    </div>
  );
};
