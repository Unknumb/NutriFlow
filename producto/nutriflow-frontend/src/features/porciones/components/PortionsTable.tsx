import { Info, CheckCircle } from "lucide-react";
import { PortionCell } from "./PortionCell";
import { usePortions } from "../hooks/usePortions";
import { usePortionsStore } from "../store/usePortionsStore";

// 🚨 MAPEO EXPLÍCITO: Así Tailwind no borra las clases
const ALL_GROUPS = [
  { id: "cer", label: "Cereales", emoji: "🌾", headerBg: "bg-amber-500", targetBg: "bg-amber-500 border-amber-600", cellBg: "bg-amber-100", textBtn: "text-amber-900" },
  { id: "fru", label: "Frutas", emoji: "🍎", headerBg: "bg-orange-500", targetBg: "bg-orange-500 border-orange-600", cellBg: "bg-orange-100", textBtn: "text-orange-900" },
  { id: "veg", label: "Verduras Gral.", emoji: "🥦", headerBg: "bg-green-600", targetBg: "bg-green-600 border-green-700", cellBg: "bg-green-100", textBtn: "text-green-900" },
  { id: "vlb", label: "Verd. Libre", emoji: "🥗", headerBg: "bg-emerald-500", targetBg: "bg-emerald-500 border-emerald-600", cellBg: "bg-emerald-100", textBtn: "text-emerald-900" },
  { id: "cag", label: "Carnes Altas", emoji: "🥓", headerBg: "bg-red-700", targetBg: "bg-red-700 border-red-800", cellBg: "bg-red-100", textBtn: "text-red-900" },
  { id: "cbg", label: "Carnes Bajas", emoji: "🍗", headerBg: "bg-red-500", targetBg: "bg-red-500 border-red-600", cellBg: "bg-red-100", textBtn: "text-red-900" },
  { id: "leg", label: "Leguminosas", emoji: "🫘", headerBg: "bg-yellow-600", targetBg: "bg-yellow-600 border-yellow-700", cellBg: "bg-yellow-100", textBtn: "text-yellow-900" },
  { id: "lag", label: "Lác. Altos", emoji: "🧀", headerBg: "bg-purple-700", targetBg: "bg-purple-700 border-purple-800", cellBg: "bg-purple-100", textBtn: "text-purple-900" },
  { id: "lmg", label: "Lác. Medios", emoji: "🥛", headerBg: "bg-teal-500", targetBg: "bg-teal-500 border-teal-600", cellBg: "bg-teal-100", textBtn: "text-teal-900" },
  { id: "lbg", label: "Lác. Bajos", emoji: "🥛", headerBg: "bg-blue-500", targetBg: "bg-blue-500 border-blue-600", cellBg: "bg-blue-100", textBtn: "text-blue-900" },
  { id: "ace", label: "Aceites", emoji: "🫒", headerBg: "bg-yellow-400", targetBg: "bg-yellow-400 border-yellow-500", cellBg: "bg-yellow-100", textBtn: "text-yellow-900" },
  { id: "arg", label: "ARG", emoji: "🥑", headerBg: "bg-lime-600", targetBg: "bg-lime-600 border-lime-700", cellBg: "bg-lime-100", textBtn: "text-lime-900" },
  { id: "azu", label: "Azúcar", emoji: "🍯", headerBg: "bg-pink-500", targetBg: "bg-pink-500 border-pink-600", cellBg: "bg-pink-100", textBtn: "text-pink-900" }
];

const MEALS = [
  { id: "desayuno", time: "07:00", name: "Desayuno" },
  { id: "colacion_am", time: "09:00 - 11:00", name: "Colación AM" },
  { id: "almuerzo", time: "13:00", name: "Almuerzo" },
  { id: "colacion_pm", time: "15:00 - 16:00", name: "Colación PM" },
  { id: "once", time: "19:00 - 20:00", name: "Once" },
];

export const PortionsTable = () => {
  const { state, actions, computed } = usePortions();
  const { targets, distributions } = state;
  const { incrementPortion, decrementPortion } = actions;
  const { getGroupTotal } = computed;
  const { customFoods } = usePortionsStore();

  const COMBINED_GROUPS = [...ALL_GROUPS, ...customFoods];

  const visibleGroups = COMBINED_GROUPS.filter((g) => targets[g.id] && targets[g.id] > 0);

  if (visibleGroups.length === 0) {
    return (
      <div className="animate-in fade-in duration-300 p-8 text-center bg-gray-50 border border-dashed border-gray-300 rounded-xl">
        <p className="text-gray-500">Aún no has asignado porciones en el Armador de Pautas.</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-4 flex items-start gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 max-w-fit">
        <Info className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" />
        <p className="text-xs text-teal-800">
          <strong>
            Recuerda guiarte por el libro de porciones de intercambio.
          </strong>{" "}
          Haz click en cualquier número para editarlo.
        </p>
      </div>

      <div className="overflow-x-auto pb-4">
        <table className="border-collapse bg-white shadow-sm rounded-xl overflow-hidden w-full text-sm min-w-[800px]">
          <thead>
            <tr>
              <td
                rowSpan={2}
                className="bg-yellow-50 border border-gray-200 text-center align-middle p-3 w-[130px]"
              >
                <p className="text-xs text-gray-600 italic leading-snug">
                  Guíate por el libro de{" "}
                  <strong className="text-gray-800 not-italic">
                    porciones de intercambio
                  </strong>
                </p>
              </td>
              {visibleGroups.map((g) => (
                <th
                  key={g.id}
                  className={`${g.headerBg} text-white border border-gray-200 text-center px-2 py-2 w-20`}
                  style={(g as any).customColor ? { backgroundColor: (g as any).customColor, borderColor: (g as any).customColor } : undefined}
                >
                  <div 
                    className="text-lg mb-1 leading-none cursor-grab active:cursor-grabbing transition-transform hover:scale-125"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("groupId", g.id);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    title="Arrastra este emoji a los espacios con '+'"
                  >
                    {g.emoji}
                  </div>
                  <div className="text-xs font-bold leading-tight">
                    {g.label}
                  </div>
                </th>
              ))}
            </tr>
            <tr>
              {visibleGroups.map((g) => (
                <td
                  key={`target-${g.id}`}
                  className={`${g.targetBg} border text-center py-1`}
                  style={(g as any).customColor ? { backgroundColor: (g as any).customColor, borderColor: (g as any).customColor } : undefined}
                >
                  <button className="font-bold text-sm text-white">
                    {targets[g.id] || 0}
                  </button>
                </td>
              ))}
            </tr>
            <tr className="bg-gray-100">
              <td className="border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 text-center">
                N° Porciones DIARIO
              </td>
              {visibleGroups.map((g) => (
                <td
                  key={`target-txt-${g.id}`}
                  className="border border-gray-200 text-center"
                >
                  <span className="text-sm font-bold text-gray-700">
                    {targets[g.id] || 0}
                  </span>
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEALS.map((meal, idx) => (
              <tr
                key={meal.id}
                className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors`}
              >
                <td className="border border-gray-200 p-2 text-left">
                  <div className="text-xs text-gray-500 font-mono">
                    {meal.time}
                  </div>
                  <span className="font-bold text-sm text-gray-800">
                    {meal.name}
                  </span>
                </td>
                {visibleGroups.map((g) => {
                  const val = distributions[meal.id]?.[g.id] || 0;
                  return (
                    <td
                      key={`${meal.id}-${g.id}`}
                      className={`border border-gray-200 text-center p-1 transition-colors ${val === 0 ? 'hover:bg-gray-100' : ''}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "copy";
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const droppedGroupId = e.dataTransfer.getData("groupId");
                        if (droppedGroupId) {
                          incrementPortion(meal.id, droppedGroupId);
                        }
                      }}
                    >
                      <PortionCell
                        value={val}
                        cellBg={g.cellBg}
                        textBtn={g.textBtn}
                        onIncrement={() => incrementPortion(meal.id, g.id)}
                        onDecrement={() => decrementPortion(meal.id, g.id)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="bg-gray-100 border-t-2 border-gray-300">
              <td className="border border-gray-200 p-2 text-xs font-bold text-gray-700 text-right uppercase tracking-wide">
                Total
              </td>
              {visibleGroups.map((g) => {
                const total = getGroupTotal(g.id);
                const target = targets[g.id] || 0;
                let balance = 'exact';
                if (total > target) balance = 'over';
                if (total < target) balance = 'under';
                
                const colorClass =
                  balance === "exact"
                    ? "text-emerald-700"
                    : balance === "over"
                      ? "text-red-600"
                      : "text-amber-600";
                return (
                  <td
                    key={`total-${g.id}`}
                    className="border border-gray-200 text-center py-2"
                  >
                    <span className={`text-sm font-bold ${colorClass}`}>
                      {total}
                    </span>
                  </td>
                );
              })}
            </tr>
            <tr className="bg-white">
              <td className="border border-gray-200 p-2 text-xs font-bold text-gray-700 text-right uppercase tracking-wide">
                Balance
              </td>
              {visibleGroups.map((g) => {
                const total = getGroupTotal(g.id);
                const target = targets[g.id] || 0;
                let balance = 'exact';
                if (total > target) balance = 'over';
                if (total < target) balance = 'under';
                
                return (
                  <td
                    key={`balance-${g.id}`}
                    className={`border border-gray-100 text-center py-2 ${balance === "exact" ? "bg-emerald-50" : balance === "over" ? "bg-red-50" : "bg-amber-50"}`}
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

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
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
        <span className="text-gray-400 ml-auto">
          · Haz click en horas o metas para editarlas
        </span>
      </div>
    </div>
  );
};
