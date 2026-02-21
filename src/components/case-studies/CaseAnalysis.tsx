import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, BookOpen } from "lucide-react";
import AnalysisOverview from "./AnalysisOverview";
import DetailedSection from "./DetailedSection";
import ICFCodes from "./ICFCodes";
import MedicalEntities from "./MedicalEntities";

interface CaseAnalysisProps {
  analysis: {
    analysis?: string;
    sections?: Array<{ title: string; content: string }> | Record<string, any>;
    references?: any[] | string;
    icf_codes?: string;
    medical_entities?: any;
    clinical_guidelines?: any[];
    evidence_levels?: Record<string, number>;
    assessment_tools?: any[];
    measurement_data?: Record<string, any>;
    professional_frameworks?: Record<string, any>;
    standardized_tests?: any[];
  };
}

const CaseAnalysis = ({ analysis }: CaseAnalysisProps) => {
  if (!analysis) return null;

  // Convert sections to array if it's stored as an object
  const formattedSections = (() => {
    if (!analysis.sections) return [];
    
    if (Array.isArray(analysis.sections)) {
      return analysis.sections;
    }
    
    if (typeof analysis.sections === 'object') {
      return Object.entries(analysis.sections).map(([title, content]) => ({
        title,
        content: typeof content === 'string' ? content : JSON.stringify(content)
      }));
    }
    
    return [];
  })();

  // Format professional data sections
  const formatProfessionalData = () => {
    const sections = [];

    if (Array.isArray(analysis.assessment_tools) && analysis.assessment_tools.length > 0) {
      sections.push({
        title: "Assessment Tools",
        content: formatAssessmentTools(analysis.assessment_tools)
      });
    }

    if (analysis.measurement_data && Object.keys(analysis.measurement_data).length > 0) {
      sections.push({
        title: "Measurements",
        content: formatMeasurementData(analysis.measurement_data)
      });
    }

    if (analysis.professional_frameworks && Object.keys(analysis.professional_frameworks).length > 0) {
      sections.push({
        title: "Professional Frameworks",
        content: formatFrameworks(analysis.professional_frameworks)
      });
    }

    if (Array.isArray(analysis.standardized_tests) && analysis.standardized_tests.length > 0) {
      sections.push({
        title: "Standardized Tests",
        content: formatStandardizedTests(analysis.standardized_tests)
      });
    }

    return sections;
  };

  return (
    <Tabs defaultValue="overview" className="w-full mt-6">
      <TabsList className="w-full justify-start bg-primary-100 dark:bg-primary-900/50 p-2 rounded-lg border border-primary-200 dark:border-primary-800">
        <TabsTrigger 
          value="overview" 
          className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-primary-800 data-[state=active]:text-primary-900 dark:data-[state=active]:text-primary-100"
        >
          <Brain className="h-4 w-4" />
          Quick Analysis
        </TabsTrigger>
        {formattedSections.length > 0 && (
          <TabsTrigger 
            value="full" 
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-primary-800 data-[state=active]:text-primary-900 dark:data-[state=active]:text-primary-100"
          >
            <BookOpen className="h-4 w-4" />
            Full Case Study
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <AnalysisOverview analysis={analysis.analysis} />
      </TabsContent>

      {formattedSections.length > 0 && (
        <TabsContent value="full" className="mt-6">
          <ScrollArea className="h-[600px] rounded-md pr-4">
            <div className="space-y-6">
              {formattedSections.map((section, index) => (
                <DetailedSection
                  key={index}
                  title={section.title}
                  content={section.content}
                />
              ))}

              {formatProfessionalData().map((section, index) => (
                <DetailedSection
                  key={`professional-${index}`}
                  title={section.title}
                  content={section.content}
                />
              ))}

              {analysis.medical_entities && (
                <MedicalEntities entities={analysis.medical_entities} />
              )}

              {Array.isArray(analysis.clinical_guidelines) && analysis.clinical_guidelines.length > 0 && (
                <DetailedSection
                  title="Clinical Guidelines"
                  content={formatClinicalGuidelines(analysis.clinical_guidelines)}
                />
              )}

              {analysis.evidence_levels && Object.keys(analysis.evidence_levels).length > 0 && (
                <DetailedSection
                  title="Evidence Levels"
                  content={formatEvidenceLevels(analysis.evidence_levels)}
                />
              )}

              {analysis.references && (
                <DetailedSection
                  title="Evidence-Based References"
                  content={formatReferences(analysis.references)}
                />
              )}
              
              {/* Debug: Show raw references data */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <h4 className="font-bold">Debug - References Data:</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(analysis.references, null, 2)}
                  </pre>
                </div>
              )}

              {analysis.icf_codes && (
                <ICFCodes codes={analysis.icf_codes} />
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      )}
    </Tabs>
  );
};

// Helper functions for formatting
const formatClinicalGuidelines = (guidelines: any[]): string => {
  if (!Array.isArray(guidelines)) return '';
  return guidelines.map(g => {
    if (typeof g === 'string') return g;
    return (
      `### ${g.name || 'Clinical Guideline'}\n\n` +
      `**Evidence Level:** ${g.evidence_level || 'Not specified'}\n\n` +
      `**Source:** ${g.source || 'Professional Guidelines'}\n\n` +
      `**Content:**\n${g.content || ''}\n\n` +
      (g.url ? `[View Full Guideline](${g.url})\n` : '')
    );
  }).join('\n---\n\n');
};

const formatEvidenceLevels = (levels: Record<string, number>): string => {
  if (!levels || typeof levels !== 'object') return '';
  return '### Evidence Distribution\n\n' +
    Object.entries(levels)
      .map(([level, count]) => `- ${level}: ${count} studies`)
      .join('\n');
};

const formatReferences = (references: any[] | string | null): string => {
  if (!references) return '';
  if (typeof references === 'string') return references;
  if (!Array.isArray(references)) return '';
  
  return references.map((ref, index) => {
    const authors = Array.isArray(ref.authors) ? ref.authors.join(', ') : 'Unknown';
    const year = ref.publicationDate ? new Date(ref.publicationDate).getFullYear() : 'N/A';
    const title = ref.title || 'Untitled';
    const url = ref.url || '#';
    const journal = ref.journal || '';
    const evidenceLevel = ref.evidenceLevel || 'Not specified';
    const abstract = ref.abstract || '';
    const citation = ref.citation || `${authors} (${year}). ${title}. ${journal}.`;
    
    return `### ${index + 1}. ${title}

**Authors:** ${authors}  
**Journal:** ${journal} (${year})  
**Evidence Level:** ${evidenceLevel}

${abstract ? `**Abstract:** ${abstract.substring(0, 300)}${abstract.length > 300 ? '...' : ''}

` : ''}**Citation:** ${citation}

**PubMed Link:** [View Article](${url})

---`;
  }).join('\n\n');
};

const formatAssessmentTools = (tools: any[]): string => {
  if (!Array.isArray(tools)) return '';
  return tools.map(tool => {
    if (typeof tool === 'string') return tool;
    return (
      `### ${tool.category || 'Assessment Tools'}\n\n` +
      `**Reliability:** ${tool.reliability || 'Not specified'}\n\n` +
      `**Validity:** ${tool.validity || 'Not specified'}\n\n` +
      `**Content:**\n${tool.content || ''}\n`
    );
  }).join('\n---\n\n');
};

const formatMeasurementData = (data: Record<string, any>): string => {
  if (!data || typeof data !== 'object') return '';
  return Object.entries(data).map(([category, measurements]) => (
    `### ${category}\n\n` +
    Object.entries(measurements).map(([name, value]) => (
      `- **${name}:** ${value}`
    )).join('\n')
  )).join('\n\n');
};

const formatFrameworks = (frameworks: Record<string, any>): string => {
  if (!frameworks || typeof frameworks !== 'object') return '';
  return Object.entries(frameworks).map(([name, framework]) => (
    `### ${name}\n\n` +
    `${framework.description}\n\n` +
    `**Components:**\n` +
    (Array.isArray(framework.components) ? framework.components.map((c: string) => `- ${c}`).join('\n') : '') + '\n\n' +
    `**Guidelines:** ${framework.guidelines}`
  )).join('\n---\n\n');
};

const formatStandardizedTests = (tests: any[]): string => {
  if (!Array.isArray(tests)) return '';
  return tests.map(test => {
    if (typeof test === 'string') return test;
    return (
      `### ${test.name || 'Standardized Test'}\n\n` +
      `**Category:** ${test.category || 'Not specified'}\n\n` +
      `**Measurement Type:** ${test.measurement_type || 'Not specified'}\n\n` +
      `**Normal Ranges:**\n${formatNormalRanges(test.normal_ranges)}\n\n` +
      `**Interpretation Guidelines:** ${test.interpretation_guidelines || 'Not provided'}\n`
    );
  }).join('\n---\n\n');
};

const formatNormalRanges = (ranges: any): string => {
  if (!ranges || typeof ranges !== 'object') return 'Not specified';
  return Object.entries(ranges).map(([key, value]) => `- **${key}:** ${value}`).join('\n');
};

export default CaseAnalysis;