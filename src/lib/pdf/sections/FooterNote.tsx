import { View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import { formatDate, formatTime, PDF_COLORS } from '../pdfUtils'

// CRT-007: Only render Image if URL is a valid http/https URL
function isValidImageUrl(url: string | null | undefined): url is string {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

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
  firma: {
    width: 120,
    height: 50,
    objectFit: 'contain' as const,
    marginTop: 8,
  },
})

interface FooterNoteProps {
  architectName: string
  generatedAt: Date
  firmaUrl?: string | null
  firmaEnPdf?: boolean
}

export function FooterNote({ architectName, generatedAt, firmaUrl, firmaEnPdf }: FooterNoteProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.disclaimer}>
        Este reporte fue generado automaticamente por ObrasApp el {formatDate(generatedAt)} a las{' '}
        {formatTime(generatedAt)}. Los valores reflejan la informacion cargada hasta la fecha de
        generacion y pueden no representar el estado final de la obra.
      </Text>
      <Text style={styles.architect}>{architectName}</Text>
      {firmaEnPdf && isValidImageUrl(firmaUrl) && (
        <Image src={firmaUrl} style={styles.firma} />
      )}
    </View>
  )
}
