import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Paleta del sistema "Consulta moderna" (ver REDISENO.md). react-pdf no soporta
// variables CSS ni emojis con Helvetica, así que usamos hex directos y badges.
const PINE = "#1F3D33";
const PINE_SOFT = "#2E5547";
const INK = "#22302B";
const INK_SOFT = "#5A6660";
const MIST = "#E8EAE3";
const PORCELAIN = "#FAFAF7";
const MACRO_PROT = "#3E6B8C";
const MACRO_CHO = "#C98B3D";
const MACRO_GRA = "#7A5C8E";

const styles = StyleSheet.create({
  page: { paddingTop: 36, paddingHorizontal: 36, paddingBottom: 54, fontFamily: "Helvetica", backgroundColor: "#ffffff", color: INK },

  // Encabezado
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 2,
    borderBottomColor: PINE,
    paddingBottom: 10,
    marginBottom: 14,
  },
  brand: { fontSize: 9, color: PINE_SOFT, letterSpacing: 1, textTransform: "uppercase" },
  doctorName: { fontSize: 15, fontWeight: "bold", color: PINE, marginTop: 2 },
  doctorSub: { fontSize: 8, color: INK_SOFT, marginTop: 2 },
  docMetaLabel: { fontSize: 7, color: INK_SOFT, textTransform: "uppercase", letterSpacing: 0.5 },
  docMetaValue: { fontSize: 10, fontWeight: "bold", color: INK, marginTop: 1 },

  title: {
    fontSize: 13,
    fontWeight: "bold",
    color: INK,
    marginBottom: 10,
  },

  // Ficha del paciente
  patientBox: {
    backgroundColor: PORCELAIN,
    borderWidth: 1,
    borderColor: MIST,
    borderRadius: 6,
    padding: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  patientCell: { width: "25%", marginBottom: 4 },
  patientLabel: { fontSize: 6.5, color: INK_SOFT, textTransform: "uppercase", letterSpacing: 0.5 },
  patientValue: { fontSize: 10, fontWeight: "bold", color: INK, marginTop: 1 },

  // Objetivos nutricionales
  objRow: { flexDirection: "row", gap: 6, marginBottom: 12 },
  objCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
  },
  objLabel: { fontSize: 7, color: INK_SOFT, textTransform: "uppercase", letterSpacing: 0.5 },
  objValue: { fontSize: 13, fontWeight: "bold", marginTop: 2 },

  // Tabla de comidas
  sectionTitle: { fontSize: 9, fontWeight: "bold", color: PINE_SOFT, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  table: { width: "100%", borderWidth: 1, borderColor: MIST, borderRadius: 4, overflow: "hidden" },
  tableHeader: { flexDirection: "row", backgroundColor: PINE },
  headerText: { color: "#ffffff", fontSize: 8, fontWeight: "bold", padding: 7 },
  mealRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: MIST },
  timeCol: { width: "12%", padding: 7, borderRightWidth: 1, borderRightColor: MIST, justifyContent: "center" },
  timeText: { fontSize: 8, color: INK_SOFT },
  nameCol: { width: "18%", padding: 7, borderRightWidth: 1, borderRightColor: MIST, justifyContent: "center" },
  nameText: { fontSize: 9, fontWeight: "bold", color: INK },
  contentCol: { width: "70%" },
  portionItem: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f1ee", minHeight: 26, alignItems: "center" },
  portionBadgeCol: { width: "35%", flexDirection: "row", alignItems: "center", paddingLeft: 7 },
  optionsCol: { width: "65%", padding: 6, fontSize: 8, color: INK_SOFT },
  circle: { width: 16, height: 16, borderRadius: 8, justifyContent: "center", alignItems: "center", marginRight: 5 },
  circleText: { fontSize: 8, fontWeight: "bold" },

  // Resumen
  summaryGrid: { flexDirection: "row", gap: 4, flexWrap: "wrap", marginTop: 10 },
  summaryBadge: { width: "15.5%", marginBottom: 4, backgroundColor: PORCELAIN, borderWidth: 1, borderColor: MIST, borderRadius: 5, padding: 4, alignItems: "center" },

  // Indicaciones
  notesBox: { marginTop: 12, borderWidth: 1, borderColor: MIST, borderRadius: 6, padding: 10 },
  noteLine: { fontSize: 8, color: INK_SOFT, marginBottom: 3 },

  // Pie
  footer: { position: "absolute", bottom: 24, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: MIST, paddingTop: 6 },
  footerText: { fontSize: 7, color: INK_SOFT },
});

const ALL_GROUPS = [
  { id: "cer", label: "Cereales", pdfBg: "#F0E2CC", pdfText: "#7a5526", options: "Arroz / Fideos / Pasta / Papa cocida / Pan" },
  { id: "fru", label: "Frutas", pdfBg: "#FBE6D3", pdfText: "#8a5a2a", options: "Manzana / Plátano / Naranja / Uvas / Pera" },
  { id: "veg", label: "Verduras", pdfBg: "#DEE7E0", pdfText: "#2E5547", options: "Lechuga / Tomate / Zanahoria / Brócoli / Zapallo / Espinaca" },
  { id: "cag", label: "Carnes altas", pdfBg: "#EAD6D2", pdfText: "#8C3B2E", options: "Cerdo / Cordero / Carne molida corriente" },
  { id: "cbg", label: "Carnes bajas", pdfBg: "#EFDDD8", pdfText: "#B4533A", options: "Pollo / Pavo / Pescado blanco / Atún al agua" },
  { id: "leg", label: "Leguminosas", pdfBg: "#EBDFCB", pdfText: "#7a5526", options: "Lentejas / Porotos / Garbanzos / Arvejas" },
  { id: "lag", label: "Lác. altos", pdfBg: "#D5DEE6", pdfText: "#2F5570", options: "Queso mantecoso / Leche entera" },
  { id: "lmg", label: "Lác. medios", pdfBg: "#DBE4EB", pdfText: "#3E6B8C", options: "Leche semidescremada / Yogurt natural" },
  { id: "lbg", label: "Lác. bajos", pdfBg: "#E2EAF0", pdfText: "#2F5570", options: "Leche descremada / Quesillo / Yogurt diet" },
  { id: "ace", label: "Aceites", pdfBg: "#E6DECF", pdfText: "#6b5436", options: "Aceite de oliva / Aceite vegetal" },
  { id: "arg", label: "Ricos en grasa", pdfBg: "#E2DAE8", pdfText: "#5f4671", options: "Palta / Almendras / Nueces / Maní" },
  { id: "gbg", label: "Galletas bajas", pdfBg: "#EADBC8", pdfText: "#6e4f30", options: "Galletas de agua / soda / Champaña" },
  { id: "azu", label: "Azúcar", pdfBg: "#EDD9E0", pdfText: "#964a64", options: "Azúcar / Miel / Mermelada" },
];

const MEALS = [
  { id: "desayuno", time: "07:00 - 08:30", name: "Desayuno" },
  { id: "colacion_am", time: "10:30 - 11:30", name: "Colación AM" },
  { id: "almuerzo", time: "13:00 - 14:30", name: "Almuerzo" },
  { id: "colacion_pm", time: "16:00 - 17:30", name: "Colación PM" },
  { id: "once", time: "18:30 - 20:00", name: "Once" },
  { id: "cena", time: "21:00 - 22:00", name: "Cena" },
];

export interface PautaPdfData {
  paciente?: { nombre?: string; rut?: string; edad?: number; sexo?: string; peso?: number; talla?: number; imc?: string };
  nutricionista?: { nombre?: string; registro?: string };
  fechaEmision?: string;
  objetivos?: { kcal?: number; prot_g?: number; cho_g?: number; fat_g?: number };
  distributions?: Record<string, Record<string, number>>;
  targets?: Record<string, number>;
  totals?: Record<string, number>;
  comidas?: { id: string; name: string; time: string }[];
  /** Sugerencias del generador por comida (ejemplos de preparación). */
  sugerenciasComida?: Record<string, { id: string; nombre: string; ingredientes: string }[]>;
}

export const PautaDocumentPDF = ({ data }: { data: PautaPdfData }) => {
  const {
    paciente = {},
    nutricionista = {},
    fechaEmision,
    objetivos = {},
    distributions = {},
    targets = {},
    totals = {},
    sugerenciasComida = {},
  } = data ?? {};

  const grupos = ALL_GROUPS;
  const visibleGroups = grupos.filter((g) => (targets[g.id] || 0) > 0 || (totals[g.id] || 0) > 0);
  // Comidas: usa las resueltas (predefinidas + personalizadas) si vienen; si no, las default.
  const comidasBase = (data?.comidas && data.comidas.length > 0) ? data.comidas : MEALS;
  const mealsConPorciones = comidasBase.filter((m) => grupos.some((g) => (distributions[m.id]?.[g.id] || 0) > 0));
  const mealsAMostrar = mealsConPorciones.length > 0 ? mealsConPorciones : comidasBase.slice(0, 5);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>NutriFlow · Consulta nutricional</Text>
            <Text style={styles.doctorName}>{nutricionista.nombre || "Nutricionista"}</Text>
            <Text style={styles.doctorSub}>
              Nutricionista{nutricionista.registro ? ` · Reg. ${nutricionista.registro}` : ""}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.docMetaLabel}>Fecha de emisión</Text>
            <Text style={styles.docMetaValue}>{fechaEmision}</Text>
          </View>
        </View>

        <Text style={styles.title}>Plan de alimentación por porciones</Text>

        {/* Ficha del paciente */}
        <View style={styles.patientBox}>
          <View style={[styles.patientCell, { width: "50%" }]}>
            <Text style={styles.patientLabel}>Paciente</Text>
            <Text style={styles.patientValue}>{paciente.nombre || "Sin seleccionar"}</Text>
          </View>
          {paciente.rut ? (
            <View style={styles.patientCell}>
              <Text style={styles.patientLabel}>RUT</Text>
              <Text style={styles.patientValue}>{paciente.rut}</Text>
            </View>
          ) : null}
          <View style={styles.patientCell}>
            <Text style={styles.patientLabel}>Edad</Text>
            <Text style={styles.patientValue}>{paciente.edad ? `${paciente.edad} años` : "—"}</Text>
          </View>
          <View style={styles.patientCell}>
            <Text style={styles.patientLabel}>Sexo</Text>
            <Text style={styles.patientValue}>{paciente.sexo === "M" ? "Masculino" : paciente.sexo === "F" ? "Femenino" : "—"}</Text>
          </View>
          <View style={styles.patientCell}>
            <Text style={styles.patientLabel}>Peso</Text>
            <Text style={styles.patientValue}>{paciente.peso ? `${paciente.peso} kg` : "—"}</Text>
          </View>
          <View style={styles.patientCell}>
            <Text style={styles.patientLabel}>Talla</Text>
            <Text style={styles.patientValue}>{paciente.talla ? `${paciente.talla} cm` : "—"}</Text>
          </View>
          <View style={styles.patientCell}>
            <Text style={styles.patientLabel}>IMC</Text>
            <Text style={styles.patientValue}>{paciente.imc || "—"}</Text>
          </View>
        </View>

        {/* Objetivos nutricionales */}
        <View style={styles.objRow}>
          <View style={[styles.objCard, { borderColor: PINE }]}>
            <Text style={styles.objLabel}>Energía</Text>
            <Text style={[styles.objValue, { color: PINE }]}>{objetivos.kcal || 0} kcal</Text>
          </View>
          <View style={[styles.objCard, { borderColor: MACRO_PROT }]}>
            <Text style={styles.objLabel}>Proteínas</Text>
            <Text style={[styles.objValue, { color: MACRO_PROT }]}>{objetivos.prot_g || 0} g</Text>
          </View>
          <View style={[styles.objCard, { borderColor: MACRO_CHO }]}>
            <Text style={styles.objLabel}>Carbohidratos</Text>
            <Text style={[styles.objValue, { color: MACRO_CHO }]}>{objetivos.cho_g || 0} g</Text>
          </View>
          <View style={[styles.objCard, { borderColor: MACRO_GRA }]}>
            <Text style={styles.objLabel}>Grasas</Text>
            <Text style={[styles.objValue, { color: MACRO_GRA }]}>{objetivos.fat_g || 0} g</Text>
          </View>
        </View>

        {/* Tabla de comidas */}
        <Text style={styles.sectionTitle}>Distribución por tiempo de comida</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.headerText, { width: "12%" }]}>Horario</Text>
            <Text style={[styles.headerText, { width: "18%" }]}>Comida</Text>
            <Text style={[styles.headerText, { width: "25%" }]}>Porción</Text>
            <Text style={[styles.headerText, { width: "45%" }]}>Opciones equivalentes (elige una)</Text>
          </View>

          {mealsAMostrar.map((meal, idx) => {
            const activeGroups = grupos.filter((g) => (distributions[meal.id]?.[g.id] || 0) > 0);
            return (
              <View key={meal.id} style={[styles.mealRow, idx % 2 !== 0 ? { backgroundColor: PORCELAIN } : {}]} wrap={false}>
                <View style={styles.timeCol}>
                  <Text style={styles.timeText}>{meal.time}</Text>
                </View>
                <View style={styles.nameCol}>
                  <Text style={styles.nameText}>{meal.name}</Text>
                </View>
                <View style={styles.contentCol}>
                  {activeGroups.length === 0 ? (
                    <View style={styles.portionItem}>
                      <Text style={[styles.optionsCol, { fontStyle: "italic", width: "100%", textAlign: "center" }]}>
                        Sin porciones asignadas
                      </Text>
                    </View>
                  ) : (
                    activeGroups.map((group, gIdx) => (
                      <View key={group.id} style={[styles.portionItem, gIdx === activeGroups.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                        <View style={styles.portionBadgeCol}>
                          <View style={[styles.circle, { backgroundColor: group.pdfBg }]}>
                            <Text style={[styles.circleText, { color: group.pdfText }]}>{distributions[meal.id][group.id]}</Text>
                          </View>
                          <Text style={{ fontSize: 8, fontWeight: "bold", color: INK }}>{group.label}</Text>
                        </View>
                        <Text style={styles.optionsCol}>{group.options}</Text>
                      </View>
                    ))
                  )}
                  {(sugerenciasComida[meal.id] || []).length > 0 && (
                    <View style={{ paddingTop: 4, paddingBottom: 2, paddingHorizontal: 6, borderTopWidth: 0.5, borderTopColor: MIST }}>
                      <Text style={{ fontSize: 7, fontWeight: "bold", color: PINE_SOFT, marginBottom: 2 }}>EJEMPLOS DE PREPARACIÓN</Text>
                      {(sugerenciasComida[meal.id] || []).map((s) => (
                        <Text key={s.id} style={{ fontSize: 8, color: INK, marginBottom: 1 }}>
                          • <Text style={{ fontWeight: "bold" }}>{s.nombre}</Text>
                          {s.ingredientes ? ` — ${s.ingredientes}` : ""}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Resumen de porciones diarias */}
        {visibleGroups.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Resumen de porciones diarias</Text>
            <View style={styles.summaryGrid} wrap={false}>
              {visibleGroups.map((g) => (
                <View key={g.id} style={styles.summaryBadge}>
                  <Text style={{ fontSize: 7, color: INK_SOFT, fontWeight: "bold", textTransform: "uppercase", textAlign: "center" }}>{g.label}</Text>
                  <Text style={{ fontSize: 11, fontWeight: "bold", color: PINE, marginTop: 2 }}>{totals[g.id] || 0}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Indicaciones generales */}
        <View style={styles.notesBox} wrap={false}>
          <Text style={[styles.sectionTitle, { marginBottom: 5 }]}>Indicaciones generales</Text>
          <Text style={styles.noteLine}>- Respeta los horarios de cada comida y evita saltarte tiempos.</Text>
          <Text style={styles.noteLine}>- Dentro de cada grupo puedes elegir cualquiera de las opciones equivalentes indicadas.</Text>
          <Text style={styles.noteLine}>- Bebe al menos 2 litros de agua al día y prefiere preparaciones cocidas, al horno o a la plancha.</Text>
          <Text style={styles.noteLine}>- Las verduras de libre consumo pueden agregarse en la cantidad que desees.</Text>
        </View>

        {/* Pie */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {nutricionista.nombre || "Nutricionista"}{nutricionista.registro ? ` · Reg. ${nutricionista.registro}` : ""}
          </Text>
          <Text style={styles.footerText}>Generado con NutriFlow · {fechaEmision}</Text>
        </View>
      </Page>
    </Document>
  );
};
