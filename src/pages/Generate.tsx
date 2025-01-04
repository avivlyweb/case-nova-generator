import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCaseStudy } from "@/lib/db";

const physiotherapyTypes = [
  "Orthopedic",
  "Neurological",
  "Cardiovascular",
  "Pediatric",
  "Geriatric",
  "ICU",
  "Rheumatology"
];

const aiRoleDescriptions = {
  Orthopedic: "As an Orthopedic Physiotherapist, focus on musculoskeletal issues.",
  Neurological: "As a Neurological Physiotherapist, focus on assessing and treating patients with neurological conditions. Consider the impact of muscle weakness, spasticity, balance impairments, and movement coordination deficits in your analysis.",
  Cardiovascular: "Specialize in cardiac rehab as a Cardiovascular Physiotherapist.",
  Pediatric: "As a Pediatric Physiotherapist, emphasize developmental stages and child-friendly communication.",
  Geriatric: "As a Geriatric Physiotherapist, focus on assessing and treating older adults.",
  ICU: "As an ICU Physiotherapist, provide rehabilitation for critically ill patients.",
  Rheumatology: "As a Rheumatology Physiotherapist, focus on helping patients achieve and sustain their highest level of independence and function. This involves comprehensive assessments, pain management, exercise therapy, manual therapy, hydrotherapy, physical modalities, patient education, and collaborative treatment planning."
};

const Generate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [specialization, setSpecialization] = useState("Orthopedic");
  const [aiRole, setAiRole] = useState(aiRoleDescriptions.Orthopedic);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const caseStudyData = {
        patient_name: formData.get("patientName") as string,
        age: parseInt(formData.get("age") as string),
        gender: formData.get("gender") as string,
        medical_history: formData.get("history") as string,
        presenting_complaint: formData.get("symptoms") as string,
        condition: formData.get("condition") as string,
        specialization: specialization,
        ai_role: aiRole,
        adl_problem: formData.get("adlProblem") as string,
        patient_background: formData.get("background") as string,
        comorbidities: formData.get("comorbidities") as string,
        psychosocial_factors: formData.get("psychosocialFactors") as string,
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
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-8">
        Generate New Case Study
      </h1>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="specialization">Physiotherapy Specialization</Label>
              <Select 
                name="specialization" 
                value={specialization}
                onValueChange={(value) => {
                  setSpecialization(value);
                  setAiRole(aiRoleDescriptions[value as keyof typeof aiRoleDescriptions]);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {physiotherapyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aiRole">AI Role Description</Label>
              <Textarea
                id="aiRole"
                name="aiRole"
                value={aiRole}
                onChange={(e) => setAiRole(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name</Label>
                <Input id="patientName" name="patientName" placeholder="Enter patient name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" type="number" placeholder="Enter age" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select name="gender">
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Primary Condition</Label>
                <Input id="condition" name="condition" placeholder="Enter primary condition" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adlProblem">ADL-related Problem</Label>
              <Input
                id="adlProblem"
                name="adlProblem"
                placeholder="Enter ADL-related problem"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="background">Patient Background</Label>
              <Textarea
                id="background"
                name="background"
                placeholder="Enter patient background"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="history">Medical History</Label>
              <Textarea
                id="history"
                name="history"
                placeholder="Enter relevant medical history"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms">Current Symptoms</Label>
              <Textarea
                id="symptoms"
                name="symptoms"
                placeholder="Describe current symptoms"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comorbidities">Comorbidities</Label>
              <Textarea
                id="comorbidities"
                name="comorbidities"
                placeholder="Enter comorbidities"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="psychosocialFactors">Psychosocial Factors</Label>
              <Textarea
                id="psychosocialFactors"
                name="psychosocialFactors"
                placeholder="Enter psychosocial factors"
                className="min-h-[100px]"
              />
            </div>

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