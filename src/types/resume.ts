
export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  education: Education[];
  skills: string[];
  workExperience: WorkExperience[];
  projects: Project[];
  certifications: string[];
  rawText: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationYear: string;
  gpa?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  duration: string;
  responsibilities: string[];
  startDate?: string;
  endDate?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  duration?: string;
}

export interface AnalysisResult {
  overallScore: number;
  scores: {
    structure: number;
    content: number;
    keywords: number;
    readability: number;
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: Suggestion[];
  skillGaps: string[];
  detectedRole: string;
}

export interface Suggestion {
  section: string;
  issue: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

export interface JobMatch {
  title: string;
  level: string;
  keywords: string[];
  linkedinUrl: string;
  matchScore: number;
}
