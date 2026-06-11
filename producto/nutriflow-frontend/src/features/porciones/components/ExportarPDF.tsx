import React from "react";
import { Download, Building2, Loader2 } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { usePortions } from "../hooks/usePortions";
import { PautaDocumentPDF } from "./PautaDocumentPDF";

const ALL_GROUPS = [
  { id: "cer", label: "Cereales", emoji: "🌾", bg: "bg-amber-100", text: "text-amber-900", options: "Arroz / Fideos / Pasta / Papa cocida" },
  { id: "fru", label: "Frutas", emoji: "🍎", bg: "bg-orange-100", text: "text-orange-900", options: "Fruta a gusto / Plátano / Uvas" },
  { id: "veg", label: "Verduras", emoji: "🥦", bg: "bg-green-100", text: "text-green-900", options: "Zanahoria / Brócoli / Coliflor" },
  { id: "vlb", label: "Verd. Libre", emoji: "🥗", bg: "bg-emerald-100", text: "text-emerald-900", options: "Lechuga / Apio / Pepino" },
  { id: "cag", label: "Carnes Altas", emoji: "🥓", bg: "bg-red-100", text: "text-red-900", options: "Cerdo / Cordero / Embutidos" },
  { id: "cbg", label: "Carnes Bajas", emoji: "🍗", bg: "bg-red-100", text: "text-red-900", options: "Pollo / Pavo / Pescado blanco" },
  { id: "leg", label: "Leguminosas", emoji: "🫘", bg: "bg-yellow-100", text: "text-yellow-900", options: "Lentejas / Porotos / Garbanzos" },
  { id: "lag", label: "Lác. Altos", emoji: "🧀", bg: "bg-purple-100", text: "text-purple-900", options: "Queso amarillo / Queso crema" },
  { id: "lmg", label: "Lác. Medios", emoji: "🥛", bg: "bg-teal-100", text: "text-teal-900", options: "Leche semi / Yogurt normal" },
  { id: "lbg", label: "Lác. Bajos", emoji: "🥛", bg: "bg-blue-100", text: "text-blue-900", options: "Leche descremada / Quesillo" },
  { id: "ace", label: "Aceites", emoji: "🫒", bg: "bg-yellow-100", text: "text-yellow-900", options: "Aceite de oliva / Mayonesa" },
  { id: "arg", label: "ARG", emoji: "🥑", bg: "bg-lime-100", text: "text-lime-900", options: "Palta / Almendras / Nueces" },
  { id: "azu", label: "Azúcar", emoji: "🍯", bg: "bg-pink-100", text: "text-pink-900", options: "Azúcar / Miel / Manjar" }
];

const MEALS = [
  { id: "desayuno", time: "07:00", name: "Desayuno" },
  { id: "colacion_am", time: "09:00\n11:00", name: "Colación AM" },
  { id: "almuerzo", time: "13:00", name: "Almuerzo" },
  { id: "colacion_pm", time: "15:00\n16:00", name: "Colación PM" },
  { id: "once", time: "19:00\n20:00", name: "Once" },
];

export const ExportarPDF = () => {
  const { state, computed } = usePortions();
  const { patientContext, distributions, targets } = state;
  const { getGroupTotal } = computed;

  const currentDate = new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
  const fileName = `Pauta_${patientContext.name.replace(/\s+/g, "_")}.pdf`;

  // Empaquetamos los datos para enviarlos al PDF Vectorial
  const pdfData = {
    patientContext,
    currentDate,
    distributions,
    targets,
    totals: ALL_GROUPS.reduce((acc, g) => {
      acc[g.id] = getGroupTotal(g.id);
      return acc;
    }, {} as Record<string, number>),
  };

  return (
    <div className="animate-in fade-in duration-300 outline-none flex-1 overflow-auto m-0 p-6 bg-gray-50/50">
      <div className="flex items-center justify-between mb-5 max-w-[794px] mx-auto">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Exportar a PDF
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Vista previa del entregable para el paciente
          </p>
        </div>

        <PDFDownloadLink
          document={<PautaDocumentPDF data={pdfData} />}
          fileName={fileName}
        >
          {({ loading }) => (
            <button
              disabled={loading}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-md cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Exportar a PDF
                </>
              )}
            </button>
          )}
        </PDFDownloadLink>
      </div>

      {/* VISTA PREVIA REACTIVA (Responde a Zustand) */}
      <div className="flex justify-center pb-12">
        <div
          className="bg-white shadow-2xl rounded-sm"
          style={{
            width: "794px",
            minHeight: "1123px",
            padding: "48px 56px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-teal-600">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-5 h-5 text-teal-600" />
                <span className="text-lg font-bold text-teal-700">
                  Dra. Javiera Silva N.
                </span>
              </div>
              <p className="text-sm text-gray-500">Nutricionista Clínica</p>
            </div>
          </div>

          <div className="mb-5 flex items-center justify-between bg-teal-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-xs text-teal-600 uppercase tracking-wide font-medium">
                Paciente
              </p>
              <p className="text-base font-bold text-teal-900">
                {patientContext.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-teal-600 uppercase tracking-wide font-medium">
                Fecha
              </p>
              <p className="text-sm font-semibold text-teal-900">
                {currentDate}
              </p>
            </div>
          </div>

          <h1 className="text-center text-xl font-bold text-gray-900 mb-5 pb-2 border-b border-gray-200">
            Plan de Alimentación por Porciones
          </h1>

          <table
            className="w-full border-collapse mb-4"
            style={{ fontSize: "11px" }}
          >
            <thead>
              <tr>
                <th className="bg-teal-700 text-white px-3 py-2 text-left font-bold border border-teal-600 w-20">
                  Hora
                </th>
                <th className="bg-teal-700 text-white px-3 py-2 text-left font-bold border border-teal-600 w-28">
                  Comida
                </th>
                <th className="bg-teal-700 text-white px-3 py-2 text-left font-bold border border-teal-600 w-32">
                  Porción
                </th>
                <th className="bg-teal-700 text-white px-3 py-2 text-left font-bold border border-teal-600">
                  Opciones (elige una)
                </th>
              </tr>
            </thead>
            <tbody>
              {MEALS.map((meal, mealIdx) => {
                const activeGroups = ALL_GROUPS.filter(
                  (g) => distributions[meal.id]?.[g.id] > 0,
                );
                const rowBg = mealIdx % 2 === 0 ? "bg-white" : "bg-gray-50";

                return (
                  <React.Fragment key={meal.id}>
                    {activeGroups.length === 0 ? (
                      <tr className={rowBg}>
                        <td className="border border-gray-200 px-3 py-2 align-middle font-mono font-semibold text-gray-700">
                          {meal.time.split("\n").map((t, i) => (
                            <div key={i}>{t}</div>
                          ))}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 align-middle font-bold text-gray-900">
                          {meal.name}
                        </td>
                        <td
                          colSpan={2}
                          className="border border-gray-200 px-3 py-2 text-center text-gray-400 italic"
                        >
                          Sin porciones asignadas
                        </td>
                      </tr>
                    ) : (
                      activeGroups.map((group, groupIdx) => (
                        <tr key={`${meal.id}-${group.id}`} className={rowBg}>
                          {groupIdx === 0 && (
                            <>
                              <td
                                className="border border-gray-200 px-3 py-2 align-middle font-mono font-semibold text-gray-700"
                                rowSpan={activeGroups.length}
                              >
                                {meal.time.split("\n").map((t, i) => (
                                  <div key={i}>{t}</div>
                                ))}
                              </td>
                              <td
                                className="border border-gray-200 px-3 py-2 align-middle font-bold text-gray-900"
                                rowSpan={activeGroups.length}
                              >
                                {meal.name}
                              </td>
                            </>
                          )}
                          <td className="border border-gray-200 px-3 py-1.5 align-middle">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${group.bg} ${group.text} font-bold shrink-0 text-[12px]`}
                              >
                                {distributions[meal.id][group.id]}
                              </span>
                              <span className="font-semibold text-gray-800">
                                {group.label}
                              </span>
                            </div>
                          </td>
                          <td className="border border-gray-200 px-3 py-1.5 align-middle text-gray-600">
                            {group.options}
                          </td>
                        </tr>
                      ))
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          <div
            className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-4"
            style={{ fontSize: "11px" }}
          >
            <p className="font-bold text-teal-800 uppercase tracking-wide mb-2">
              Resumen de Porciones Diarias
            </p>
            <div className="grid grid-cols-6 gap-2">
              {ALL_GROUPS.filter(g => targets[g.id] > 0 || pdfData.totals[g.id] > 0).map((g) => {
                const total = pdfData.totals[g.id] || 0;
                const target = targets[g.id] || 0;
                const isExact = total === target;
                return (
                  <div
                    key={g.id}
                    className={`text-center rounded-lg p-1.5 border ${isExact ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}
                  >
                    <div className="text-base">{g.emoji}</div>
                    <div className="text-xs font-medium text-gray-700 leading-tight">
                      {g.label}
                    </div>
                    <div
                      className={`font-bold ${isExact ? "text-emerald-700" : "text-amber-700"}`}
                    >
                      {total}/{target}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
