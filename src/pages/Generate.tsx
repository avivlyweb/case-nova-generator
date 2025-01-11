import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { createCaseStudy } from "@/lib/db";
import PatientInformation, { PatientFormData } from "@/components/generate/PatientInformation";
import SpecializationSelect, {
  physiotherapyTypes,
  aiRoleDescriptions,
} from "@/components/generate/SpecializationSelect";
import { supabase } from "@/integrations/supabase/client";

const Generate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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

  const handleFormChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-8">
        Generate New Case Study
      </h1>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <SpecializationSelect
              specialization={specialization}
              aiRole={aiRole}
              onSpecializationChange={setSpecialization}
              onAiRoleChange={setAiRole}
            />

            <PatientInformation
              formData={formData}
              onChange={handleFormChange}
            />

            <Button
              type="submit"
              className="w-full bg-secondary hover:bg-secondary/90"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Case Study"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Generate;