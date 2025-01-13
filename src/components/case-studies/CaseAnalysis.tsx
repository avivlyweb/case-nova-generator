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
    sections?: Array<{ title: string; content: string }> | any;
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
  const formattedSections = analysis.sections ? 
    (Array.isArray(analysis.sections) ? analysis.sections : 
     Object.entries(analysis.sections).map(([title, content]) => ({
       title,
       content: typeof content === 'string' ? content : JSON.stringify(content)
     }))) : [];

  // Format professional data sections
  const formatProfessionalData = () => {
    const sections = [];

    if (analysis.assessment_tools?.length > 0) {
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

    if (analysis.standardized_tests?.length > 0) {
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
                  key={`prof-${index}`}
                  title={section.title}
                  content={section.content}
                />
              ))}

              {analysis.medical_entities && (
                <MedicalEntities entities={analysis.medical_entities} />
              )}

              {analysis.clinical_guidelines && analysis.clinical_guidelines.length > 0 && (
                <DetailedSection
                  title="Clinical Guidelines"
                  content={formatGuidelines(analysis.clinical_guidelines)}
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
const formatGuidelines = (guidelines: any[]): string => {
  if (!Array.isArray(guidelines)) return '';
  return guidelines.map(g => (
    `### ${g.name}\n\n` +
    `**Recommendation Level:** ${g.recommendation_level}\n\n` +
    `**Key Points:**\n${g.key_points.map(p => `- ${p}`).join('\n')}\n\n` +
    `[View Guideline](${g.url})\n`
  )).join('\n---\n\n');
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
  
  return references.map(ref => {
    const authors = Array.isArray(ref.authors) ? ref.authors.join(', ') : 'Unknown';
    const year = ref.publicationDate ? new Date(ref.publicationDate).getFullYear() : 'N/A';
    const title = ref.title || 'Untitled';
    const url = ref.url || '#';
    const journal = ref.journal || '';
    const evidenceLevel = ref.evidenceLevel || 'Not specified';
    
    return `- ${authors} (${year}). [${title}](${url}). ${journal}. Evidence Level: ${evidenceLevel}`;
  }).join('\n\n');
};

const formatAssessmentTools = (tools: any[]): string => {
  return tools.map(tool => (
    `### ${tool.name}\n\n` +
    `**Category:** ${tool.category}\n\n` +
    `${tool.description}\n\n` +
    `**Scoring Method:** ${tool.scoring_method}\n\n` +
    `**Validity:** ${tool.validity_evidence}\n`
  )).join('\n---\n\n');
};

const formatMeasurementData = (data: Record<string, any>): string => {
  return Object.entries(data).map(([category, measurements]) => (
    `### ${category}\n\n` +
    Object.entries(measurements).map(([name, value]) => (
      `- **${name}:** ${value}`
    )).join('\n')
  )).join('\n\n');
};

const formatFrameworks = (frameworks: Record<string, any>): string => {
  return Object.entries(frameworks).map(([name, framework]) => (
    `### ${name}\n\n` +
    `${framework.description}\n\n` +
    `**Components:**\n` +
    framework.components.map((c: string) => `- ${c}`).join('\n') + '\n\n' +
    `**Guidelines:** ${framework.guidelines}`
  )).join('\n---\n\n');
};

const formatStandardizedTests = (tests: any[]): string => {
  return tests.map(test => (
    `### ${test.name}\n\n` +
    `**Category:** ${test.category}\n\n` +
    `**Type:** ${test.measurement_type}\n\n` +
    `**Normal Ranges:** ${JSON.stringify(test.normal_ranges, null, 2)}\n\n` +
    `**Interpretation:** ${test.interpretation_guidelines}`
  )).join('\n---\n\n');
};

export default CaseAnalysis;