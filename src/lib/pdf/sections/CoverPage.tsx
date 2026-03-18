import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { formatDateShort, PDF_COLORS } from '../pdfUtils'

const styles = StyleSheet.create({
  page: {
    padding: 60,
    backgroundColor: PDF_COLORS.background,
    justifyContent: 'center',
  },
  projectName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 36,
    color: PDF_COLORS.text,
    marginBottom: 8,
  },
  address: {
    fontFamily: 'Helvetica',
    fontSize: 14,
    color: PDF_COLORS.textSecondary,
    marginBottom: 40,
  },
  separator: {
    height: 3,
    backgroundColor: PDF_COLORS.accent,
    width: 80,
    marginBottom: 40,
  },
  infoBlock: {
    marginBottom: 12,
  },
  label: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: PDF_COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  value: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: PDF_COLORS.text,
  },
  dateBlock: {
    marginTop: 30,
  },
  confidential: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: PDF_COLORS.textSecondary,
    marginTop: 60,
  },
})

interface CoverPageProps {
  projectName: string
  address: string | null
  clientName: string
  architectName: string
  generatedAt: Date
}

export function CoverPage({ projectName, address, clientName, architectName, generatedAt }: CoverPageProps) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.projectName}>{projectName}</Text>
      {address && <Text style={styles.address}>{address}</Text>}

      <View style={styles.separator} />

      <View style={styles.infoBlock}>
        <Text style={styles.label}>Cliente</Text>
        <Text style={styles.value}>{clientName}</Text>
      </View>

      <View style={styles.infoBlock}>
        <Text style={styles.label}>Arquitecto</Text>
        <Text style={styles.value}>{architectName}</Text>
      </View>

      <View style={styles.dateBlock}>
        <Text style={styles.label}>Fecha de generacion</Text>
        <Text style={styles.value}>Generado el {formatDateShort(generatedAt)}</Text>
      </View>

      <Text style={styles.confidential}>
        Reporte financiero de obra · Confidencial
      </Text>
    </Page>
  )
}
