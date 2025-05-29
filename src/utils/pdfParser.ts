
import * as pdfjsLib from 'pdfjs-dist';
import { ParsedResume, Education, WorkExperience, Project } from '@/types/resume';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export const parseResumePDF = async (file: File): Promise<ParsedResume> => {
  console.log('Starting PDF parsing for file:', file.name);
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    console.log('Extracted text length:', fullText.length);
    
    // Parse the extracted text
    const parsedResume = parseResumeText(fullText);
    console.log('Parsed resume data:', parsedResume);
    
    return parsedResume;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF resume');
  }
};

const parseResumeText = (text: string): ParsedResume => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Initialize resume object
  const resume: ParsedResume = {
    name: '',
    email: '',
    phone: '',
    education: [],
    skills: [],
    workExperience: [],
    projects: [],
    certifications: [],
    rawText: text
  };
  
  // Extract name (usually first non-empty line)
  resume.name = extractName(lines);
  
  // Extract contact information
  resume.email = extractEmail(text);
  resume.phone = extractPhone(text);
  
  // Extract sections
  resume.education = extractEducation(text);
  resume.skills = extractSkills(text);
  resume.workExperience = extractWorkExperience(text);
  resume.projects = extractProjects(text);
  resume.certifications = extractCertifications(text);
  
  return resume;
};

const extractName = (lines: string[]): string => {
  // Look for the first substantial line that doesn't look like contact info
  for (const line of lines.slice(0, 5)) {
    if (line.length > 3 && 
        !line.includes('@') && 
        !line.match(/\d{3}/) && 
        !line.toLowerCase().includes('resume') &&
        !line.toLowerCase().includes('cv')) {
      return line;
    }
  }
  return 'Name not found';
};

const extractEmail = (text: string): string => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = text.match(emailRegex);
  return match ? match[0] : '';
};

const extractPhone = (text: string): string => {
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const match = text.match(phoneRegex);
  return match ? match[0] : '';
};

const extractEducation = (text: string): Education[] => {
  const education: Education[] = [];
  const educationKeywords = ['university', 'college', 'school', 'bachelor', 'master', 'phd', 'degree', 'diploma'];
  const lines = text.split('\n');
  
  let inEducationSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    
    // Check if we're entering education section
    if (line.includes('education') || line.includes('academic')) {
      inEducationSection = true;
      continue;
    }
    
    // Check if we're leaving education section
    if (inEducationSection && (line.includes('experience') || line.includes('work') || line.includes('project'))) {
      inEducationSection = false;
    }
    
    // Extract education entries
    if (inEducationSection || educationKeywords.some(keyword => line.includes(keyword))) {
      const originalLine = lines[i].trim();
      if (originalLine.length > 10) {
        const yearMatch = originalLine.match(/\b(19|20)\d{2}\b/);
        education.push({
          institution: originalLine.split(',')[0] || originalLine,
          degree: extractDegreeFromLine(originalLine),
          field: extractFieldFromLine(originalLine),
          graduationYear: yearMatch ? yearMatch[0] : '',
          gpa: extractGPAFromLine(originalLine)
        });
      }
    }
  }
  
  return education;
};

const extractDegreeFromLine = (line: string): string => {
  const degreeKeywords = ['bachelor', 'master', 'phd', 'mba', 'bs', 'ba', 'ms', 'ma', 'bsc', 'msc'];
  const lowerLine = line.toLowerCase();
  
  for (const keyword of degreeKeywords) {
    if (lowerLine.includes(keyword)) {
      return keyword.charAt(0).toUpperCase() + keyword.slice(1);
    }
  }
  return 'Degree';
};

const extractFieldFromLine = (line: string): string => {
  const fieldKeywords = ['computer science', 'engineering', 'business', 'marketing', 'finance', 'economics'];
  const lowerLine = line.toLowerCase();
  
  for (const field of fieldKeywords) {
    if (lowerLine.includes(field)) {
      return field;
    }
  }
  return 'Field of Study';
};

const extractGPAFromLine = (line: string): string => {
  const gpaMatch = line.match(/gpa[:\s]*(\d+\.?\d*)/i);
  return gpaMatch ? gpaMatch[1] : '';
};

const extractSkills = (text: string): string[] => {
  const skillKeywords = [
    'javascript', 'python', 'java', 'react', 'node.js', 'html', 'css', 'sql', 'git',
    'aws', 'docker', 'kubernetes', 'mongodb', 'postgresql', 'redis', 'typescript',
    'angular', 'vue', 'express', 'django', 'flask', 'spring', 'hibernate',
    'machine learning', 'data analysis', 'project management', 'agile', 'scrum'
  ];
  
  const skills: string[] = [];
  const lowerText = text.toLowerCase();
  
  skillKeywords.forEach(skill => {
    if (lowerText.includes(skill)) {
      skills.push(skill);
    }
  });
  
  // Also extract from skills section
  const lines = text.split('\n');
  let inSkillsSection = false;
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();
    
    if (lowerLine.includes('skill') || lowerLine.includes('technolog') || lowerLine.includes('competenc')) {
      inSkillsSection = true;
      continue;
    }
    
    if (inSkillsSection && (lowerLine.includes('experience') || lowerLine.includes('education') || lowerLine.includes('project'))) {
      inSkillsSection = false;
    }
    
    if (inSkillsSection && line.trim().length > 0) {
      const lineSkills = line.split(/[,;•·]/).map(s => s.trim()).filter(s => s.length > 1);
      skills.push(...lineSkills);
    }
  }
  
  return [...new Set(skills)]; // Remove duplicates
};

const extractWorkExperience = (text: string): WorkExperience[] => {
  const experience: WorkExperience[] = [];
  const lines = text.split('\n');
  
  let inExperienceSection = false;
  let currentJob: Partial<WorkExperience> | null = null;
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();
    
    if (lowerLine.includes('experience') || lowerLine.includes('work') || lowerLine.includes('employment')) {
      inExperienceSection = true;
      continue;
    }
    
    if (inExperienceSection && (lowerLine.includes('education') || lowerLine.includes('project') || lowerLine.includes('skill'))) {
      if (currentJob && currentJob.company && currentJob.position) {
        experience.push(currentJob as WorkExperience);
      }
      inExperienceSection = false;
    }
    
    if (inExperienceSection && line.trim().length > 0) {
      // Check if this looks like a job title/company line
      if (line.match(/\b(19|20)\d{2}\b/) || line.includes('-') || line.includes('to')) {
        // Save previous job if exists
        if (currentJob && currentJob.company && currentJob.position) {
          experience.push(currentJob as WorkExperience);
        }
        
        // Start new job
        currentJob = {
          company: extractCompanyFromLine(line),
          position: extractPositionFromLine(line),
          duration: extractDurationFromLine(line),
          responsibilities: []
        };
      } else if (currentJob && (line.startsWith('•') || line.startsWith('-') || line.length > 20)) {
        // This looks like a responsibility
        if (!currentJob.responsibilities) {
          currentJob.responsibilities = [];
        }
        currentJob.responsibilities.push(line.replace(/^[•\-\*]\s*/, ''));
      }
    }
  }
  
  // Don't forget the last job
  if (currentJob && currentJob.company && currentJob.position) {
    experience.push(currentJob as WorkExperience);
  }
  
  return experience;
};

const extractCompanyFromLine = (line: string): string => {
  // Try to extract company name (usually comes first)
  const parts = line.split(/[-|,]/);
  return parts[0]?.trim() || 'Company';
};

const extractPositionFromLine = (line: string): string => {
  // Try to extract position (usually comes after company)
  const parts = line.split(/[-|,]/);
  return parts[1]?.trim() || 'Position';
};

const extractDurationFromLine = (line: string): string => {
  // Extract date range
  const datePattern = /\b(19|20)\d{2}\b.*?\b(19|20)\d{2}\b|\b(19|20)\d{2}\b\s*-\s*present/i;
  const match = line.match(datePattern);
  return match ? match[0] : '';
};

const extractProjects = (text: string): Project[] => {
  const projects: Project[] = [];
  const lines = text.split('\n');
  
  let inProjectsSection = false;
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();
    
    if (lowerLine.includes('project') || lowerLine.includes('portfolio')) {
      inProjectsSection = true;
      continue;
    }
    
    if (inProjectsSection && (lowerLine.includes('experience') || lowerLine.includes('education') || lowerLine.includes('skill'))) {
      inProjectsSection = false;
    }
    
    if (inProjectsSection && line.trim().length > 10) {
      projects.push({
        name: line.split('-')[0]?.trim() || line.trim(),
        description: line,
        technologies: extractTechnologiesFromLine(line)
      });
    }
  }
  
  return projects;
};

const extractTechnologiesFromLine = (line: string): string[] => {
  const techKeywords = ['react', 'node', 'python', 'java', 'javascript', 'html', 'css', 'sql'];
  const technologies: string[] = [];
  
  techKeywords.forEach(tech => {
    if (line.toLowerCase().includes(tech)) {
      technologies.push(tech);
    }
  });
  
  return technologies;
};

const extractCertifications = (text: string): string[] => {
  const certifications: string[] = [];
  const lines = text.split('\n');
  
  let inCertSection = false;
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();
    
    if (lowerLine.includes('certification') || lowerLine.includes('certificate') || lowerLine.includes('license')) {
      inCertSection = true;
      continue;
    }
    
    if (inCertSection && (lowerLine.includes('experience') || lowerLine.includes('education') || lowerLine.includes('skill'))) {
      inCertSection = false;
    }
    
    if (inCertSection && line.trim().length > 5) {
      certifications.push(line.trim());
    }
  }
  
  return certifications;
};
