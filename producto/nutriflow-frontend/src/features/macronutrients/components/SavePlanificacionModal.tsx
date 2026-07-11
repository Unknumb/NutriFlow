import { useEffect, useRef, useState } from "react";
import { X, Save } from "lucide-react";

/** Resumen de una planificación existente del paciente (para sobrescribir). */
export interface PlanificacionResumen {
    id: string;
    nombre?: string | null;
    calorias_totales: number;
    activa: boolean;
}

/** Decisión tomada en el modal: crear una planificación nueva o sobrescribir una existente. */
export type SaveDecision =
    | { mode: "create"; nombre: string }
    | { mode: "overwrite"; planificacionId: string };

interface Props {
    open: boolean;
    /** Nombre sugerido automáticamente (ej. "Planificación 3"). */
    suggestedName: string;
    /** Planificaciones existentes del paciente; habilitan la opción de sobrescribir. */
    planificaciones: PlanificacionResumen[];
    isSaving: boolean;
    onClose: () => void;
    onConfirm: (decision: SaveDecision) => void;
}

export const SavePlanificacionModal = ({ open, suggestedName, planificaciones, isSaving, onClose, onConfirm }: Props) => {
    const [nombre, setNombre] = useState(suggestedName);
    const [mode, setMode] = useState<"create" | "overwrite">("create");
    const [overwriteId, setOverwriteId] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);

    const hayExistentes = planificaciones.length > 0;

    // Al abrir, prerellenar con la sugerencia y seleccionar el texto para editar rápido.
    useEffect(() => {
        if (open) {
            setNombre(suggestedName);
            setMode("create");
            // Por defecto se ofrece sobrescribir la planificación activa del paciente.
            const activa = planificaciones.find((p) => p.activa);
            setOverwriteId(activa?.id || planificaciones[0]?.id || "");
            requestAnimationFrame(() => inputRef.current?.select());
        }
        // planificaciones solo importa en el instante de abrir el modal.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, suggestedName]);

    if (!open) return null;

    const handleConfirm = () => {
        if (mode === "overwrite") {
            if (!overwriteId) return;
            onConfirm({ mode: "overwrite", planificacionId: overwriteId });
            return;
        }
        const limpio = nombre.trim();
        onConfirm({ mode: "create", nombre: limpio || suggestedName });
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

                <div className="px-5 py-4 space-y-3">
                    <label className={`flex items-start gap-2.5 rounded-lg border p-3 cursor-pointer transition-colors ${mode === "create" ? "border-pine-soft bg-pine-soft/5" : "border-mist"}`}>
                        <input
                            type="radio"
                            name="save-mode"
                            checked={mode === "create"}
                            onChange={() => setMode("create")}
                            className="mt-0.5 accent-[#1F3D33]"
                        />
                        <span className="flex-1">
                            <span className="block text-xs font-semibold text-ink">Crear una planificación nueva</span>
                            <input
                                id="nombre-planif"
                                ref={inputRef}
                                type="text"
                                value={nombre}
                                disabled={mode !== "create"}
                                onFocus={() => setMode("create")}
                                onChange={(e) => setNombre(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleConfirm();
                                }}
                                maxLength={60}
                                className="mt-1.5 w-full rounded-lg border border-mist bg-porcelain px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-pine-soft disabled:opacity-50"
                                placeholder={suggestedName}
                            />
                            <span className="mt-1.5 block text-xs text-ink-soft">
                                Se sugiere <span className="font-medium text-ink">{suggestedName}</span>.
                            </span>
                        </span>
                    </label>

                    <label className={`flex items-start gap-2.5 rounded-lg border p-3 transition-colors ${!hayExistentes ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${mode === "overwrite" ? "border-pine-soft bg-pine-soft/5" : "border-mist"}`}>
                        <input
                            type="radio"
                            name="save-mode"
                            checked={mode === "overwrite"}
                            disabled={!hayExistentes}
                            onChange={() => setMode("overwrite")}
                            className="mt-0.5 accent-[#1F3D33]"
                        />
                        <span className="flex-1">
                            <span className="block text-xs font-semibold text-ink">Sobrescribir una existente</span>
                            {hayExistentes ? (
                                <>
                                    <select
                                        aria-label="Planificación a sobrescribir"
                                        value={overwriteId}
                                        disabled={mode !== "overwrite"}
                                        onChange={(e) => setOverwriteId(e.target.value)}
                                        className="mt-1.5 w-full rounded-lg border border-mist bg-porcelain px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-pine-soft disabled:opacity-50"
                                    >
                                        {planificaciones.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {(p.nombre || "Planificación") + " · " + Math.round(p.calorias_totales) + " kcal" + (p.activa ? " (activa)" : "")}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="mt-1.5 block text-xs text-ink-soft">
                                        Reemplaza sus calorías y macros por los actuales y la deja como activa.
                                    </span>
                                </>
                            ) : (
                                <span className="mt-1 block text-xs text-ink-soft">
                                    El paciente aún no tiene planificaciones guardadas.
                                </span>
                            )}
                        </span>
                    </label>
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
                        disabled={isSaving || (mode === "overwrite" && !overwriteId)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-pine px-4 py-2 text-xs font-semibold text-porcelain transition-colors hover:bg-pine-soft disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save className="h-3.5 w-3.5" />
                        {isSaving ? "Guardando..." : mode === "overwrite" ? "Sobrescribir" : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
};
