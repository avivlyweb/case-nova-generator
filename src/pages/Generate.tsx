import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { createCaseStudy } from "@/lib/db";
import { PatientFormData } from "@/components/generate/steps/Step2PatientInfo";
import { supabase } from "@/integrations/supabase/client";
import StepWizard from "@/components/generate/StepWizard";
import Step1Specialization from "@/components/generate/steps/Step1Specialization";
import Step2PatientInfo from "@/components/generate/steps/Step2PatientInfo";
import Step3Review from "@/components/generate/steps/Step3Review";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MODEL_OPTIONS = [
  { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B (Fast)", description: "Fast generation, good quality" },
  { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (Quality)", description: "Higher quality, slower" },
  { value: "groq/compound", label: "Compound (Research)", description: "Web search + research, richest output" },
];

const aiRoleDescriptions = {
  Orthopedic: "Expert in musculoskeletal conditions and rehabilitation",
  Neurological: "Specialist in neurological conditions and recovery",
  Cardiovascular: "Expert in cardiac and pulmonary rehabilitation",
  Pediatric: "Specialist in pediatric development and conditions",
  Geriatric: "Expert in age-related conditions and mobility",
  ICU: "Specialist in critical care and intensive rehabilitation"
};

const Generate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [specialization, setSpecialization] = useState("Orthopedic");
  const [aiRole, setAiRole] = useState(aiRoleDescriptions.Orthopedic);
  const [selectedModel, setSelectedModel] = useState("llama-3.1-8b-instant");
  const [formData, setFormData] = useState<PatientFormData>({
    patientName: "",
    age: 0,
    gender: "",
    condition: "",
    adlProblem: "",
    background: "",
    history: "",
    symptoms: "",
    comorbidities: "",
    psychosocialFactors: "",
  });

  const steps = [
    {
      id: "specialization",
      title: "Specialization",
      description: "Choose your focus area"
    },
    {
      id: "patient-info", 
      title: "Patient Info",
      description: "Enter patient details"
    },
    {
      id: "review",
      title: "Review",
      description: "Confirm and generate"
    }
  ];

  const handleFormChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSpecializationChange = (newSpecialization: string) => {
    setSpecialization(newSpecialization);
    setAiRole(aiRoleDescriptions[newSpecialization as keyof typeof aiRoleDescriptions]);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Only allow navigating back, or forward if current step validation passes
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    } else if (stepIndex > currentStep && canProceed()) {
      setCurrentStep(stepIndex);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return specialization !== "";
      case 1:
        return formData.patientName && formData.age > 0 && formData.gender && formData.condition;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const caseStudyData = {
        patient_name: formData.patientName,
        age: formData.age,
        gender: formData.gender,
        medical_history: formData.history,
        presenting_complaint: formData.symptoms,
        condition: formData.condition,
        specialization,
        ai_role: aiRole,
        adl_problem: formData.adlProblem,
        patient_background: formData.background,
        comorbidities: formData.comorbidities,
        psychosocial_factors: formData.psychosocialFactors,
        date: new Date().toISOString().split('T')[0],
      };

      const newCaseStudy = await createCaseStudy(caseStudyData);
      
      // Process the newly created case study
      if (newCaseStudy?.id) {
        const { data, error } = await supabase.functions.invoke('process-case-study', {
          body: { 
            caseStudy: newCaseStudy,
            action: 'generate',
            model: selectedModel
          }
        });

        if (error) throw error;

        // Save the generated content back to the database
        if (data?.success) {
          const formattedSections = Array.isArray(data.sections) ? data.sections : 
            Object.entries(data.sections || {}).map(([title, content]) => ({
              title,
              content: typeof content === 'string' ? content : JSON.stringify(content)
            }));

          const formattedICFCodes = Array.isArray(data.icf_codes) ? data.icf_codes :
            typeof data.icf_codes === 'string' ? [data.icf_codes] : [];

          const { error: updateError } = await supabase
            .from('case_studies')
            .update({
              generated_sections: formattedSections,
              ai_analysis: data.analysis,
              reference_list: data.references,
              icf_codes: formattedICFCodes,
              assessment_findings: data.assessment_findings,
              intervention_plan: data.intervention_plan,
              clinical_guidelines: data.clinical_guidelines,
              evidence_levels: data.evidence_levels,
              medical_entities: data.medical_entities,
              treatment_progression: data.treatment_progression,
              evidence_based_context: data.evidence_based_context,
              outcome_measures_data: data.outcome_measures_data,
              clinical_decision_points: data.clinical_decision_points,
              diagnostic_reasoning: data.diagnostic_reasoning,
              problem_prioritization: data.problem_prioritization,
              intervention_rationale: data.intervention_rationale,
              reassessment_rationale: data.reassessment_rationale,
              treatment_approach: data.treatment_approach
            })
            .eq('id', newCaseStudy.id);

          if (updateError) {
            console.error('Error saving generated content:', updateError);
          }
        }
      }

      toast({
        title: "Success",
        description: "Case study created and processed successfully",
      });
      navigate("/case-studies");
    } catch (error) {
      console.error("Error creating case study:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create case study",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1Specialization
            specialization={specialization}
            onSpecializationChange={handleSpecializationChange}
          />
        );
      case 1:
        return (
          <Step2PatientInfo
            formData={formData}
            onChange={handleFormChange}
            specialization={specialization}
          />
        );
      case 2:
        return (
          <Step3Review
            specialization={specialization}
            formData={formData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-medical-heading mb-2">
          Generate New Case Study
        </h1>
        <p className="text-medical-body">
          Create comprehensive, evidence-based physiotherapy case studies tailored to your specialization
        </p>
      </div>

      {/* Model Selector */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">AI Model:</label>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="w-[280px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODEL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="font-medium">{opt.label}</span>
                <span className="ml-2 text-xs text-muted-foreground">{opt.description}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Step Wizard */}
      <StepWizard
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
        className="mb-8"
      />

      {/* Step Content */}
      <Card className="card-medical">
        <CardContent className="pt-8">
          {renderCurrentStep()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap justify-between items-center mt-8 gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        <div className="flex space-x-4">
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="btn-medical flex items-center space-x-2"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className="btn-medical text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating Case Study...</span>
                </div>
              ) : (
                "Generate Case Study"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generate;