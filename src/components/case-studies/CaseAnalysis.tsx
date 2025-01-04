import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Brain, FileText, List, Stethoscope, Target, Pill } from "lucide-react";
import ReactMarkdown from 'react-markdown';

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
        return <Pill className="h-5 w-5" />;
      default:
        return <List className="h-5 w-5" />;
    }
  };

  const MarkdownContent = ({ content }: { content: string }) => (
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <p className="text-base leading-relaxed mb-4">{children}</p>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 underline"
          >
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-primary-900 dark:text-primary-100">
            {children}
          </strong>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-base leading-relaxed">{children}</li>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );

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
              <MarkdownContent content={analysis.analysis || ''} />
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
                      <MarkdownContent content={section.content} />
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
                      <MarkdownContent content={analysis.references} />
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