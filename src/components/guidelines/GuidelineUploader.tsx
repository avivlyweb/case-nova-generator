import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { processPDFGuideline } from '@/utils/pdfProcessor';
import { Loader2, Upload } from 'lucide-react';

export default function GuidelineUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await processPDFGuideline(file);
      
      if (result) {
        toast({
          title: "Success",
          description: "Guideline processed and stored successfully",
        });
      } else {
        throw new Error('Failed to process guideline');
      }
    } catch (error) {
      console.error('Error uploading guideline:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process guideline",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-700">
      <div className="flex flex-col items-center gap-2">
        <Upload className="h-10 w-10 text-gray-400" />
        <h3 className="text-lg font-semibold">Upload Guideline PDF</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Upload a PDF file to process and store the guideline
        </p>
      </div>
      
      <label htmlFor="pdf-upload">
        <Button 
          variant="outline" 
          disabled={isUploading}
          className="cursor-pointer"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Select PDF'
          )}
        </Button>
        <input
          id="pdf-upload"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
      </label>
    </div>
  );
}