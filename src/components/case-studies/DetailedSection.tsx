import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import { 
  FileText, 
  List, 
  Pill, 
  Stethoscope, 
  Target,
  UserCircle,
  ClipboardList,
  ScrollText,
  Goal,
  RefreshCw,
  BookOpen,
  BookmarkCheck,
  ListChecks,
  Pills,
  Activity
} from "lucide-react";

interface DetailedSectionProps {
  title: string;
  content: string;
}

const DetailedSection = ({ title, content }: DetailedSectionProps) => {
  const getSectionIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case "patient introduction":
        return <UserCircle className="h-5 w-5 text-primary" />;
      case "interview and problem list":
        return <ClipboardList className="h-5 w-5 text-primary" />;
      case "assessment strategy":
        return <ScrollText className="h-5 w-5 text-primary" />;
      case "assessment findings":
        return <Stethoscope className="h-5 w-5 text-primary" />;
      case "goals/actions to take":
        return <Goal className="h-5 w-5 text-primary" />;
      case "intervention plan":
        return <Target className="h-5 w-5 text-primary" />;
      case "reassessment":
        return <RefreshCw className="h-5 w-5 text-primary" />;
      case "explanation and justification of choices":
        return <BookOpen className="h-5 w-5 text-primary" />;
      case "reference list":
        return <BookmarkCheck className="h-5 w-5 text-primary" />;
      case "medication information":
        return <Pills className="h-5 w-5 text-primary" />;
      case "icf classification":
        return <Activity className="h-5 w-5 text-primary" />;
      default:
        return <List className="h-5 w-5 text-primary" />;
    }
  };

  // Convert content to string if it's an array (for references)
  const formattedContent = Array.isArray(content) ? content.join('\n\n') : content;

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
              a: ({ href, children }) => (
                <a 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
                >
                  {children}
                </a>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-primary-100 dark:bg-primary-900">{children}</thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">{children}</tbody>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">{children}</tr>
              ),
              th: ({ children }) => (
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary-900 dark:text-primary-100">{children}</th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-normal break-words">{children}</td>
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