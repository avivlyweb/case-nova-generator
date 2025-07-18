import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, User, FileText, Activity, Brain, Heart, Baby, Users, Building2, Stethoscope, ChartBar, ClipboardList } from "lucide-react";
import { PatientFormData } from "./Step2PatientInfo";
import { autoFillService, AssessmentScore } from "@/services/autoFillService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface Step3ReviewProps {
  specialization: string;
  formData: PatientFormData;
}

const getSpecializationIcon = (specialization: string) => {
  const icons = {
    Orthopedic: <Stethoscope className="w-5 h-5" />,
    Neurological: <Brain className="w-5 h-5" />,
    Cardiovascular: <Heart className="w-5 h-5" />,
    Pediatric: <Baby className="w-5 h-5" />,
    Geriatric: <Users className="w-5 h-5" />,
    ICU: <Building2 className="w-5 h-5" />
  };
  return icons[specialization as keyof typeof icons] || <Activity className="w-5 h-5" />;
};

const getSpecializationColor = (specialization: string) => {
  const colors = {
    Orthopedic: "orthopedic",
    Neurological: "neurological", 
    Cardiovascular: "cardiovascular",
    Pediatric: "pediatric",
    Geriatric: "geriatric",
    ICU: "icu"
  };
  return colors[specialization as keyof typeof colors] || "primary";
};

export const Step3Review = ({ specialization, formData }: Step3ReviewProps) => {
  const specializationColor = getSpecializationColor(specialization);
  
  // Check if we have enhanced data from the magic wand
  const enhancedData = autoFillService.lastGeneratedProfile?.formattedData;
  const assessmentScores = autoFillService.lastGeneratedProfile?.assessmentScores || [];
  const avatarUrl = autoFillService.lastGeneratedProfile?.avatarUrl;
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h2 className="text-medical-heading mb-2">Review & Confirm</h2>
        <p className="text-medical-body max-w-2xl mx-auto">
          Please review all the information below before generating your case study. You can go back to make changes if needed.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Specialization Summary */}
        <Card className="card-medical">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getSpecializationIcon(specialization)}
              <span>Specialization</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`bg-${specializationColor} text-white text-sm px-3 py-1`}>
              {specialization} Physiotherapy
            </Badge>
          </CardContent>
        </Card>

        {/* Patient Demographics */}
        <Card className="card-medical">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-primary" />
              <span>Patient Demographics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {avatarUrl && (
              <div className="flex justify-center mb-2">
                <Avatar className="w-20 h-20 border-2 border-gray-200">
                  <AvatarImage src={avatarUrl} alt={formData.patientName} />
                  <AvatarFallback>{formData.patientName?.substring(0, 2) || "PT"}</AvatarFallback>
                </Avatar>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{formData.patientName || "Not specified"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Age:</span>
              <span className="font-medium">{formData.age || "Not specified"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gender:</span>
              <span className="font-medium">{formData.gender || "Not specified"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clinical Information */}
      <Card className="card-medical">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>Clinical Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.condition && (
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Primary Condition</h4>
              <p className="text-sm">{formData.condition}</p>
            </div>
          )}
          
          {formData.symptoms && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Presenting Symptoms</h4>
                {enhancedData?.clinicalPresentation?.keySymptoms ? (
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {enhancedData.clinicalPresentation.keySymptoms.map((symptom: string, index: number) => (
                      <li key={index}>{symptom}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm">{formData.symptoms}</p>
                )}
              </div>
            </>
          )}

          {formData.history && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Medical History</h4>
                <p className="text-sm">{formData.history}</p>
              </div>
            </>
          )}

          {formData.background && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Patient Background</h4>
                <p className="text-sm">{formData.background}</p>
              </div>
            </>
          )}

          {formData.adlProblem && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">ADL Problems</h4>
                <p className="text-sm">{formData.adlProblem}</p>
              </div>
            </>
          )}

          {formData.comorbidities && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Comorbidities</h4>
                <p className="text-sm">{formData.comorbidities}</p>
              </div>
            </>
          )}

          {formData.psychosocialFactors && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Psychosocial Factors</h4>
                <p className="text-sm">{formData.psychosocialFactors}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Assessment Scores */}
      {assessmentScores && assessmentScores.length > 0 && (
        <Card className="card-medical">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ChartBar className="w-5 h-5 text-primary" />
              <span>Standardized Screening Tools</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {assessmentScores.map((assessment: AssessmentScore, index: number) => {
              // Calculate percentage for progress bar if maxScore exists
              const percentage = assessment.maxScore 
                ? (Number(assessment.score) / assessment.maxScore) * 100 
                : null;
              
              // Determine color based on interpretation
              const getColorClass = (interpretation: string) => {
                if (interpretation.toLowerCase().includes('minimal') || 
                    interpretation.toLowerCase().includes('good')) return 'bg-green-500';
                if (interpretation.toLowerCase().includes('mild')) return 'bg-blue-500';
                if (interpretation.toLowerCase().includes('moderate')) return 'bg-yellow-500';
                if (interpretation.toLowerCase().includes('significant') || 
                    interpretation.toLowerCase().includes('severe')) return 'bg-red-500';
                return 'bg-gray-500';
              };
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-sm">{assessment.name}</h4>
                      <p className="text-xs text-muted-foreground">{assessment.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold">
                        {assessment.score}
                        {assessment.maxScore && <span className="text-sm text-muted-foreground">/{assessment.maxScore}</span>}
                        {assessment.unit && <span className="text-sm text-muted-foreground"> {assessment.unit}</span>}
                      </span>
                      <p className="text-xs">{assessment.interpretation}</p>
                    </div>
                  </div>
                  
                  {percentage !== null && (
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getColorClass(assessment.interpretation)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  )}
                  
                  {index < assessmentScores.length - 1 && <Separator className="my-2" />}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Generation Preview */}
      <Card className="card-medical bg-soft-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary" />
            <span>What Will Be Generated</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Comprehensive assessment</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Evidence-based treatment plan</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Outcome measures</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Progress tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Clinical reasoning</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Learning objectives</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Step3Review;