import { Download, Loader2 } from "lucide-react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { usePortions } from "../hooks/usePortions";
import { PautaDocumentPDF } from "./PautaDocumentPDF";
import { useClinicalStore } from "../../../shared/store/useClinicalStore";
import { usePacientes } from "../../pacientes/hooks/usePacientes";
import { usePerfilNutricionista } from "../../perfil/hooks/usePerfil";
import { useMacronutrientsSetup } from "../../macronutrients/hooks/useMacronutrientsSetup";
import { resolverComida } from "../constants";

const GROUP_IDS = ["cer", "fru", "veg", "cag", "cbg", "leg", "lag", "lmg", "lbg", "ace", "arg", "gbg", "azu"];

export const ExportarPDF = () => {
  const { state, computed } = usePortions();
  const { patientContext, distributions, targets, activeMeals, customMeals, mealTimes } = state;
  const { getGroupTotal } = computed;

  const activePatient = useClinicalStore((s) => s.activePatient);
  const { data: pacientes } = usePacientes();
  const { data: perfil } = usePerfilNutricionista();
  const { totals } = useMacronutrientsSetup();

  // Datos completos del paciente (RUT y demás) desde la ficha; si no hay, usamos el contexto.
  const fichaPaciente = (pacientes ?? []).find((p) => p.id === activePatient?.id);

  const fechaEmision = new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const tallaM = (activePatient?.talla || 0) / 100;
  const imc = tallaM > 0 && activePatient?.peso
    ? (activePatient.peso / (tallaM * tallaM)).toFixed(1)
    : "";

  const nombreNutri = perfil
    ? `${perfil.nombre} ${perfil.apellido}`.trim()
    : "";

  const pdfData = {
    paciente: {
      nombre: patientContext.name,
      rut: fichaPaciente?.rut || "",
      edad: activePatient?.edad || 0,
      sexo: activePatient?.sexo || "",
      peso: activePatient?.peso || 0,
      talla: activePatient?.talla || 0,
      imc,
    },
    nutricionista: {
      nombre: nombreNutri,
      registro: perfil?.registro_profesional || "",
    },
    fechaEmision,
    objetivos: {
      kcal: totals.prot.kcal + totals.cho.kcal + totals.fat.kcal,
      prot_g: totals.prot.g,
      cho_g: totals.cho.g,
      fat_g: totals.fat.g,
    },
    distributions,
    targets,
    // Comidas activas resueltas (predefinidas + personalizadas, con horario)
    comidas: activeMeals.map((id) => resolverComida(id, customMeals, mealTimes)),
    totals: GROUP_IDS.reduce((acc, id) => {
      acc[id] = getGroupTotal(id);
      return acc;
    }, {} as Record<string, number>),
  };

  const fileName = `Pauta_${patientContext.name.replace(/\s+/g, "_")}.pdf`;

  return (
    <div className="animate-in fade-in duration-300 outline-none flex-1 overflow-auto m-0 p-6 bg-porcelain">
      <div className="flex items-center justify-between mb-5 max-w-[820px] mx-auto">
        <div>
          <h2 className="text-lg font-semibold text-ink">Exportar a PDF</h2>
          <p className="text-sm text-ink-soft mt-0.5">Documento para el paciente y la ficha clínica</p>
        </div>

        <PDFDownloadLink document={<PautaDocumentPDF data={pdfData} />} fileName={fileName}>
          {({ loading }) => (
            <button
              disabled={loading}
              className="inline-flex items-center gap-2 bg-pine hover:bg-pine-soft disabled:opacity-60 text-porcelain px-6 py-2.5 rounded-md text-sm font-semibold transition-colors duration-150 shadow-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Descargar PDF
                </>
              )}
            </button>
          )}
        </PDFDownloadLink>
      </div>

      {/* Vista previa real: renderiza el mismo documento que se descarga. */}
      <div className="flex justify-center pb-12">
        <PDFViewer
          showToolbar={false}
          style={{ width: "820px", height: "1160px", border: "1px solid #E8EAE3", borderRadius: 8 }}
        >
          <PautaDocumentPDF data={pdfData} />
        </PDFViewer>
      </div>
    </div>
  );
};
