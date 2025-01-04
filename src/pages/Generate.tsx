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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Generate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const sections = [
    {
      title: "Patient Introduction",
      description: "Collect comprehensive personal and medical history, including demographics, medical history, presenting complaint, contextual information, psychosocial factors, standardized screening tools, and PROMs."
    },
    {
      title: "Interview and Problem List",
      description: "Conduct a detailed clinical interview to identify all pertinent patient issues and concerns. Include specific details from the anamnesis and multidisciplinary insights."
    },
    {
      title: "Assessment Strategy",
      description: "Elaborate on the assessment strategy ensuring it aligns with the latest clinical standards and guidelines."
    },
    {
      title: "Assessment Findings",
      description: "Present the findings clearly, prioritizing clarity and clinical utility in the data presentation."
    },
    {
      title: "Goals/Actions",
      description: "Establish at least 2 short and 2 long SMART goals that are patient-centered."
    },
    {
      title: "Intervention Plan",
      description: "Describe the Physiotherapy intervention plan in detail, encompassing therapeutic and multidisciplinary dimensions."
    },
    {
      title: "Reassessment",
      description: "Plan for systematic reassessment to gauge therapy effectiveness."
    },
    {
      title: "Explanation and Justification",
      description: "Provide thorough justifications for each choice, supported by current research and guidelines."
    },
    {
      title: "Reference List",
      description: "List all references from 2019 onwards in APA format."
    },
    {
      title: "Medication Information",
      description: "Provide a list of medications prescribed, including their purposes."
    },
    {
      title: "ICF Classification",
      description: "Assign relevant ICF codes based on the International Classification of Functioning, Disability and Health."
    }
  ];

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

            <Accordion type="single" collapsible className="w-full">
              {sections.map((section, index) => (
                <AccordionItem key={index} value={`section-${index}`}>
                  <AccordionTrigger className="text-left">
                    {section.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                      <Textarea
                        name={`section-${index}`}
                        placeholder={`Enter ${section.title.toLowerCase()} details`}
                        className="min-h-[100px]"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

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