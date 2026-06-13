import React, { useState } from 'react';
import { isAxiosError } from 'axios';
import { Search, Plus, Pencil, Trash2, Loader2, Apple } from 'lucide-react';
import type { ApiError } from '../../../shared/api/apiClient';
import { PageHeader } from '../../../shared/ui/organisms/PageHeader';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';
import { useBuscarAlimentos, useCategorias, useEliminarAlimento } from '../hooks/useBuscarAlimentos';
import { ModalNuevoAlimento } from './ModalNuevoAlimento';
import type { Alimento } from '../types/alimento.types';

function mensajeError(error: unknown): string {
  if (isAxiosError<ApiError>(error)) {
    const m = error.response?.data?.message;
    if (typeof m === 'string') return m;
    if (Array.isArray(m)) return m.join('. ');
  }
  return 'No se pudo completar la acción. Intenta nuevamente.';
}

export const GestionAlimentos: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<string>('');
  const busquedaDebounced = useDebouncedValue(busqueda, 300);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Alimento | undefined>(undefined);
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const { data: categorias } = useCategorias();
  const eliminar = useEliminarAlimento();

  const { data, isLoading, isFetching } = useBuscarAlimentos({
    search: busquedaDebounced,
    categoria: categoria || null,
    limit: 30,
  });

  const alimentos = data?.items ?? [];
  const total = data?.total ?? 0;
  const hayFiltro = busquedaDebounced.trim().length > 0 || !!categoria;

  const abrirNuevo = () => {
    setEditando(undefined);
    setModalAbierto(true);
  };
  const abrirEdicion = (a: Alimento) => {
    setEditando(a);
    setModalAbierto(true);
  };

  const handleEliminar = async (a: Alimento) => {
    if (!window.confirm(`¿Eliminar "${a.nombre}"${a.marca ? ` (${a.marca})` : ''} del catálogo?`)) return;
    setAviso(null);
    setEliminandoId(a.id);
    try {
      await eliminar.mutateAsync(a.id);
      setAviso({ tipo: 'ok', texto: `"${a.nombre}" se eliminó del catálogo.` });
    } catch (e) {
      setAviso({ tipo: 'error', texto: mensajeError(e) });
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-porcelain flex-1 overflow-y-auto w-full">
      <div className="p-8 max-w-5xl mx-auto w-full">
        <PageHeader
          eyebrow="Catálogo"
          title="Alimentos"
          description="Busca, edita la categoría o elimina alimentos del catálogo"
          actions={
            <button
              onClick={abrirNuevo}
              className="inline-flex items-center gap-2 bg-pine hover:bg-pine-soft text-porcelain px-5 py-2.5 rounded-md text-sm font-medium transition-colors duration-150"
            >
              <Plus className="w-4 h-4" /> Nuevo alimento
            </button>
          }
        />

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft/50" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full pl-10 pr-3 py-2.5 border border-mist rounded-md bg-white text-sm text-ink outline-none focus:border-pine-soft focus:ring-1 focus:ring-pine-soft"
            />
          </div>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="px-3 py-2.5 border border-mist rounded-md bg-white text-sm text-ink outline-none focus:border-pine-soft focus:ring-1 focus:ring-pine-soft sm:w-64"
          >
            <option value="">Todas las categorías</option>
            {(categorias ?? []).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {aviso && (
          <div
            className={`mb-4 p-3 rounded-md text-sm border ${
              aviso.tipo === 'ok'
                ? 'bg-pine-soft/5 border-pine-soft/30 text-pine-soft'
                : 'bg-clinical-red/5 border-clinical-red/30 text-clinical-red'
            }`}
            role="alert"
          >
            {aviso.texto}
          </div>
        )}

        {/* Lista */}
        <div className="bg-white border border-mist rounded-card overflow-hidden">
          {!hayFiltro ? (
            <div className="p-10 text-center text-ink-soft">
              <Apple className="w-8 h-8 mx-auto mb-2 text-ink-soft/40" />
              Busca por nombre o elige una categoría para ver y gestionar los alimentos.
            </div>
          ) : isLoading ? (
            <div className="p-10 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-pine-soft" />
            </div>
          ) : alimentos.length === 0 ? (
            <div className="p-10 text-center text-ink-soft">No se encontraron alimentos con esos filtros.</div>
          ) : (
            <>
              <div className="px-4 py-2.5 border-b border-mist flex items-center justify-between text-xs text-ink-soft">
                <span>Mostrando {alimentos.length} de {total}</span>
                {isFetching && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              </div>
              <ul className="divide-y divide-mist/70">
                {alimentos.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 px-4 py-3 hover:bg-porcelain/60">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink truncate">
                        {a.nombre}
                        {a.marca && <span className="text-ink-soft/60 font-normal"> · {a.marca}</span>}
                      </p>
                      <p className="text-xs text-ink-soft mt-0.5">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-mist/60 text-ink-soft mr-2">{a.categoria ?? 'Sin categoría'}</span>
                        <span className="tnum">{Math.round(a.calorias_100g)} kcal/100g</span>
                      </p>
                    </div>
                    <button
                      onClick={() => abrirEdicion(a)}
                      className="p-2 rounded-md text-ink-soft/70 hover:text-pine-soft hover:bg-pine-soft/5 transition-colors"
                      title="Editar / mover de categoría"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEliminar(a)}
                      disabled={eliminandoId === a.id}
                      className="p-2 rounded-md text-ink-soft/70 hover:text-clinical-red hover:bg-clinical-red/5 transition-colors disabled:opacity-50"
                      title="Eliminar del catálogo"
                    >
                      {eliminandoId === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <ModalNuevoAlimento
        isOpen={modalAbierto}
        alimentoExistente={editando}
        onClose={() => setModalAbierto(false)}
        onCreated={() => setAviso({ tipo: 'ok', texto: 'Alimento creado en el catálogo.' })}
        onUpdated={(a) => setAviso({ tipo: 'ok', texto: `"${a.nombre}" se actualizó.` })}
      />
    </div>
  );
};
