import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Brain } from "lucide-react";
import SectionCard from "./SectionCard";
import ICFCodes from "./ICFCodes";
import MarkdownRenderer from "./MarkdownRenderer";

interface CaseAnalysisProps {
  analysis: {
    analysis?: string;
    sections?: Array<{ title: string; content: string }>;
    references?: string;
    icf_codes?: string[] | string;
    generated_sections?: {
      [key: string]: string;
    };
  };
}

const CaseAnalysis = ({ analysis }: CaseAnalysisProps) => {
  if (!analysis) return null;

  // Process generated sections to extract step number and title
  const formattedSections = analysis.generated_sections 
    ? Object.entries(analysis.generated_sections).map(([key, content]) => {
        // Extract the section title from the key (e.g., "Step 1: Patient Introduction")
        const titleMatch = key.match(/Step \d+: (.*)/);
        const title = titleMatch ? titleMatch[1].trim() : key;
        
        // Clean up the content by removing any markdown formatting issues
        const cleanContent = typeof content === 'string' 
          ? content.replace(/\\n/g, '\n').trim()
          : JSON.stringify(content);

        return {
          title,
          content: cleanContent
        };
      })
    : [];

  // Combine with any existing sections
  const allSections = [
    ...(analysis.sections || []),
    ...formattedSections
  ];

  console.log('Formatted Sections:', formattedSections);
  console.log('All Sections:', allSections);

  return (
    <Tabs defaultValue="overview" className="w-full mt-6">
      <TabsList className="w-full justify-start bg-background border-b">
        <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-primary-100 dark:data-[state=active]:bg-primary-900">
          <Brain className="h-4 w-4" />
          Quick Analysis
        </TabsTrigger>
        <TabsTrigger value="full" className="flex items-center gap-2 data-[state=active]:bg-primary-100 dark:data-[state=active]:bg-primary-900">
          <BookOpen className="h-4 w-4" />
          Full Case Study
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <Card className="bg-card border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h3 className="text-xl font-semibold mb-4 text-primary flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Analysis Summary
              </h3>
              {analysis.analysis && <MarkdownRenderer content={analysis.analysis} />}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="full">
        <ScrollArea className="h-[600px] rounded-md">
          <div className="space-y-8 p-6">
            {allSections.map((section, index) => (
              <SectionCard 
                key={index}
                title={section.title}
                content={section.content}
              />
            ))}

            {analysis.references && (
              <Card className="bg-card border-none shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="h-5 w-5" />
                    <h3 className="text-xl font-semibold text-primary">Evidence-Based References</h3>
                  </div>
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <MarkdownRenderer content={analysis.references} />
                  </div>
                </CardContent>
              </Card>
            )}

            {analysis.icf_codes && (
              <ICFCodes codes={analysis.icf_codes} />
            )}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};

export default CaseAnalysis;