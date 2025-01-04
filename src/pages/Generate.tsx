import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { createCaseStudy } from "@/lib/db";
import { ArrowRight } from "lucide-react";
import PatientInformation, { PatientFormData } from "@/components/generate/PatientInformation";
import SpecializationSelect from "@/components/generate/SpecializationSelect";
import { physiotherapyTypes, aiRoleDescriptions } from "@/components/generate/SpecializationSelect";

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

      await createCaseStudy(caseStudyData);
      toast({
        title: "Success",
        description: "Case study created successfully",
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
    <div className="w-full max-w-4xl mx-auto space-y-6 px-4 md:px-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
          Generate New Case Study
        </h1>
        <p className="text-base md:text-lg text-gray-500 dark:text-gray-400">
          Create an evidence-based physiotherapy case study with AI assistance
        </p>
      </div>

      <Card className="p-4 md:p-6 bg-white/5 backdrop-blur-sm border border-gray-800/50 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
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
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-colors py-6 md:py-4"
            disabled={loading}
          >
            {loading ? (
              "Generating..."
            ) : (
              <span className="flex items-center justify-center gap-2">
                Generate Case Study
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Generate;