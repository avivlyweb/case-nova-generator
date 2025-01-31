import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import type { CaseStudy } from "@/types/case-study";

interface CaseStudyCardProps {
  study: CaseStudy;
  analyzing: boolean;
  onAnalyze: () => void;
  onGenerate: () => void;
}

const CaseStudyCard = ({ study, analyzing, onAnalyze, onGenerate }: CaseStudyCardProps) => {
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
          <Link to={`/case-studies/${study.id}/learn`}>
            <Button variant="default" size="sm">
              <GraduationCap className="h-4 w-4 mr-2" />
              Learn
            </Button>
          </Link>
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