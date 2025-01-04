import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCaseStudies } from "@/lib/db";
import type { CaseStudy } from "@/types/case-study";
import { useToast } from "@/components/ui/use-toast";

const CaseStudies = () => {
  const { toast } = useToast();
  
  const { data: caseStudies, isLoading, error } = useQuery({
    queryKey: ['case-studies'],
    queryFn: getCaseStudies,
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load case studies",
    });
    return null;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8">My Case Studies</h1>
      <div className="grid gap-6">
        {caseStudies?.map((study) => (
          <Card key={study.id}>
            <CardHeader>
              <CardTitle className="text-xl">
                Case Study: {study.patient_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Condition: {study.condition}</p>
              <p className="text-gray-600">Date: {study.date}</p>
              <p className="text-gray-600">Medical History: {study.medical_history}</p>
              <p className="text-gray-600">Presenting Complaint: {study.presenting_complaint}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CaseStudies;