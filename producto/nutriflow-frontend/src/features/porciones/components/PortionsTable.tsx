import { Info, CheckCircle } from "lucide-react";
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import { useState } from "react";
import { PortionCell } from "./PortionCell";
import { DraggableGroupHeader } from "./DraggableGroupHeader";
import { DroppableMealRow } from "./DroppableMealRow";
import { usePortions } from "../hooks/usePortions";
import { NUTRITION_GROUPS, comidasOrdenadas } from "../constants";

export const PortionsTable = () => {
  const { state, actions, computed } = usePortions();
  const { targets, distributions, activeMeals, customFoods, customMeals, mealTimes } = state;
  const { incrementPortion, decrementPortion, setPortion } = actions;
  const { getGroupTotal, getGroupBalance } = computed;

  const [activeDragGroupId, setActiveDragGroupId] = useState<string | null>(null);
  const [activeDragPortion, setActiveDragPortion] = useState<{ mealId: string, groupId: string, value: number } | null>(null);

  const COMBINED_GROUPS = [...NUTRITION_GROUPS, ...(customFoods || [])];

  // Filtrar Grupos: Solo los que tienen meta asignada en el armador
  const visibleGroups = COMBINED_GROUPS.filter(
    (g) => targets[g.id] && targets[g.id] > 0,
  );

  // Comidas activas resueltas y ORDENADAS por horario (predefinidas + personalizadas)
  const visibleMeals = comidasOrdenadas(activeMeals, customMeals, mealTimes);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    const activeData = String(active.id).split("::");
    if (activeData[0] === "drag" && activeData[1] === "group") {
      setActiveDragGroupId(activeData[2]);
    } else if (activeData[0] === "drag" && activeData[1] === "portion") {
      setActiveDragPortion({ mealId: activeData[2], groupId: activeData[3], value: distributions[activeData[2]]?.[activeData[3]] || 0 });
    }
  };

  const handleDragEnd = (event: any) => {
    setActiveDragGroupId(null);
    setActiveDragPortion(null);
    const { active, over } = event;
    if (!over) {
      // Drop fuera de todo (zona nula) -> Si es una porción, la restamos
      const activeData = String(active.id).split("::");
      if (activeData[0] === "drag" && activeData[1] === "portion") {
        const mealId = activeData[2];
        const groupId = activeData[3];
        decrementPortion(mealId, groupId);
      }
      return;
    }

    const activeData = String(active.id).split("::");
    const overData = String(over.id).split("::");

    // active: drag-group-[groupId]
    // over: drop-meal-[mealId]
    if (
      activeData[0] === "drag" &&
      activeData[1] === "group" &&
      overData[0] === "drop" &&
      overData[1] === "meal"
    ) {
      const groupId = activeData[2];
      const mealId = overData[2];
      // Al arrastrar un grupo a una comida, sumamos una porción completa (1).
      setPortion(mealId, groupId, (distributions[mealId]?.[groupId] || 0) + 1);
    }

    // active: drag-portion-[mealId]-[groupId]
    // over: drop-header-palette
    if (
      activeData[0] === "drag" &&
      activeData[1] === "portion" &&
      over.id === "drop-header-palette"
    ) {
      const mealId = activeData[2];
      const groupId = activeData[3];
      decrementPortion(mealId, groupId);
    }
    
    // active: drag-portion-[sourceMealId]-[groupId]
    // over: drop-meal-[targetMealId]
    if (
      activeData[0] === "drag" &&
      activeData[1] === "portion" &&
      overData[0] === "drop" &&
      overData[1] === "meal"
    ) {
      const sourceMealId = activeData[2];
      const groupId = activeData[3];
      const targetMealId = overData[2];

      if (sourceMealId !== targetMealId) {
        // Mover la porción completa de una comida a otra.
        const val = distributions[sourceMealId]?.[groupId] || 0;
        setPortion(sourceMealId, groupId, 0);
        setPortion(targetMealId, groupId, (distributions[targetMealId]?.[groupId] || 0) + val);
      }
    }
  };

  const activeDragGroup = activeDragGroupId
    ? COMBINED_GROUPS.find((g) => g.id === activeDragGroupId)
    : null;
    
  const activeDragPortionGroup = activeDragPortion
    ? COMBINED_GROUPS.find((g) => g.id === activeDragPortion.groupId)
    : null;

  // Zona de droppable para la paleta superior
  const { setNodeRef: setHeaderRef, isOver: isHeaderOver } = useDroppable({
    id: "drop-header-palette",
  });

  if (visibleGroups.length === 0) {
    return (
      <div className="animate-in fade-in duration-300 p-8 text-center bg-porcelain border border-dashed border-mist rounded-xl mt-4">
        <p className="text-ink-soft">
          Aún no has asignado porciones en el Armador de Pautas.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-4 bg-pine-soft/5 border border-pine-soft/30 rounded-xl p-3 flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 text-pine-soft shrink-0 mt-0.5" />
        <p className="text-sm text-pine-soft leading-snug">
          <strong className="block mb-1 font-bold text-pine-soft">
            ¿Cómo asignar porciones?
          </strong>
          Arrastra el encabezado del grupo alimentario (ej. 🍎 Frutas) y
          suéltalo sobre el horario de comida deseado (ej. Desayuno) para sumar
          una porción.
          <br />
          Para restar, agarra la porción desde la comida y devuélvela hacia
          arriba, o usa los controles ▲ ▼.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto w-full pb-4">
          <table className="border-collapse bg-white shadow-sm rounded-xl overflow-hidden w-full text-sm min-w-[800px]">
            <thead
              ref={setHeaderRef}
              className={`transition-colors ${isHeaderOver ? "bg-red-50 outline outline-2 outline-red-300 outline-offset-[-2px]" : ""}`}
            >
              <tr>
                <td
                  rowSpan={2}
                  className="bg-yellow-50 border border-mist text-center align-middle p-3 w-[130px]"
                >
                  <p className="text-xs text-ink-soft italic leading-snug">
                    Guíate por el libro de{" "}
                    <strong className="text-ink not-italic">
                      porciones de intercambio
                    </strong>
                  </p>
                </td>
                {visibleGroups.map((g) => (
                  <DraggableGroupHeader key={g.id} group={g} />
                ))}
              </tr>
              <tr>
                {visibleGroups.map((g) => (
                  <td
                    key={`target-${g.id}`}
                    className={`${g.targetBg} border text-center py-1`}
                  >
                    <button className="font-bold text-sm text-white">
                      {targets[g.id]}
                    </button>
                  </td>
                ))}
              </tr>
              <tr className="bg-mist/60">
                <td className="border border-mist px-3 py-2 text-xs font-semibold text-ink-soft text-center">
                  N° Porciones DIARIO
                </td>
                {visibleGroups.map((g) => (
                  <td
                    key={`target-txt-${g.id}`}
                    className="border border-mist text-center"
                  >
                    <span className="text-sm font-bold text-ink-soft">
                      {targets[g.id]}
                    </span>
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleMeals.map((meal, idx) => (
                <DroppableMealRow key={meal.id} mealId={meal.id} idx={idx}>
                  <td className="border border-mist p-2 text-left pointer-events-none select-none">
                    <div className="text-xs text-ink-soft font-mono">
                      {meal.time}
                    </div>
                    <span className="font-bold text-sm text-ink">
                      {meal.name}
                    </span>
                  </td>
                  {visibleGroups.map((g) => (
                    <td
                      key={`${meal.id}-${g.id}`}
                      className="border border-mist text-center p-1"
                    >
                      <PortionCell
                        value={distributions[meal.id]?.[g.id] || 0}
                        cellBg={g.cellBg}
                        textBtn={g.textBtn}
                        mealId={meal.id}
                        groupId={g.id}
                        onIncrement={() => incrementPortion(meal.id, g.id)}
                        onDecrement={() => decrementPortion(meal.id, g.id)}
                        onSetPortion={(val) => setPortion(meal.id, g.id, val)}
                      />
                    </td>
                  ))}
                </DroppableMealRow>
              ))}
              <tr className="bg-mist/60 border-t-2 border-mist">
                <td className="border border-mist p-2 text-xs font-bold text-ink-soft text-right uppercase tracking-wide">
                  Total
                </td>
                {visibleGroups.map((g) => {
                  const total = getGroupTotal(g.id);
                  const balance = getGroupBalance(g.id);
                  const colorClass =
                    balance === "exact"
                      ? "text-emerald-700"
                      : balance === "over"
                        ? "text-red-600"
                        : "text-amber-600";
                  return (
                    <td
                      key={`total-${g.id}`}
                      className="border border-mist text-center py-2"
                    >
                      <span className={`text-sm font-bold ${colorClass}`}>
                        {total}
                      </span>
                    </td>
                  );
                })}
              </tr>
              <tr className="bg-white">
                <td className="border border-mist p-2 text-xs font-bold text-ink-soft text-right uppercase tracking-wide">
                  Balance
                </td>
                {visibleGroups.map((g) => {
                  const balance = getGroupBalance(g.id);
                  return (
                    <td
                      key={`balance-${g.id}`}
                      className={`border border-mist/70 text-center py-2 ${balance === "exact" ? "bg-emerald-50" : balance === "over" ? "bg-red-50" : "bg-amber-50"}`}
                    >
                      {balance === "exact" && (
                        <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" />
                      )}
                      {balance === "under" && (
                        <span className="text-amber-600 font-bold text-lg leading-none">
                          -
                        </span>
                      )}
                      {balance === "over" && (
                        <span className="text-red-500 font-bold text-lg leading-none">
                          +
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
          {activeDragGroup ? (
            <div
              className={`${activeDragGroup.headerBg} text-white rounded shadow-xl flex items-center justify-center gap-2 px-4 py-2 scale-110 rotate-3 opacity-90`}
            >
              <span className="text-2xl">{activeDragGroup.emoji}</span>
              <span className="font-bold text-sm">{activeDragGroup.label}</span>
            </div>
          ) : activeDragPortion && activeDragPortionGroup ? (
            <div
              className={`${activeDragPortionGroup.cellBg} rounded-lg px-2 py-0.5 flex flex-col items-center shadow-xl scale-110 rotate-3 opacity-90`}
            >
                <div className="flex items-center gap-0.5 py-1">
                    <span className={`font-bold text-base ${activeDragPortionGroup.textBtn}`}>{activeDragPortion.value}</span>
                </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink-soft bg-porcelain p-3 rounded-lg border border-mist">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span className="font-medium">Balance exacto</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex w-4 h-4 rounded bg-amber-100 border border-amber-300 text-amber-700 font-bold items-center justify-center">
            −
          </span>
          <span className="font-medium">Sin asignar</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex w-4 h-4 rounded bg-red-100 border border-red-300 text-red-700 font-bold items-center justify-center">
            +
          </span>
          <span className="font-medium">Excede meta</span>
        </div>
        <span className="text-ink-soft/60 ml-auto">
          · Haz click en horas o metas para editarlas · Usa "Guardar pauta" arriba para guardar
        </span>
      </div>
    </div>
  );
};
