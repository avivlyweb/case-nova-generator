import { Card, CardContent } from "@/components/ui/card";
import { FileText, List, Pill, Stethoscope, Target } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";

interface SectionCardProps {
  title: string;
  content: string;
}

const SectionCard = ({ title, content }: SectionCardProps) => {
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

  return (
    <Card className="overflow-hidden bg-card border-none shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          {getSectionIcon(title)}
          <h3 className="text-xl font-semibold text-primary">{title}</h3>
        </div>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <MarkdownRenderer content={content} />
        </div>
      </CardContent>
    </Card>
  );
};

export default SectionCard;