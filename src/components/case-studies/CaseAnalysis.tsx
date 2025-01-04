import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Brain, FileText, List, Stethoscope, Target, Pill } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  const MarkdownContent = ({ content }: { content: string | null | undefined }) => {
    if (!content) return null;
    const contentString = String(content);
    if (!contentString.trim()) return null;

    const processTable = (tableContent: string) => {
      const rows = tableContent.split('\n').filter(row => row.trim());
      const headers = rows[0].split('|').filter(cell => cell.trim());
      const data = rows.slice(2).map(row => row.split('|').filter(cell => cell.trim()));

      return (
        <div className="my-4 overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header, i) => (
                  <TableHead key={i} className="font-semibold">
                    {header.trim()}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i}>
                  {row.map((cell, j) => (
                    <TableCell key={j}>{cell.trim()}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    };

    return (
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="text-base leading-relaxed mb-4 text-foreground">{children}</p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 underline transition-colors"
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
          table: ({ children }) => processTable(String(children)),
        }}
      >
        {contentString}
      </ReactMarkdown>
    );
  };

  return (
    <Tabs defaultValue="overview" className="w-full mt-6">
      <TabsList className="w-full justify-start bg-background border-b">
        <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-primary-100 dark:data-[state=active]:bg-primary-900">
          <Brain className="h-4 w-4" />
          Quick Analysis
        </TabsTrigger>
        {analysis.sections && (
          <TabsTrigger value="full" className="flex items-center gap-2 data-[state=active]:bg-primary-100 dark:data-[state=active]:bg-primary-900">
            <BookOpen className="h-4 w-4" />
            Full Case Study
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="overview">
        <Card className="bg-card border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h3 className="text-xl font-semibold mb-4 text-primary flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Analysis Summary
              </h3>
              {analysis.analysis && <MarkdownContent content={analysis.analysis} />}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {analysis.sections && (
        <TabsContent value="full">
          <ScrollArea className="h-[600px] rounded-md">
            <div className="space-y-8 p-6">
              {analysis.sections.map((section, index) => (
                <Card key={index} className="overflow-hidden bg-card border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      {getSectionIcon(section.title)}
                      <h3 className="text-xl font-semibold text-primary">{section.title}</h3>
                    </div>
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <MarkdownContent content={section.content} />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {analysis.references && (
                <Card className="bg-card border-none shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="h-5 w-5" />
                      <h3 className="text-xl font-semibold text-primary">Evidence-Based References</h3>
                    </div>
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <MarkdownContent content={analysis.references} />
                    </div>
                  </CardContent>
                </Card>
              )}

              {analysis.icf_codes && (
                <Card className="bg-card border-none shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <List className="h-5 w-5" />
                      <h3 className="text-xl font-semibold text-primary">ICF Codes</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.icf_codes.split('\n').map((code, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-100 px-3 py-1 text-sm font-medium rounded-full"
                        >
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