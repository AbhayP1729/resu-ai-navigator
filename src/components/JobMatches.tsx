
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Briefcase, Star, TrendingUp } from 'lucide-react';
import { ParsedResume, JobMatch } from '@/types/resume';
import { generateJobMatches } from '@/utils/jobMatcher';

interface JobMatchesProps {
  parsedResume: ParsedResume;
}

const JobMatches: React.FC<JobMatchesProps> = ({ parsedResume }) => {
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobMatches = async () => {
      setIsLoading(true);
      try {
        const matches = await generateJobMatches(parsedResume);
        setJobMatches(matches);
      } catch (error) {
        console.error('Error generating job matches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobMatches();
  }, [parsedResume]);

  const getMatchColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-blue-400';
  };

  const getMatchBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'outline';
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Briefcase className="h-5 w-5 text-blue-400 animate-pulse" />
            <span className="text-white">Generating job matches...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Briefcase className="h-5 w-5 text-green-400" />
            <span>Smart Job Matches</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm mb-4">
            Based on your skills and experience, here are personalized job recommendations:
          </p>
          
          <div className="space-y-4">
            {jobMatches.map((job, index) => (
              <div key={index} className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-white mb-1">{job.title}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                        {job.level}
                      </Badge>
                      <span className={`text-sm font-medium ${getMatchColor(job.matchScore)}`}>
                        {job.matchScore}% match
                      </span>
                    </div>
                  </div>
                  <Star className="h-4 w-4 text-yellow-400" />
                </div>
                
                <div className="mb-3">
                  <p className="text-gray-400 text-xs mb-2">Matching Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {job.keywords.slice(0, 5).map((keyword, kidx) => (
                      <Badge 
                        key={kidx} 
                        variant={getMatchBadgeVariant(job.matchScore)}
                        className="text-xs"
                      >
                        {keyword}
                      </Badge>
                    ))}
                    {job.keywords.length > 5 && (
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-500">
                        +{job.keywords.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Button 
                  onClick={() => window.open(job.linkedinUrl, '_blank')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Search on LinkedIn
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Career Growth Section */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <span>Career Growth Opportunities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-white text-sm font-medium">Senior-Level Positions</p>
                <p className="text-gray-400 text-xs">
                  Focus on leadership skills and system design to advance to senior roles
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-white text-sm font-medium">Cross-Functional Roles</p>
                <p className="text-gray-400 text-xs">
                  Consider product management or technical lead positions
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-white text-sm font-medium">Specialized Fields</p>
                <p className="text-gray-400 text-xs">
                  Explore AI/ML, cybersecurity, or cloud architecture specializations
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobMatches;
