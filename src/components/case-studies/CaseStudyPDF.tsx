import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { CaseStudy } from '@/types/case-study';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#1A1F2C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#403E43',
    marginBottom: 4,
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#F1F0FB',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#1A1F2C',
    marginBottom: 8,
  },
  content: {
    fontSize: 12,
    color: '#403E43',
    lineHeight: 1.5,
  },
  references: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#9b87f5',
  },
});

interface CaseStudyPDFProps {
  study: CaseStudy;
}

const CaseStudyPDF = ({ study }: CaseStudyPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{study.patient_name}</Text>
        <Text style={styles.subtitle}>
          {study.gender}, {study.age} years old
        </Text>
        {study.condition && (
          <Text style={styles.subtitle}>Condition: {study.condition}</Text>
        )}
      </View>

      {study.generated_sections?.map((section: any, index: number) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.content}>{section.content}</Text>
        </View>
      ))}

      {study.reference_list && (
        <View style={styles.references}>
          <Text style={styles.sectionTitle}>References</Text>
          <Text style={styles.content}>{study.reference_list}</Text>
        </View>
      )}
    </Page>
  </Document>
);

export default CaseStudyPDF;