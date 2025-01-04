import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import { FileText, List, Pill, Stethoscope, Target } from "lucide-react";

interface DetailedSectionProps {
  title: string;
  content: string;
}

const DetailedSection = ({ title, content }: DetailedSectionProps) => {
  const getSectionIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case "medical history":
        return <FileText className="h-5 w-5 text-primary" />;
      case "assessment findings":
        return <Stethoscope className="h-5 w-5 text-primary" />;
      case "intervention plan":
        return <Target className="h-5 w-5 text-primary" />;
      case "medications":
        return <Pill className="h-5 w-5 text-primary" />;
      default:
        return <List className="h-5 w-5 text-primary" />;
    }
  };

  // Ensure content is a string and handle special formatting for references
  const formattedContent = title.toLowerCase() === "evidence-based references" 
    ? content.split(',').map(ref => `- ${ref.trim()}`).join('\n')
    : content;

  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          {getSectionIcon(title)}
          <h3 className="text-xl font-semibold text-primary-900 dark:text-primary-100">{title}</h3>
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
              ul: ({ children }) => (
                <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">{children}</ol>
              ),
            }}
          >
            {formattedContent}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};

export default DetailedSection;