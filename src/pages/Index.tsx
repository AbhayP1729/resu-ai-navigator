
import React, { useState } from 'react';
import { Upload, FileText, Brain, Briefcase, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import ResumeUpload from '@/components/ResumeUpload';
import AnalysisResults from '@/components/AnalysisResults';
import JobMatches from '@/components/JobMatches';
import { ParsedResume, AnalysisResult } from '@/types/resume';

const Index = () => {
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleResumeAnalyzed = (resume: ParsedResume, analysis: AnalysisResult) => {
    setParsedResume(resume);
    setAnalysisResult(analysis);
    setIsAnalyzing(false);
    toast({
      title: "Analysis Complete",
      description: "Your resume has been successfully analyzed!",
    });
  };

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-black border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">ResumAI Navigator</h1>
          </div>
          <p className="text-gray-400 mt-2">AI-Powered Resume Analysis & Job Matching Platform</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Main Content */}
        {!parsedResume ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Upload Your Resume</h2>
              <p className="text-gray-400">Get instant AI-powered feedback and job recommendations</p>
            </div>
            
            <ResumeUpload 
              onAnalyzed={handleResumeAnalyzed}
              onAnalysisStart={handleAnalysisStart}
            />

            {isAnalyzing && (
              <Card className="bg-gray-800 border-gray-700 mt-6">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Brain className="h-5 w-5 text-blue-400 animate-pulse" />
                    <span className="text-white font-medium">Analyzing your resume...</span>
                  </div>
                  <Progress value={75} className="w-full" />
                  <p className="text-gray-400 text-sm mt-2">Processing PDF, extracting content, and running AI analysis</p>
                </CardContent>
              </Card>
            )}

            {/* Features Section */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <FileText className="h-5 w-5 text-blue-400" />
                    <span>Smart Parsing</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Advanced PDF parsing extracts all key information including skills, experience, and education.</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Brain className="h-5 w-5 text-yellow-400" />
                    <span>AI Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Local NLP analysis provides detailed feedback on content quality and structure.</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Briefcase className="h-5 w-5 text-green-400" />
                    <span>Job Matching</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Smart job recommendations based on your skills and experience profile.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Analysis Results</h2>
              <Button 
                onClick={() => {
                  setParsedResume(null);
                  setAnalysisResult(null);
                }}
                variant="outline"
                className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Analyze New Resume
              </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <AnalysisResults 
                  parsedResume={parsedResume}
                  analysisResult={analysisResult}
                />
              </div>
              <div>
                <JobMatches parsedResume={parsedResume} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
