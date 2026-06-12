// nutriflow-frontend/src/features/preparaciones/components/ModalNuevaPreparacion.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ImagePlus, Loader2, Plus, Save, Search, Utensils, X } from 'lucide-react';
import { useAuthStore } from '../../../shared/store/useAuthStore';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';
import { ModalNuevoAlimento } from '../../alimentos/components/ModalNuevoAlimento';
import { useBuscarAlimentos, useCategorias } from '../../alimentos/hooks/useBuscarAlimentos';
import type { Alimento } from '../../alimentos/types/alimento.types';
import { useActualizarPreparacion, useCrearPreparacion } from '../hooks/usePreparaciones';
import {
  eliminarImagenPreparacion,
  subirImagenPreparacion,
  validarImagenPreparacion,
} from '../services/imagenesPreparaciones';
import {
  TIPO_COMIDA_LABELS,
  type Preparacion,
  type TipoComida,
  type UpdatePreparacionPayload,
} from '../types/preparacion.types';

interface ModalNuevaPreparacionProps {
  isOpen: boolean;
  onClose: () => void;
  /** Si se entrega, el modal funciona en modo edición (PATCH en lugar de POST). */
  preparacion?: Preparacion | null;
}

/** Lo mínimo que necesitamos de un alimento para listarlo como ingrediente. */
interface IngredienteSeleccionado {
  alimento_id: string;
  nombre: string;
  marca: string | null;
  calorias_100g: number;
  gramos: number;
}

function alimentoAIngrediente(alimento: Alimento): IngredienteSeleccionado {
  return {
    alimento_id: alimento.id,
    nombre: alimento.nombre,
    marca: alimento.marca,
    calorias_100g: alimento.calorias_100g,
    gramos: 100,
  };
}

/**
 * Al cerrarse se desmonta el formulario, y la `key` fuerza un remount al cambiar
 * entre creación y edición (o entre preparaciones distintas): cada apertura
 * parte con el estado inicial correcto sin efectos de sincronización.
 */
export const ModalNuevaPreparacion: React.FC<ModalNuevaPreparacionProps> = ({
  isOpen,
  onClose,
  preparacion = null,
}) => {
  if (!isOpen) return null;
  return (
    <FormularioPreparacion
      key={preparacion?.id ?? 'nueva'}
      onClose={onClose}
      preparacion={preparacion}
    />
  );
};

const FormularioPreparacion: React.FC<{
  onClose: () => void;
  preparacion: Preparacion | null;
}> = ({ onClose, preparacion }) => {
  const user = useAuthStore((state) => state.user);
  const { mutateAsync: crearPreparacion, isPending: creando } = useCrearPreparacion();
  const { mutateAsync: actualizarPreparacion, isPending: actualizando } = useActualizarPreparacion();

  const esEdicion = preparacion !== null;
  const guardando = creando || actualizando;

  // --- Formulario base (inicializado desde la preparación en modo edición) ---
  const [nombre, setNombre] = useState(preparacion?.nombre ?? '');
  const [tipoComida, setTipoComida] = useState<TipoComida>(preparacion?.tipo_comida ?? 'desayuno');
  const [ingredientes, setIngredientes] = useState<IngredienteSeleccionado[]>(() =>
    (preparacion?.ingredientes ?? []).map((ing) => ({
      alimento_id: ing.alimento_id,
      nombre: ing.nombre,
      marca: ing.marca,
      // Reconstruimos kcal/100g desde las kcal calculadas para la cantidad actual
      calorias_100g: ing.cantidad_g > 0 ? (ing.calorias / ing.cantidad_g) * 100 : 0,
      gramos: ing.cantidad_g,
    })),
  );
  const [error, setError] = useState<string | null>(null);

  // --- Búsqueda server-side de alimentos ---
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
  const busquedaDebounced = useDebouncedValue(busqueda, 300);
  const [modalAlimentoAbierto, setModalAlimentoAbierto] = useState(false);

  const { data: categorias } = useCategorias();
  const {
    data: resultados,
    isFetching: buscando,
    isError: errorBusqueda,
  } = useBuscarAlimentos({
    search: busquedaDebounced,
    categoria: categoriaFiltro,
  });
  const hayFiltroActivo = busquedaDebounced.trim().length > 0 || !!categoriaFiltro;

  // --- Imagen ---
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  /** URL existente en modo edición; null = sin imagen o el usuario la quitó. */
  const [imagenActualUrl, setImagenActualUrl] = useState<string | null>(
    preparacion?.imagen_url ?? null,
  );
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  const imagenPreview = useMemo(
    () => (imagenFile ? URL.createObjectURL(imagenFile) : null),
    [imagenFile],
  );
  useEffect(() => {
    return () => {
      if (imagenPreview) URL.revokeObjectURL(imagenPreview);
    };
  }, [imagenPreview]);

  const handleAgregarAlimento = (alimento: Alimento) => {
    setIngredientes((prev) =>
      prev.some((i) => i.alimento_id === alimento.id) ? prev : [...prev, alimentoAIngrediente(alimento)],
    );
  };

  const handleQuitarIngrediente = (alimentoId: string) => {
    setIngredientes((prev) => prev.filter((i) => i.alimento_id !== alimentoId));
  };

  const handleChangeGramos = (alimentoId: string, gramos: number) => {
    setIngredientes((prev) =>
      prev.map((i) => (i.alimento_id === alimentoId ? { ...i, gramos } : i)),
    );
  };

  const handleSeleccionarImagen = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // permite volver a elegir el mismo archivo
    if (!file) return;
    const errorValidacion = validarImagenPreparacion(file);
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }
    setError(null);
    setImagenFile(file);
  };

  const handleQuitarImagen = () => {
    setImagenFile(null);
    setImagenActualUrl(null);
  };

  const caloriasTotales = ingredientes.reduce(
    (acc, item) => acc + (item.calorias_100g * item.gramos) / 100,
    0,
  );

  const limpiarYCerrar = () => {
    setError(null);
    onClose();
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      setError('Debes darle un nombre a la preparación');
      return;
    }
    if (ingredientes.length === 0) {
      setError('Debes agregar al menos un ingrediente');
      return;
    }
    if (ingredientes.some((i) => !i.gramos || i.gramos <= 0)) {
      setError('Todos los ingredientes deben tener una cantidad en gramos mayor a 0');
      return;
    }
    if (!user) {
      setError('Tu sesión expiró. Vuelve a iniciar sesión para guardar.');
      return;
    }

    setError(null);

    // 1. Subir la imagen nueva (si hay). Un fallo aquí no descarta el formulario.
    let imagenSubidaUrl: string | undefined;
    if (imagenFile) {
      setSubiendoImagen(true);
      try {
        imagenSubidaUrl = await subirImagenPreparacion(imagenFile, user.id);
      } catch (e) {
        setSubiendoImagen(false);
        setError(e instanceof Error ? e.message : 'No se pudo subir la imagen. Intenta nuevamente.');
        return;
      }
      setSubiendoImagen(false);
    }

    // 2. Persistir la preparación
    const payloadBase = {
      nombre: nombre.trim(),
      tipo_comida: tipoComida,
      ingredientes: ingredientes.map((i) => ({
        alimento_id: i.alimento_id,
        cantidad_g: i.gramos,
      })),
    };

    try {
      if (esEdicion && preparacion) {
        // undefined = no tocar; null = quitar; string = nueva imagen
        const imagenFinal: string | null | undefined =
          imagenSubidaUrl ?? (preparacion.imagen_url && imagenActualUrl === null ? null : undefined);
        const payload: UpdatePreparacionPayload =
          imagenFinal !== undefined ? { ...payloadBase, imagen_url: imagenFinal } : payloadBase;
        await actualizarPreparacion({ id: preparacion.id, payload });

        // Best-effort: borrar la imagen anterior del bucket si fue reemplazada o quitada
        if (preparacion.imagen_url && (imagenSubidaUrl || imagenActualUrl === null)) {
          void eliminarImagenPreparacion(preparacion.imagen_url, user.id);
        }
      } else {
        await crearPreparacion({
          ...payloadBase,
          ...(imagenSubidaUrl ? { imagen_url: imagenSubidaUrl } : {}),
        });
      }
      limpiarYCerrar();
    } catch {
      // Evitar imágenes huérfanas si la escritura en backend-core falló
      if (imagenSubidaUrl) void eliminarImagenPreparacion(imagenSubidaUrl, user.id);
      setError('No se pudo guardar la preparación. Intenta nuevamente.');
    }
  };

  const imagenMostrada = imagenPreview ?? imagenActualUrl;
  const ocupado = guardando || subiendoImagen;
  const alimentosEncontrados = resultados?.items ?? [];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Utensils className="w-6 h-6 text-teal-600" />
              {esEdicion ? 'Editar Preparación' : 'Nueva Preparación'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {esEdicion
                ? 'Modifica los datos, ingredientes o la imagen de tu preparación'
                : 'Crea una nueva receta usando la base de datos de alimentos'}
            </p>
          </div>
          <button
            onClick={limpiarYCerrar}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body (2 columnas) */}
        <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
          {/* Columna izquierda: formulario y búsqueda */}
          <div className="w-1/2 flex flex-col gap-4 overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Preparación</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Avena con plátano"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Comida</label>
              <select
                value={tipoComida}
                onChange={(e) => setTipoComida(e.target.value as TipoComida)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
              >
                {Object.entries(TIPO_COMIDA_LABELS).map(([valor, etiqueta]) => (
                  <option key={valor} value={valor}>
                    {etiqueta}
                  </option>
                ))}
              </select>
            </div>

            {/* Imagen (opcional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen (opcional)</label>
              {imagenMostrada ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                  <img src={imagenMostrada} alt="Vista previa de la preparación" className="w-full h-36 object-cover" />
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <label className="cursor-pointer bg-white/90 backdrop-blur text-gray-700 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-white transition-colors">
                      Cambiar
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleSeleccionarImagen} />
                    </label>
                    <button
                      type="button"
                      onClick={handleQuitarImagen}
                      className="bg-white/90 backdrop-blur text-red-600 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-white transition-colors"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-gray-300 rounded-xl py-6 cursor-pointer text-gray-400 hover:border-teal-400 hover:text-teal-600 transition-colors">
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-xs font-medium">Subir imagen — JPG, PNG o WebP (máx. 2 MB)</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleSeleccionarImagen} />
                </label>
              )}
            </div>

            {/* Búsqueda de alimentos (server-side) */}
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Alimentos</label>
              <div className="relative mb-2">
                <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar en la base de datos..."
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-9 py-2 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-gray-50"
                />
                {buscando && (
                  <Loader2 className="w-4 h-4 absolute right-3 top-3 text-teal-500 animate-spin" />
                )}
              </div>
              <select
                value={categoriaFiltro ?? ''}
                onChange={(e) => setCategoriaFiltro(e.target.value || null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white mb-3"
              >
                <option value="">Todas las categorías</option>
                {(categorias ?? []).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <div className="border border-gray-200 rounded-xl overflow-hidden flex-1 max-h-[300px] overflow-y-auto">
                {!hayFiltroActivo ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Escribe un nombre o elige una categoría para buscar
                  </div>
                ) : errorBusqueda ? (
                  <div className="p-4 text-center text-red-600 text-sm">
                    No se pudo buscar alimentos. Intenta nuevamente.
                  </div>
                ) : alimentosEncontrados.length === 0 && !buscando ? (
                  <div className="p-4 text-center text-sm">
                    <p className="text-gray-500 mb-3">No se encontraron alimentos para tu búsqueda</p>
                    <button
                      onClick={() => setModalAlimentoAbierto(true)}
                      className="inline-flex items-center gap-1.5 text-teal-700 font-medium hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Crear alimento nuevo
                    </button>
                  </div>
                ) : (
                  <>
                    <ul className="divide-y divide-gray-100">
                      {alimentosEncontrados.map((alimento) => (
                        <li key={alimento.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {alimento.nombre}
                              {alimento.marca && <span className="text-gray-500 font-normal"> · {alimento.marca}</span>}
                            </p>
                            <p className="text-xs text-gray-500">
                              {alimento.categoria ?? 'Sin categoría'} · {Math.round(alimento.calorias_100g)} kcal / 100g
                            </p>
                          </div>
                          <button
                            onClick={() => handleAgregarAlimento(alimento)}
                            className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors shrink-0"
                            aria-label={`Agregar ${alimento.nombre}`}
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="p-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 pl-1">
                        {resultados ? `${resultados.total} resultado${resultados.total === 1 ? '' : 's'}` : ''}
                      </span>
                      <button
                        onClick={() => setModalAlimentoAbierto(true)}
                        className="text-xs text-teal-700 font-medium hover:text-teal-800 px-2 py-1 rounded transition-colors"
                      >
                        ¿No está? Crear alimento nuevo
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Columna derecha: ingredientes seleccionados y resumen */}
          <div className="w-1/2 flex flex-col bg-gray-50 rounded-xl border border-gray-200 p-5 overflow-hidden">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
              Ingredientes Seleccionados
              <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">{ingredientes.length}</span>
            </h3>

            <div className="flex-1 overflow-y-auto mb-4 min-h-0">
              {ingredientes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                  <Utensils className="w-12 h-12 mb-2 opacity-20" />
                  No has agregado ingredientes
                </div>
              ) : (
                <ul className="space-y-3 pr-2">
                  {ingredientes.map((item) => (
                    <li key={item.alimento_id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{item.nombre}</p>
                        <p className="text-xs text-gray-500">
                          {Math.round((item.calorias_100g * item.gramos) / 100)} kcal
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={item.gramos}
                          onChange={(e) => handleChangeGramos(item.alimento_id, Number(e.target.value))}
                          className="w-20 border border-gray-300 rounded text-sm p-1 text-center outline-none focus:border-teal-500"
                        />
                        <span className="text-xs text-gray-500 font-medium">g</span>
                        <button
                          onClick={() => handleQuitarIngrediente(item.alimento_id)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors ml-1"
                          aria-label={`Quitar ${item.nombre}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Totales y guardar */}
            <div className="border-t border-gray-200 pt-4 mt-auto">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total estimado</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(caloriasTotales)} <span className="text-base font-medium text-gray-500">kcal</span>
                  </p>
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-600 mb-3" role="alert">
                  {error}
                </p>
              )}
              <button
                onClick={handleGuardar}
                disabled={ocupado || ingredientes.length === 0 || !nombre.trim()}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors shadow-sm"
              >
                {ocupado ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {subiendoImagen
                  ? 'Subiendo imagen...'
                  : guardando
                    ? 'Guardando...'
                    : esEdicion
                      ? 'Guardar Cambios'
                      : 'Guardar Preparación'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal anidado: alta de alimento (se selecciona como ingrediente al crear) */}
      <ModalNuevoAlimento
        isOpen={modalAlimentoAbierto}
        onClose={() => setModalAlimentoAbierto(false)}
        nombreInicial={busqueda.trim()}
        onCreated={handleAgregarAlimento}
      />
    </div>,
    document.body,
  );
};
