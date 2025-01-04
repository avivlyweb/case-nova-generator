import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Brain, FileText, List, Stethoscope, Target, Pills } from "lucide-react";

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

  const getSectionIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case "medical history":
        return <FileText className="h-5 w-5" />;
      case "assessment findings":
        return <Stethoscope className="h-5 w-5" />;
      case "intervention plan":
        return <Target className="h-5 w-5" />;
      case "medications":
        return <Pills className="h-5 w-5" />;
      default:
        return <List className="h-5 w-5" />;
    }
  };

  return (
    <Tabs defaultValue="overview" className="w-full mt-6">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Quick Analysis
        </TabsTrigger>
        {analysis.sections && (
          <TabsTrigger value="full" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Full Case Study
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="overview">
        <Card>
          <CardContent className="pt-6">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h3 className="text-xl font-semibold mb-4">AI Analysis Summary</h3>
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                {analysis.analysis}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {analysis.sections && (
        <TabsContent value="full">
          <ScrollArea className="h-[600px] rounded-md">
            <div className="space-y-8 p-6">
              {analysis.sections.map((section, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      {getSectionIcon(section.title)}
                      <h3 className="text-xl font-semibold">{section.title}</h3>
                    </div>
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <p className="text-base leading-relaxed whitespace-pre-wrap">
                        {section.content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {analysis.references && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="h-5 w-5" />
                      <h3 className="text-xl font-semibold">Evidence-Based References</h3>
                    </div>
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <p className="text-base leading-relaxed whitespace-pre-wrap">
                        {analysis.references}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {analysis.icf_codes && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <List className="h-5 w-5" />
                      <h3 className="text-xl font-semibold">ICF Codes</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.icf_codes.split('\n').map((code, index) => (
                        <Badge key={index} variant="secondary">
                          {code.trim()}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      )}
    </Tabs>
  );
};

export default CaseAnalysis;