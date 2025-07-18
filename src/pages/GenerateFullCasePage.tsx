import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const GenerateFullCasePage = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [caseTemplate, setCaseTemplate] = useState<any>(null);
  const { id: caseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (caseId) {
      fetchCaseTemplate(caseId);
    } else {
      console.error('No caseId provided in URL');
    }
  }, [caseId]);

  const fetchCaseTemplate = async (id: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('case_studies')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching case template:', error);
        toast({
          title: "Error",
          description: `Failed to load case template: ${error.message}`,
          variant: "destructive",
        });
      } else if (data) {
        setCaseTemplate(data);
      } else {
        toast({
          title: "Error",
          description: "No case template data was returned.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Exception fetching case template:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading the case template.",
        variant: "destructive",
      });
      navigate('/case-studies');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFullCase = async () => {
    if (!caseTemplate) {
      toast({
        title: "Error",
        description: "No case template available.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      console.log('Case template data:', JSON.stringify(caseTemplate, null, 2));
      
      const payload = { 
        caseStudy: caseTemplate,
        action: 'generate'
      };
      
      console.log('Sending payload to process-case-study:', JSON.stringify(payload, null, 2));
      
      const { data, error } = await supabase.functions.invoke('process-case-study', {
        body: payload
      });

      console.log('Response from process-case-study:', { data, error });

      if (error) {
        console.error('Error generating full case study:', error);
        toast({
          title: "Generation Failed",
          description: `Failed to generate the full case study: ${error.message || 'Unknown error'}`,
          variant: "destructive",
        });
      } else if (data?.success) {
        console.log('Generated case study data:', data);
        console.log('References found:', data.references);
        console.log('ICF codes found:', data.icf_codes);
        
        // Update the case study with the generated content
        const formattedSections = Array.isArray(data.sections) ? data.sections : 
          Object.entries(data.sections || {}).map(([title, content]) => ({
            title,
            content: typeof content === 'string' ? content : JSON.stringify(content)
          }));

        const formattedICFCodes = Array.isArray(data.icf_codes) ? data.icf_codes :
          typeof data.icf_codes === 'string' ? [data.icf_codes] : [];

        // Update the case study in the database
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
          .eq('id', caseTemplate.id);

        if (updateError) {
          console.error('Error updating case study:', updateError);
          toast({
            title: "Update Failed",
            description: "Generated content successfully but failed to save. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Full case study generated successfully!",
          });
          // Navigate back to case studies or to the specific case
          navigate('/case-studies');
        }
      } else {
        console.error('Unexpected response format:', data);
        toast({
          title: "Error",
          description: "Received an invalid response from the server. Please check the console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Exception generating full case study:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while generating the case study.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="ml-2">Loading case template...</p>
      </div>
    );
  }

  if (!caseTemplate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Case Template Not Found</h1>
        <p className="text-muted-foreground mb-4">The requested case template could not be loaded.</p>
        <Button onClick={() => navigate('/case-studies')}>
          Back to Case Studies
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Generate Full Case Study
          </h1>
          
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Case Details
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <p><span className="font-medium">Condition:</span> {caseTemplate.condition || 'N/A'}</p>
                <p><span className="font-medium">Patient:</span> {caseTemplate.patient_name || 'N/A'}</p>
                <p><span className="font-medium">Age:</span> {caseTemplate.age || 'N/A'}</p>
                <p><span className="font-medium">Gender:</span> {caseTemplate.gender || 'N/A'}</p>
                {caseTemplate.presenting_complaint && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <p className="font-medium">Presenting Complaint:</p>
                    <p>{caseTemplate.presenting_complaint}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
              <Button
                onClick={handleGenerateFullCase}
                disabled={generating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Full Case Study'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateFullCasePage;
