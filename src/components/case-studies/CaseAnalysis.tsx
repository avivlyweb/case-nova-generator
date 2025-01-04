import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CaseAnalysisProps {
  analysis: {
    analysis?: string;
    sections?: Array<{ title: string; content: string }>;
    references?: string;
    icf_codes?: string;
  };
}

const CaseAnalysis = ({ analysis }: CaseAnalysisProps) => {
  if (!analysis) return null;

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        {analysis.sections && (
          <TabsTrigger value="full">Full Case Study</TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="overview">
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Quick Analysis</h3>
          <p className="text-sm whitespace-pre-wrap">
            {analysis.analysis}
          </p>
        </div>
      </TabsContent>
      {analysis.sections && (
        <TabsContent value="full">
          <ScrollArea className="h-[500px] w-full rounded-md border p-4">
            <div className="space-y-6">
              {analysis.sections.map((section, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-semibold text-lg">{section.title}</h3>
                  <div className="text-sm whitespace-pre-wrap">
                    {section.content}
                  </div>
                </div>
              ))}
              {analysis.references && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">References</h3>
                  <div className="text-sm whitespace-pre-wrap">
                    {analysis.references}
                  </div>
                </div>
              )}
              {analysis.icf_codes && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">ICF Codes</h3>
                  <div className="text-sm whitespace-pre-wrap">
                    {analysis.icf_codes}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      )}
    </Tabs>
  );
};

export default CaseAnalysis;