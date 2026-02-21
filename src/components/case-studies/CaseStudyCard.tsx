import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, GraduationCap, BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { CaseStudy } from "@/types/case-study";

interface CaseStudyCardProps {
  study: CaseStudy;
  analyzing: boolean;
  onAnalyze: () => void;
  onGenerate: () => void;
}

const CaseStudyCard = ({ study, analyzing, onAnalyze, onGenerate }: CaseStudyCardProps) => {
  const navigate = useNavigate();
  
  const handleGenerateFullCase = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/generate-full-case/${study.id}`);
  };
  return (
    <Card className="w-full bg-white shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          {study.condition || "Untitled Case Study"}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAnalyze}
            disabled={analyzing}
          >
            <FileText className="h-4 w-4 mr-2" />
            {analyzing ? "Analyzing..." : "Analyze"}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onGenerate}
            disabled={analyzing}
          >
            <FileText className="h-4 w-4 mr-2" />
            {analyzing ? "Generating..." : "Generate Full Case"}
          </Button>
          <Link to={`/case-studies/${study.id}/learn`}>
            <Button variant="default" size="sm">
              <GraduationCap className="h-4 w-4 mr-2" />
              Learn
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateFullCase}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border-blue-200"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Full Case
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {study.patient_background || "No background information available."}
          </p>
          <p className="text-sm text-muted-foreground">
            Created at: {new Date(study.created_at).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseStudyCard;