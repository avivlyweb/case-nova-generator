import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import { Brain } from "lucide-react";

interface AnalysisOverviewProps {
  analysis: string | null | undefined;
}

const AnalysisOverview = ({ analysis }: AnalysisOverviewProps) => {
  if (!analysis) return null;

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="pt-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold text-primary-900 dark:text-primary-100">
            AI Analysis Summary
          </h3>
        </div>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="text-base leading-relaxed mb-4 text-gray-700 dark:text-gray-300">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-primary-900 dark:text-primary-100">{children}</strong>
              ),
            }}
          >
            {analysis}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisOverview;