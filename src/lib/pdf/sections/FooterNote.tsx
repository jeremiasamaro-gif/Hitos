import { View, Text, StyleSheet } from '@react-pdf/renderer'
import { formatDate, formatTime, PDF_COLORS } from '../pdfUtils'

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.border,
  },
  disclaimer: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: PDF_COLORS.textSecondary,
    lineHeight: 1.6,
    marginBottom: 12,
  },
  architect: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: PDF_COLORS.text,
  },
})

interface FooterNoteProps {
  architectName: string
  generatedAt: Date
}

export function FooterNote({ architectName, generatedAt }: FooterNoteProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.disclaimer}>
        Este reporte fue generado automaticamente por ObrasApp el {formatDate(generatedAt)} a las{' '}
        {formatTime(generatedAt)}. Los valores reflejan la informacion cargada hasta la fecha de
        generacion y pueden no representar el estado final de la obra.
      </Text>
      <Text style={styles.architect}>{architectName}</Text>
    </View>
  )
}
