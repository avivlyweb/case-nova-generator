import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { createCaseStudy } from "@/lib/db";
import { PatientFormData } from "@/components/generate/steps/Step2PatientInfo";
import { supabase } from "@/integrations/supabase/client";
import StepWizard from "@/components/generate/StepWizard";
import Step1Specialization from "@/components/generate/steps/Step1Specialization";
import Step2PatientInfo from "@/components/generate/steps/Step2PatientInfo";
import Step3Review from "@/components/generate/steps/Step3Review";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    setCurrentStep(stepIndex);
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
        const { error } = await supabase.functions.invoke('process-case-study', {
          body: { 
            caseStudy: newCaseStudy,
            action: 'generate'
          }
        });

        if (error) throw error;
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
      <div className="flex justify-between items-center mt-8">
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