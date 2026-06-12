// nutriflow-frontend/src/features/alimentos/components/ModalNuevoAlimento.tsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { isAxiosError } from 'axios';
import { Apple, Loader2, Save, X } from 'lucide-react';
import type { ApiError } from '../../../shared/api/apiClient';
import { ChipsInput } from '../../pacientes/components/ChipsInput';
import { useCategorias, useCrearAlimento } from '../hooks/useBuscarAlimentos';
import type { Alimento } from '../types/alimento.types';

interface ModalNuevoAlimentoProps {
  isOpen: boolean;
  onClose: () => void;
  /** Se invoca con el alimento recién creado (ej. para seleccionarlo como ingrediente). */
  onCreated?: (alimento: Alimento) => void;
  /** Pre-rellena el nombre con lo que el usuario estaba buscando. */
  nombreInicial?: string;
}

interface ValoresNutricionales {
  calorias_100g: string;
  proteinas_100g: string;
  carbohidratos_100g: string;
  grasas_100g: string;
}

const VALORES_INICIALES: ValoresNutricionales = {
  calorias_100g: '',
  proteinas_100g: '',
  carbohidratos_100g: '',
  grasas_100g: '',
};

const CAMPOS_NUTRICIONALES: { campo: keyof ValoresNutricionales; etiqueta: string }[] = [
  { campo: 'calorias_100g', etiqueta: 'Calorías (kcal)' },
  { campo: 'proteinas_100g', etiqueta: 'Proteínas (g)' },
  { campo: 'carbohidratos_100g', etiqueta: 'Carbohidratos (g)' },
  { campo: 'grasas_100g', etiqueta: 'Grasas (g)' },
];

function mensajeDeErrorApi(error: unknown): string {
  if (isAxiosError<ApiError>(error)) {
    if (error.response?.status === 409) {
      return 'Ya existe un alimento con ese nombre y marca. Búscalo en el catálogo en lugar de crearlo de nuevo.';
    }
    const mensaje = error.response?.data?.message;
    if (typeof mensaje === 'string') return mensaje;
    if (Array.isArray(mensaje)) return mensaje.join('. ');
  }
  return 'No se pudo crear el alimento. Intenta nuevamente.';
}

/**
 * Modal de alta de alimentos del catálogo (valores por 100 g).
 * La categoría es de vocabulario controlado: solo las existentes en el catálogo.
 * Al cerrarse se desmonta el formulario, así cada apertura parte con estado limpio.
 */
export const ModalNuevoAlimento: React.FC<ModalNuevoAlimentoProps> = ({ isOpen, ...rest }) => {
  if (!isOpen) return null;
  return <FormularioNuevoAlimento {...rest} />;
};

const FormularioNuevoAlimento: React.FC<Omit<ModalNuevoAlimentoProps, 'isOpen'>> = ({
  onClose,
  onCreated,
  nombreInicial = '',
}) => {
  const { data: categorias, isLoading: cargandoCategorias } = useCategorias();
  const { mutateAsync: crearAlimento, isPending: guardando } = useCrearAlimento();

  const [nombre, setNombre] = useState(nombreInicial);
  const [marca, setMarca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [valores, setValores] = useState<ValoresNutricionales>(VALORES_INICIALES);
  const [restricciones, setRestricciones] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleValorChange = (campo: keyof ValoresNutricionales, valor: string) => {
    setValores((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      setError('El nombre del alimento es obligatorio');
      return;
    }
    if (!categoria) {
      setError('Selecciona una categoría');
      return;
    }
    const numericos = CAMPOS_NUTRICIONALES.map(({ campo, etiqueta }) => ({
      campo,
      etiqueta,
      valor: Number(valores[campo]),
    }));
    const invalido = numericos.find(
      ({ campo, valor }) => valores[campo].trim() === '' || Number.isNaN(valor) || valor < 0,
    );
    if (invalido) {
      setError(`"${invalido.etiqueta}" debe ser un número mayor o igual a 0`);
      return;
    }

    setError(null);
    try {
      const creado = await crearAlimento({
        nombre: nombre.trim(),
        marca: marca.trim() || undefined,
        categoria,
        calorias_100g: Number(valores.calorias_100g),
        proteinas_100g: Number(valores.proteinas_100g),
        carbohidratos_100g: Number(valores.carbohidratos_100g),
        grasas_100g: Number(valores.grasas_100g),
        restricciones: restricciones.length > 0 ? restricciones : undefined,
      });
      onCreated?.(creado);
      onClose();
    } catch (e) {
      setError(mensajeDeErrorApi(e));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Apple className="w-5 h-5 text-teal-600" />
              Nuevo Alimento
            </h2>
            <p className="text-sm text-gray-500 mt-1">Valores nutricionales por 100 g</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Quinoa cocida"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca (opcional)</label>
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ej: Genérico"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                disabled={cargandoCategorias}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white disabled:bg-gray-50"
              >
                <option value="">
                  {cargandoCategorias ? 'Cargando...' : 'Selecciona una categoría'}
                </option>
                {(categorias ?? []).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {CAMPOS_NUTRICIONALES.map(({ campo, etiqueta }) => (
              <div key={campo}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{etiqueta} *</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={valores[campo]}
                  onChange={(e) => handleValorChange(campo, e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            ))}
          </div>

          <ChipsInput
            label="Restricciones dietéticas (opcional)"
            values={restricciones}
            onChange={setRestricciones}
            placeholder='Ej: "gluten", "lactosa" — Enter para agregar'
          />

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={guardando}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-colors shadow-sm"
            >
              {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {guardando ? 'Guardando...' : 'Crear Alimento'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
