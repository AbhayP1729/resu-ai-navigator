
import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ParsedResume, AnalysisResult } from '@/types/resume';
import { parseResumePDF } from '@/utils/pdfParser';
import { analyzeResume } from '@/utils/resumeAnalyzer';

interface ResumeUploadProps {
  onAnalyzed: (parsedResume: ParsedResume, analysisResult: AnalysisResult) => void;
  onAnalysisStart: () => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onAnalyzed, onAnalysisStart }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileProcess = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    onAnalysisStart();

    try {
      console.log('Starting PDF parsing...');
      const parsedResume = await parseResumePDF(file);
      console.log('PDF parsed successfully:', parsedResume);
      
      console.log('Starting resume analysis...');
      const analysisResult = await analyzeResume(parsedResume);
      console.log('Analysis completed:', analysisResult);
      
      onAnalyzed(parsedResume, analysisResult);
    } catch (error) {
      console.error('Error processing resume:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process the resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onAnalyzed, onAnalysisStart]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileProcess(files[0]);
    }
  }, [handleFileProcess]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  }, [handleFileProcess]);

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-8">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-blue-400 bg-blue-400/10'
              : 'border-gray-600 hover:border-gray-500'
          } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            {isProcessing ? (
              <>
                <div className="animate-spin">
                  <FileText className="h-12 w-12 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-white">Processing Resume...</h3>
                <p className="text-gray-400">Please wait while we analyze your document</p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400" />
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    Drop your resume here or click to upload
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Supports PDF files up to 10MB
                  </p>
                  <Button 
                    onClick={() => document.getElementById('file-input')?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Choose File
                  </Button>
                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-white mb-1">Privacy Notice</h4>
              <p className="text-sm text-gray-400">
                Your resume is processed entirely in your browser. No data is sent to external servers or stored anywhere.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeUpload;
