import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, BookOpen } from "lucide-react";
import AnalysisOverview from "./AnalysisOverview";
import DetailedSection from "./DetailedSection";
import ICFCodes from "./ICFCodes";

interface CaseAnalysisProps {
  analysis: {
    analysis?: string;
    sections?: Array<{ title: string; content: string }> | any;
    references?: string;
    icf_codes?: string;
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

  return (
    <Tabs defaultValue="overview" className="w-full mt-6">
      <TabsList className="w-full justify-start bg-white dark:bg-gray-800 p-1 rounded-lg">
        <TabsTrigger 
          value="overview" 
          className="flex items-center gap-2 data-[state=active]:bg-primary-100 dark:data-[state=active]:bg-primary-900"
        >
          <Brain className="h-4 w-4" />
          Quick Analysis
        </TabsTrigger>
        {formattedSections.length > 0 && (
          <TabsTrigger 
            value="full" 
            className="flex items-center gap-2 data-[state=active]:bg-primary-100 dark:data-[state=active]:bg-primary-900"
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

              {analysis.references && (
                <DetailedSection
                  title="Evidence-Based References"
                  content={analysis.references}
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

export default CaseAnalysis;