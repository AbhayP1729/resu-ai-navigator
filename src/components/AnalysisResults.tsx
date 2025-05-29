
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertTriangle, 
  Target, 
  TrendingUp, 
  Download,
  Brain,
  FileText,
  Star
} from 'lucide-react';
import { ParsedResume, AnalysisResult } from '@/types/resume';
import { generatePDFReport } from '@/utils/pdfExport';
import { toast } from '@/hooks/use-toast';

interface AnalysisResultsProps {
  parsedResume: ParsedResume | null;
  analysisResult: AnalysisResult | null;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ parsedResume, analysisResult }) => {
  if (!parsedResume || !analysisResult) {
    return null;
  }

  const handleDownloadReport = async () => {
    try {
      await generatePDFReport(parsedResume, analysisResult);
      toast({
        title: "Report Downloaded",
        description: "Your analysis report has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-400" />
              <span>Resume Analysis</span>
            </div>
            <Button 
              onClick={handleDownloadReport}
              variant="outline"
              size="sm"
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className={`text-4xl font-bold mb-2 ${getScoreColor(analysisResult.overallScore)}`}>
              {analysisResult.overallScore}/100
            </div>
            <p className="text-gray-400">Overall Resume Score</p>
            <p className="text-sm text-gray-500 mt-1">
              Detected Role: <span className="text-blue-400 font-medium">{analysisResult.detectedRole}</span>
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Structure</span>
                <span className={getScoreColor(analysisResult.scores.structure)}>
                  {analysisResult.scores.structure}%
                </span>
              </div>
              <Progress 
                value={analysisResult.scores.structure} 
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Content</span>
                <span className={getScoreColor(analysisResult.scores.content)}>
                  {analysisResult.scores.content}%
                </span>
              </div>
              <Progress 
                value={analysisResult.scores.content} 
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Keywords</span>
                <span className={getScoreColor(analysisResult.scores.keywords)}>
                  {analysisResult.scores.keywords}%
                </span>
              </div>
              <Progress 
                value={analysisResult.scores.keywords} 
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Readability</span>
                <span className={getScoreColor(analysisResult.scores.readability)}>
                  {analysisResult.scores.readability}%
                </span>
              </div>
              <Progress 
                value={analysisResult.scores.readability} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span>Top Strengths</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysisResult.strengths.map((strength, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Star className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm">{strength}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weaknesses & Suggestions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <span>Areas for Improvement</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysisResult.weaknesses.map((weakness, index) => (
              <div key={index} className="flex items-start space-x-3">
                <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm">{weakness}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Suggestions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Target className="h-5 w-5 text-blue-400" />
            <span>Actionable Suggestions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysisResult.suggestions.map((suggestion, index) => (
              <div key={index} className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{suggestion.section}</h4>
                  <Badge 
                    variant={suggestion.priority === 'high' ? 'destructive' : 
                            suggestion.priority === 'medium' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {suggestion.priority} priority
                  </Badge>
                </div>
                <p className="text-gray-400 text-sm mb-2">{suggestion.issue}</p>
                <p className="text-gray-300 text-sm">{suggestion.recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skill Gaps */}
      {analysisResult.skillGaps.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              <span>Skill Gaps to Address</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm mb-3">
              Based on your detected role ({analysisResult.detectedRole}), consider developing these skills:
            </p>
            <div className="flex flex-wrap gap-2">
              {analysisResult.skillGaps.map((skill, index) => (
                <Badge key={index} variant="outline" className="border-purple-400 text-purple-400">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisResults;
