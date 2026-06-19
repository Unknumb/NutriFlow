import { useEffect, useRef, useState } from "react";
import { X, Save } from "lucide-react";

interface Props {
    open: boolean;
    /** Nombre sugerido automáticamente (ej. "Planificación 3"). */
    suggestedName: string;
    isSaving: boolean;
    onClose: () => void;
    onConfirm: (nombre: string) => void;
}

export const SavePlanificacionModal = ({ open, suggestedName, isSaving, onClose, onConfirm }: Props) => {
    const [nombre, setNombre] = useState(suggestedName);
    const inputRef = useRef<HTMLInputElement>(null);

    // Al abrir, prerellenar con la sugerencia y seleccionar el texto para editar rápido.
    useEffect(() => {
        if (open) {
            setNombre(suggestedName);
            requestAnimationFrame(() => inputRef.current?.select());
        }
    }, [open, suggestedName]);

    if (!open) return null;

    const handleConfirm = () => {
        const limpio = nombre.trim();
        onConfirm(limpio || suggestedName);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-planif-title"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-card border border-mist bg-white shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-mist px-5 py-4">
                    <h2 id="save-planif-title" className="text-sm font-semibold text-ink">
                        Guardar planificación
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
                    <label htmlFor="nombre-planif" className="text-xs font-medium text-ink-soft">
                        Nombre de la planificación
                    </label>
                    <input
                        id="nombre-planif"
                        ref={inputRef}
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleConfirm();
                        }}
                        maxLength={60}
                        className="mt-1.5 w-full rounded-lg border border-mist bg-porcelain px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-pine-soft"
                        placeholder={suggestedName}
                    />
                    <p className="mt-2 text-xs text-ink-soft">
                        Se sugiere <span className="font-medium text-ink">{suggestedName}</span>. Puedes
                        personalizarlo para distinguir varias planificaciones del paciente.
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
