import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from "../components/ui/use-toast";

const GenerateFullCasePage = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedCase, setSelectedCase] = useState('');
  const [cases, setCases] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('case_templates').select('*');
      
      if (error) {
        console.error('Error fetching case templates:', error);
        toast({
          title: "Error",
          description: "Failed to load case templates. Please try again.",
          variant: "destructive",
        });
      } else {
        setCases(data || []);
        console.log('Fetched cases:', data);
        if (data && data.length > 0 && !selectedCase) {
          setSelectedCase(data[0].id);
        }
      }
    } catch (error) {
      console.error('Exception fetching cases:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading cases.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFullCase = async () => {
    if (!selectedCase) {
      toast({
        title: "Error",
        description: "Please select a case template first.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      console.log('Generating full case study for case:', selectedCase);
      
      // Log the payload for debugging
      const payload = { 
        caseTemplateId: selectedCase,
        type: 'full'
      };
      console.log('Sending payload to generate-case-study:', payload);
      
      const { data, error } = await supabase.functions.invoke('generate-case-study', {
        body: payload
      });

      console.log('Response from generate-case-study:', data, error);

      if (error) {
        console.error('Error generating full case study:', error);
        toast({
          title: "Generation Failed",
          description: "Failed to generate the full case study. Please try again.",
          variant: "destructive",
        });
      } else if (data && data.caseStudyId) {
        console.log('Full case study generated successfully:', data);
        toast({
          title: "Success",
          description: "Full case study generated successfully!",
        });
        navigate(`/case-study/${data.caseStudyId}`);
      } else {
        console.error('Unexpected response format:', data);
        toast({
          title: "Error",
          description: "Received an invalid response from the server.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Exception generating full case study:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during generation.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Generate Full Case Study</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="mb-4 text-gray-600">
          Generate a comprehensive case study with detailed analysis, recommendations, and implementation steps.
        </p>
        
        {loading ? (
          <div className="flex justify-center my-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select Case Template</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={selectedCase}
                onChange={(e) => setSelectedCase(e.target.value)}
                disabled={generating}
              >
                {cases.map(caseTemplate => (
                  <option key={caseTemplate.id} value={caseTemplate.id}>
                    {caseTemplate.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-between items-center">
              <Button 
                onClick={() => navigate('/case-studies')}
                variant="outline"
              >
                Back to Case Studies
              </Button>
              
              <Button 
                onClick={handleGenerateFullCase} 
                disabled={generating || !selectedCase}
                className="flex items-center justify-center"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Full Case...
                  </>
                ) : (
                  "Generate Full Case Study"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GenerateFullCasePage;
