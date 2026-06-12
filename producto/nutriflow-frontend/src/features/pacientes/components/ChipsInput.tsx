// nutriflow-frontend/src/features/pacientes/components/ChipsInput.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ChipsInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  /** Clases tailwind para el chip; por defecto teal. */
  chipClassName?: string;
}

/**
 * Input de etiquetas (chips): se agrega con Enter, se quita con click en la X.
 * Reutilizable para enfermedades, alergias y preferencias alimentarias.
 */
export const ChipsInput: React.FC<ChipsInputProps> = ({
  label,
  values,
  onChange,
  placeholder = 'Escribe y presiona Enter',
  chipClassName = 'bg-teal-50 text-teal-800 border-teal-200',
}) => {
  const [draft, setDraft] = useState('');

  const addChip = () => {
    const value = draft.trim();
    if (!value) return;
    // Evitar duplicados (case-insensitive)
    if (values.some(v => v.toLowerCase() === value.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...values, value]);
    setDraft('');
  };

  const removeChip = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addChip();
    } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
      removeChip(values.length - 1);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="w-full border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-colors">
        <div className="flex flex-wrap items-center gap-1.5">
          {values.map((value, index) => (
            <span
              key={`${value}-${index}`}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${chipClassName}`}
            >
              {value}
              <button
                type="button"
                onClick={() => removeChip(index)}
                className="hover:opacity-70 transition-opacity"
                aria-label={`Quitar ${value}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addChip}
            placeholder={values.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] text-sm py-0.5 px-1 outline-none border-none bg-transparent"
          />
        </div>
      </div>
    </div>
  );
};
