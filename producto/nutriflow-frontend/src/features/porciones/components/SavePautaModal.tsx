import { useEffect, useRef, useState } from "react";
import { X, Save } from "lucide-react";

interface Props {
    open: boolean;
    /** Nombre actual (al editar) o sugerido (al crear). */
    defaultName: string;
    /** true si se está actualizando una pauta existente. */
    isEditing: boolean;
    isSaving: boolean;
    onClose: () => void;
    onConfirm: (nombre: string) => void;
}

export const SavePautaModal = ({ open, defaultName, isEditing, isSaving, onClose, onConfirm }: Props) => {
    const [nombre, setNombre] = useState(defaultName);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setNombre(defaultName);
            requestAnimationFrame(() => inputRef.current?.select());
        }
    }, [open, defaultName]);

    if (!open) return null;

    const handleConfirm = () => onConfirm(nombre.trim() || defaultName);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-pauta-title"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-card border border-mist bg-white shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-mist px-5 py-4">
                    <h2 id="save-pauta-title" className="text-sm font-semibold text-ink">
                        {isEditing ? "Guardar cambios de la pauta" : "Guardar pauta nueva"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-md p-1 text-ink-soft transition-colors hover:bg-porcelain"
                        aria-label="Cerrar"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="px-5 py-4">
                    <label htmlFor="nombre-pauta" className="text-xs font-medium text-ink-soft">
                        Nombre de la pauta
                    </label>
                    <input
                        id="nombre-pauta"
                        ref={inputRef}
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleConfirm();
                        }}
                        maxLength={60}
                        className="mt-1.5 w-full rounded-lg border border-mist bg-porcelain px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-pine-soft"
                        placeholder={defaultName}
                    />
                    <p className="mt-2 text-xs text-ink-soft">
                        {isEditing
                            ? "Se actualizará la pauta seleccionada con la distribución actual."
                            : "Ej. \"Día de entrenamiento\" o \"Día de descanso\". Quedará guardada en la planificación activa."}
                    </p>
                </div>

                <div className="flex justify-end gap-2 border-t border-mist px-5 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-mist bg-white px-4 py-2 text-xs font-medium text-ink-soft transition-colors hover:bg-porcelain"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-pine px-4 py-2 text-xs font-semibold text-porcelain transition-colors hover:bg-pine-soft disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save className="h-3.5 w-3.5" />
                        {isSaving ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
};
