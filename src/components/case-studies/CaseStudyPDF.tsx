import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30
  },
  section: {
    margin: 10,
    padding: 10
  },
  title: {
    fontSize: 24,
    marginBottom: 10
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 8,
    marginTop: 15
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
    lineHeight: 1.4
  }
});

interface CaseStudyPDFProps {
  caseStudy: any;
  analysis: {
    analysis?: string;
    sections?: Array<{ title: string; content: string }>;
    references?: any[];
    icf_codes?: string;
  };
}

const CaseStudyPDF = ({ caseStudy, analysis }: CaseStudyPDFProps) => {
  console.log('CaseStudyPDF - Rendering with props:', { caseStudy, analysis });

  // Validate required data
  if (!caseStudy) {
    console.error('CaseStudyPDF - Missing case study data');
    return null;
  }

  // Process sections safely
  const processedSections = (() => {
    console.log('CaseStudyPDF - Processing sections:', analysis?.sections);
    
    if (!analysis?.sections) {
      console.log('CaseStudyPDF - No sections found');
      return [];
    }

    try {
      if (Array.isArray(analysis.sections)) {
        return analysis.sections;
      }
      
      if (typeof analysis.sections === 'object') {
        return Object.entries(analysis.sections).map(([title, content]) => ({
          title,
          content: typeof content === 'string' ? content : JSON.stringify(content)
        }));
      }
      
      console.warn('CaseStudyPDF - Invalid sections format:', analysis.sections);
      return [];
    } catch (error) {
      console.error('CaseStudyPDF - Error processing sections:', error);
      return [];
    }
  })();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>
            Case Study: {caseStudy.patient_name || 'Unnamed Patient'}
          </Text>
          
          <Text style={styles.text}>
            Age: {caseStudy.age || 'N/A'}{'\n'}
            Gender: {caseStudy.gender || 'N/A'}{'\n'}
            Condition: {caseStudy.condition || 'N/A'}
          </Text>

          {analysis?.analysis && (
            <View style={styles.section}>
              <Text style={styles.subtitle}>Analysis Overview</Text>
              <Text style={styles.text}>{analysis.analysis}</Text>
            </View>
          )}

          {processedSections.map((section, index) => {
            console.log('CaseStudyPDF - Rendering section:', section);
            return (
              <View key={index} style={styles.section}>
                <Text style={styles.subtitle}>{section.title}</Text>
                <Text style={styles.text}>{section.content}</Text>
              </View>
            );
          })}

          {analysis?.references && (
            <View style={styles.section}>
              <Text style={styles.subtitle}>References</Text>
              <Text style={styles.text}>
                {Array.isArray(analysis.references) 
                  ? analysis.references.join('\n')
                  : analysis.references}
              </Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default CaseStudyPDF;