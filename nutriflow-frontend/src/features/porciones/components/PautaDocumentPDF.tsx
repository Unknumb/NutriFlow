import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: '#0d9488', paddingBottom: 10, marginBottom: 15 },
  doctorName: { fontSize: 16, fontWeight: 'bold', color: '#0f766e' },
  doctorSub: { fontSize: 9, color: '#6b7280', marginTop: 2 },
  
  patientBox: { backgroundColor: '#f0fdfa', borderRadius: 10, padding: 12, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  patientLabel: { fontSize: 7, color: '#0d9488', textTransform: 'uppercase', marginBottom: 2 },
  patientValue: { fontSize: 12, fontWeight: 'bold', color: '#134e4a' },
  
  title: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: '#111827', marginBottom: 15, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },

  table: { width: '100%', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 4, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#0f766e' },
  headerText: { color: '#ffffff', fontSize: 8, fontWeight: 'bold', padding: 8, textAlign: 'left', borderRightWidth: 1, borderRightColor: '#0d9488' },
  
  mealRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  timeCol: { width: '12%', padding: 8, borderRightWidth: 1, borderRightColor: '#e5e7eb', justifyContent: 'center' },
  timeText: { fontSize: 8, color: '#374151' },
  nameCol: { width: '18%', padding: 8, borderRightWidth: 1, borderRightColor: '#e5e7eb', justifyContent: 'center' },
  nameText: { fontSize: 9, fontWeight: 'bold', color: '#111827' },
  
  contentCol: { width: '70%' },
  portionItem: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', minHeight: 30, alignItems: 'center' },
  portionBadgeCol: { width: '35%', flexDirection: 'row', alignItems: 'center', paddingLeft: 8 },
  optionsCol: { width: '65%', padding: 6, fontSize: 8, color: '#4b5563' },
  
  circle: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  circleText: { fontSize: 8, fontWeight: 'bold' },

  summaryTitle: { fontSize: 8, fontWeight: 'bold', color: '#4b5563', textTransform: 'uppercase', marginTop: 15, marginBottom: 5 },
  summaryGrid: { flexDirection: 'row', gap: 5 },
  summaryBadge: { flex: 1, backgroundColor: '#ffffff', borderWidth: 1, borderRadius: 6, padding: 6, alignItems: 'center' },
});

const GROUPS = [
    { id: 'cereales', label: 'Cereales', emoji: '🌾', pdfBg: '#fef3c7', pdfText: '#78350f', options: 'Arroz / Fideos / Pasta / Papa cocida / Choclo' },
    { id: 'frutas', label: 'Frutas', emoji: '🍎', pdfBg: '#ffedd5', pdfText: '#7c2d12', options: 'Fruta a gusto / Plátano / Uvas / Frutillas / Berries' },
    { id: 'carnes', label: 'Carnes', emoji: '🍗', pdfBg: '#fee2e2', pdfText: '#7f1d1d', options: 'Pechuga de pollo / Vacuno magro / Salmón / Atún' },
    { id: 'lacteos', label: 'Lácteos', emoji: '🥛', pdfBg: '#ccfbf1', pdfText: '#134e4a', options: 'Leche / Yogurt natural / Yogurt proteico / Quesillo' },
    { id: 'arg', label: 'ARG', emoji: '🥑', pdfBg: '#ecfccb', pdfText: '#3f6212', options: 'Palta / Frutos secos mix / Mantequilla de maní' },
    { id: 'galleton', label: 'Galletón', emoji: '🍪', pdfBg: '#fae8ff', pdfText: '#701a75', options: 'Galletón Tika Protein / Wild Protein' },
];

const MEALS = [
    { id: 'desayuno', time: '07:00', name: 'Desayuno' },
    { id: 'colacion_am', time: '09:00\n11:00', name: 'Colación AM' },
    { id: 'almuerzo', time: '13:00', name: 'Almuerzo' },
    { id: 'colacion_pm', time: '15:00\n16:00', name: 'Colación PM' },
    { id: 'once', time: '19:00\n20:00', name: 'Once' },
];

export const PautaDocumentPDF = ({ data }: any) => {
  const { patientContext, currentDate, distributions, targets, totals } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.doctorName}>Dra. Javiera Silva N.</Text>
            <Text style={styles.doctorSub}>Nutricionista Clínica</Text>
          </View>
        </View>

        <View style={styles.patientBox}>
          <View>
            <Text style={styles.patientLabel}>Paciente</Text>
            <Text style={styles.patientValue}>{patientContext.name}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.patientLabel}>Fecha</Text>
            <Text style={styles.patientValue}>{currentDate}</Text>
          </View>
        </View>

        <Text style={styles.title}>Plan de Alimentación por Porciones</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, { width: '12%' }]}>Hora</Text>
            <Text style={[styles.headerText, { width: '18%' }]}>Comida</Text>
            <Text style={[styles.headerText, { width: '25%' }]}>Porción</Text>
            <Text style={[styles.headerText, { width: '45%', borderRightWidth: 0 }]}>Opciones</Text>
          </View>

          {MEALS.map((meal, idx) => {
              const activeGroups = GROUPS.filter(g => distributions[meal.id]?.[g.id] > 0);
              return (
                  <View key={meal.id} style={[styles.mealRow, idx % 2 !== 0 ? { backgroundColor: '#f9fafb' } : {}]}>
                      <View style={styles.timeCol}><Text style={styles.timeText}>{meal.time}</Text></View>
                      <View style={styles.nameCol}><Text style={styles.nameText}>{meal.name}</Text></View>
                      <View style={styles.contentCol}>
                          {activeGroups.length === 0 ? (
                              <View style={styles.portionItem}>
                                <Text style={[styles.optionsCol, { fontStyle: 'italic', width: '100%', textAlign: 'center' }]}>Sin porciones asignadas</Text>
                              </View>
                          ) : (
                              activeGroups.map((group, gIdx) => (
                                  <View key={group.id} style={[styles.portionItem, gIdx === activeGroups.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                                      <View style={styles.portionBadgeCol}>
                                          <View style={[styles.circle, { backgroundColor: group.pdfBg }]}>
                                            <Text style={[styles.circleText, { color: group.pdfText }]}>{distributions[meal.id][group.id]}</Text>
                                          </View>
                                          <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#1f2937' }}>{group.label}</Text>
                                      </View>
                                      <Text style={styles.optionsCol}>{group.options}</Text>
                                  </View>
                              ))
                          )}
                      </View>
                  </View>
              )
          })}
        </View>

        <Text style={styles.summaryTitle}>Resumen de Porciones Diarias</Text>
        <View style={styles.summaryGrid}>
          {GROUPS.map((g) => {
              const isExact = totals[g.id] === targets[g.id];
              return (
                <View key={g.id} style={[styles.summaryBadge, { borderColor: isExact ? '#a7f3d0' : '#fde68a' }]}>
                  <Text style={{ fontSize: 7, color: '#374151' }}>{g.emoji} {g.label}</Text>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: isExact ? '#047857' : '#b45309', marginTop: 2 }}>
                    {totals[g.id]}/{targets[g.id] || 0}
                  </Text>
                </View>
              )
          })}
        </View>
      </Page>
    </Document>
  );
};