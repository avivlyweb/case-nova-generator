import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, BookOpen } from "lucide-react";
import AnalysisOverview from "./AnalysisOverview";
import DetailedSection from "./DetailedSection";
import ICFCodes from "./ICFCodes";
import { Json } from "@/integrations/supabase/types";
import { useEffect, useState } from "react";

interface CaseAnalysisProps {
  analysis: {
    analysis?: string;
    sections?: Json;
    references?: string;
    icf_codes?: Json;
  };
  defaultTab?: string;
}

const CaseAnalysis = ({ analysis, defaultTab = 'overview' }: CaseAnalysisProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  if (!analysis) return null;

  // Type guard to check if sections is an array of the correct shape
  const isSectionsArray = (sections: Json): sections is Array<{ title: string; content: string }> => {
    if (!Array.isArray(sections)) return false;
    return sections.every(section => 
      typeof section === 'object' && 
      section !== null && 
      'title' in section && 
      'content' in section &&
      typeof section.title === 'string' &&
      typeof section.content === 'string'
    );
  };

  // Convert icf_codes to string if it's not already
  const formattedIcfCodes = typeof analysis.icf_codes === 'string' 
    ? analysis.icf_codes 
    : JSON.stringify(analysis.icf_codes);

  const validSections = analysis.sections && isSectionsArray(analysis.sections) 
    ? analysis.sections 
    : [];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
      <TabsList className="w-full justify-start bg-white dark:bg-gray-800 p-1 rounded-lg">
        <TabsTrigger 
          value="overview" 
          className="flex items-center gap-2 data-[state=active]:bg-primary-100 dark:data-[state=active]:bg-primary-900"
        >
          <Brain className="h-4 w-4" />
          Quick Analysis
        </TabsTrigger>
        {validSections.length > 0 && (
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

      {validSections.length > 0 && (
        <TabsContent value="full" className="mt-6">
          <ScrollArea className="h-[600px] rounded-md pr-4">
            <div className="space-y-6">
              {validSections.map((section, index) => (
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

              {formattedIcfCodes && (
                <ICFCodes codes={formattedIcfCodes} />
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      )}
    </Tabs>
  );
};

export default CaseAnalysis;