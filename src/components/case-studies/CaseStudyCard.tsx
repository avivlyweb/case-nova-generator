import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { CaseStudy } from "@/types/case-study";

interface CaseStudyCardProps {
  study: CaseStudy;
  onAnalyze: () => void;
  analyzing?: boolean;
}

const CaseStudyCard = ({ study, onAnalyze, analyzing = false }: CaseStudyCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{study.patient_name}</CardTitle>
        <CardDescription>
          {study.age} years old, {study.gender}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Condition:</strong> {study.condition}</p>
          <p><strong>Specialization:</strong> {study.specialization}</p>
          {study.presenting_complaint && (
            <p><strong>Presenting Complaint:</strong> {study.presenting_complaint}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={onAnalyze}
          disabled={analyzing}
          className="w-full sm:w-auto"
        >
          {analyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Case"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CaseStudyCard;