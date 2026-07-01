// nutriflow-frontend/src/features/preparaciones/components/BibliotecaPreparaciones.tsx
import React, { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Copy, ImageOff, Loader2, Pencil, Plus, Search, Sparkles, Trash2 } from 'lucide-react';
import { ModalNuevaPreparacion } from './ModalNuevaPreparacion';
import { useCrearPreparacion, useEliminarPreparacion, usePreparaciones } from '../hooks/usePreparaciones';
import { TIPO_COMIDA_LABELS, type Preparacion } from '../types/preparacion.types';
import { notify } from '../../../shared/store/useToastStore';

// Chip de ingrediente neutro del sistema (REDISENO: sin colores pastel
// aleatorios ni morado heredado; borde 1px sobre fondo mist).
const CHIP_INGREDIENTE = 'bg-mist/50 text-ink-soft border border-mist';

const TarjetaPreparacion: React.FC<{
  preparacion: Preparacion;
  onEditar: (prep: Preparacion) => void;
  onEliminar: (prep: Preparacion) => void;
  onDuplicar: (prep: Preparacion) => void;
  eliminando: boolean;
  duplicando: boolean;
}> = ({ preparacion, onEditar, onEliminar, onDuplicar, eliminando, duplicando }) => (
  <div className="bg-white text-ink flex flex-col rounded-card border border-mist overflow-hidden hover:shadow-lg transition-shadow animate-in fade-in duration-300">
    {/* Imagen */}
    <div className="aspect-video bg-mist/60 relative overflow-hidden flex items-center justify-center">
      {preparacion.imagen_url ? (
        <img
          src={preparacion.imagen_url}
          alt={preparacion.nombre}
          className="w-full h-full object-cover"
        />
      ) : (
        <ImageOff className="w-10 h-10 text-ink-soft/40" />
      )}

      <div className="absolute top-3 right-3">
        <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium bg-white/90 backdrop-blur text-ink-soft shadow-sm">
          {Math.round(preparacion.totales.calorias)} kcal
        </span>
      </div>

      {preparacion.es_sistema && (
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium bg-pine/90 text-white shadow-sm">
            Sistema
          </span>
        </div>
      )}
    </div>

    {/* Contenido */}
    <div className="p-4 pb-5 flex flex-col flex-1">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-ink mb-1 truncate">{preparacion.nombre}</h3>
          <p className="text-xs text-ink-soft">
            {preparacion.tipo_comida ? TIPO_COMIDA_LABELS[preparacion.tipo_comida] : 'Sin clasificar'}
            {' · '}P {preparacion.totales.proteinas}g · CHO {preparacion.totales.carbohidratos}g · G{' '}
            {preparacion.totales.grasas}g
          </p>
        </div>
        {preparacion.es_sistema ? (
          // Las del sistema son compartidas (solo lectura): se ofrece duplicar a
          // la biblioteca propia, donde sí se pueden editar o eliminar.
          <div className="flex items-center shrink-0">
            <button
              onClick={() => onDuplicar(preparacion)}
              disabled={duplicando}
              aria-label="Duplicar preparación a mi biblioteca"
              title="Duplicar a mi biblioteca (para editarla)"
              className="p-1.5 text-ink-soft/60 hover:text-pine-soft hover:bg-pine-soft/5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center shrink-0">
            <button
              onClick={() => onEditar(preparacion)}
              aria-label="Editar preparación"
              title="Editar preparación"
              className="p-1.5 text-ink-soft/60 hover:text-pine-soft hover:bg-pine-soft/5 rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEliminar(preparacion)}
              disabled={eliminando}
              aria-label="Eliminar preparación"
              title="Eliminar preparación"
              className="p-1.5 text-ink-soft/60 hover:text-clinical-red hover:bg-clinical-red/5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Ingredientes */}
      <div className="flex flex-wrap gap-1.5">
        {preparacion.ingredientes.map((ing) => (
          <span
            key={ing.id}
            title={`${ing.cantidad_g} g`}
            className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium ${CHIP_INGREDIENTE}`}
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
  const { mutate: crearPreparacion, isPending: duplicando } = useCrearPreparacion();

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

  // Copia una preparación del sistema a la biblioteca propia (editable/eliminable).
  const handleDuplicar = (prep: Preparacion) => {
    crearPreparacion(
      {
        nombre: `${prep.nombre} (copia)`.slice(0, 120),
        descripcion: prep.descripcion ?? undefined,
        instrucciones: prep.instrucciones ?? undefined,
        tipo_comida: prep.tipo_comida ?? undefined,
        ingredientes: prep.ingredientes.map((ing) => ({
          alimento_id: ing.alimento_id,
          cantidad_g: ing.cantidad_g,
        })),
      },
      {
        onSuccess: () => notify('success', 'Preparación duplicada a tu biblioteca. Ya puedes editarla.'),
        onError: () => notify('error', 'No se pudo duplicar la preparación. Intenta nuevamente.'),
      },
    );
  };

  const handleCerrarModal = () => {
    setIsModalOpen(false);
    setPreparacionEnEdicion(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden p-3 sm:p-4 md:p-8">
      {/* Encabezado */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-ink">Biblioteca de Preparaciones</h1>
        <p className="text-ink-soft mt-1">
          Gestiona tus preparaciones y utiliza las del sistema
          {preparaciones ? ` · ${preparaciones.length} disponibles` : ''}
        </p>
      </div>

      {/* Controles */}
      <div className="mb-6 flex flex-col md:flex-row gap-3 md:items-center w-full">
        <div className="flex-1 relative min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ink-soft/60" />
          <input
            type="search"
            aria-label="Buscar preparaciones por nombre o ingrediente"
            className="flex h-9 w-full min-w-0 rounded-md border border-mist px-3 py-1 text-base transition-colors outline-none focus-visible:border-pine-soft focus-visible:ring-2 focus-visible:ring-apricot pl-10"
            placeholder="Buscar por nombre o ingrediente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border bg-white text-ink hover:bg-mist/60 h-9 px-4 py-2 gap-2 shadow-sm w-full md:w-auto"
        >
          <Plus className="w-4 h-4" />
          Nueva Preparación
        </button>

        <Link
          to="/generador"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors text-white h-9 px-4 py-2 gap-2 bg-pine hover:bg-pine-soft shadow-sm w-full md:w-auto"
        >
          <Sparkles className="w-4 h-4" />
          Ir al Generador de Menús
        </Link>
      </div>

      {/* Estados de carga / error */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 text-pine-soft gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Cargando preparaciones...
        </div>
      )}
      {isError && (
        <div className="text-center py-20 text-clinical-red">
          No se pudieron cargar las preparaciones. Intenta nuevamente.
        </div>
      )}

      {/* Grid */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {preparacionesFiltradas.map((prep) => (
            <TarjetaPreparacion
              key={prep.id}
              preparacion={prep}
              onEditar={handleEditar}
              onEliminar={handleEliminar}
              onDuplicar={handleDuplicar}
              eliminando={eliminando}
              duplicando={duplicando}
            />
          ))}
          {preparacionesFiltradas.length === 0 && (
            <div className="col-span-full text-center py-12 text-ink-soft">
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
