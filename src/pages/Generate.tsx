import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { createCaseStudy } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import PatientInformation, { PatientFormData } from "@/components/generate/PatientInformation";
import SpecializationSelect, {
  physiotherapyTypes,
  aiRoleDescriptions,
} from "@/components/generate/SpecializationSelect";

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
      // First, create the case study in the database
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

      const createdCase = await createCaseStudy(caseStudyData);

      if (!createdCase) {
        throw new Error("Failed to create case study");
      }

      // Generate the case study content using the edge function
      const { data: generatedData, error: generationError } = await supabase.functions.invoke('process-case-study', {
        body: {
          caseStudy: createdCase,
          action: 'generate'
        }
      });

      if (generationError) throw generationError;

      // Update the case study with the generated content
      const { error: updateError } = await supabase
        .from('case_studies')
        .update({
          generated_sections: generatedData.sections,
          medical_entities: generatedData.medical_entities,
          reference_list: generatedData.references,
        })
        .eq('id', createdCase.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Case study created and generated successfully",
      });
      
      // Navigate to case studies page to see the result
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