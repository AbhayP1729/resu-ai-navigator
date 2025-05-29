
import { ParsedResume, AnalysisResult, Suggestion } from '@/types/resume';

export const analyzeResume = async (resume: ParsedResume): Promise<AnalysisResult> => {
  console.log('Starting resume analysis...');
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const scores = calculateScores(resume);
  const overallScore = Math.round((scores.structure + scores.content + scores.keywords + scores.readability) / 4);
  
  const strengths = identifyStrengths(resume, scores);
  const weaknesses = identifyWeaknesses(resume, scores);
  const suggestions = generateSuggestions(resume, scores);
  const skillGaps = identifySkillGaps(resume);
  const detectedRole = detectRole(resume);
  
  return {
    overallScore,
    scores,
    strengths,
    weaknesses,
    suggestions,
    skillGaps,
    detectedRole
  };
};

const calculateScores = (resume: ParsedResume) => {
  const structure = calculateStructureScore(resume);
  const content = calculateContentScore(resume);
  const keywords = calculateKeywordScore(resume);
  const readability = calculateReadabilityScore(resume);
  
  return { structure, content, keywords, readability };
};

const calculateStructureScore = (resume: ParsedResume): number => {
  let score = 0;
  const maxScore = 100;
  
  // Check essential sections
  if (resume.name && resume.name !== 'Name not found') score += 15;
  if (resume.email) score += 15;
  if (resume.workExperience.length > 0) score += 25;
  if (resume.education.length > 0) score += 20;
  if (resume.skills.length > 0) score += 25;
  
  return Math.min(score, maxScore);
};

const calculateContentScore = (resume: ParsedResume): number => {
  let score = 0;
  
  // Work experience quality
  const hasDetailedExperience = resume.workExperience.some(exp => 
    exp.responsibilities && exp.responsibilities.length > 2
  );
  if (hasDetailedExperience) score += 30;
  
  // Skills diversity
  if (resume.skills.length >= 5) score += 25;
  if (resume.skills.length >= 10) score += 10;
  
  // Education completeness
  const hasCompleteEducation = resume.education.some(edu => 
    edu.institution && edu.degree && edu.field
  );
  if (hasCompleteEducation) score += 20;
  
  // Projects
  if (resume.projects.length > 0) score += 15;
  
  return Math.min(score, 100);
};

const calculateKeywordScore = (resume: ParsedResume): number => {
  const importantKeywords = [
    'manage', 'lead', 'develop', 'implement', 'design', 'optimize', 'improve',
    'collaborate', 'analyze', 'create', 'build', 'maintain', 'support'
  ];
  
  const text = resume.rawText.toLowerCase();
  const foundKeywords = importantKeywords.filter(keyword => text.includes(keyword));
  
  return Math.min((foundKeywords.length / importantKeywords.length) * 100, 100);
};

const calculateReadabilityScore = (resume: ParsedResume): number => {
  let score = 100;
  
  // Check for common issues
  const text = resume.rawText;
  
  // Too many technical abbreviations without explanation
  const abbreviations = text.match(/\b[A-Z]{2,}\b/g) || [];
  if (abbreviations.length > 20) score -= 15;
  
  // Sentence length (approximate)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = text.split(/\s+/).length / sentences.length;
  if (avgSentenceLength > 25) score -= 10;
  
  // Passive voice detection (simplified)
  const passiveIndicators = ['was', 'were', 'been', 'being'];
  const passiveCount = passiveIndicators.reduce((count, indicator) => {
    return count + (text.toLowerCase().match(new RegExp(`\\b${indicator}\\b`, 'g')) || []).length;
  }, 0);
  if (passiveCount > 10) score -= 15;
  
  return Math.max(score, 0);
};

const identifyStrengths = (resume: ParsedResume, scores: any): string[] => {
  const strengths: string[] = [];
  
  if (scores.structure >= 80) {
    strengths.push('Well-structured resume with all essential sections');
  }
  
  if (resume.skills.length >= 10) {
    strengths.push('Diverse skill set demonstrates versatility');
  }
  
  if (resume.workExperience.length >= 3) {
    strengths.push('Substantial work experience shows career progression');
  }
  
  if (resume.projects.length > 0) {
    strengths.push('Portfolio projects demonstrate practical application of skills');
  }
  
  if (resume.certifications.length > 0) {
    strengths.push('Professional certifications show commitment to continuous learning');
  }
  
  const hasQuantifiableAchievements = resume.rawText.match(/\d+%|\$\d+|\d+\+/);
  if (hasQuantifiableAchievements) {
    strengths.push('Includes quantifiable achievements and metrics');
  }
  
  return strengths;
};

const identifyWeaknesses = (resume: ParsedResume, scores: any): string[] => {
  const weaknesses: string[] = [];
  
  if (!resume.phone) {
    weaknesses.push('Missing phone number in contact information');
  }
  
  if (resume.workExperience.length === 0) {
    weaknesses.push('No work experience listed');
  }
  
  if (resume.skills.length < 5) {
    weaknesses.push('Limited skills section - consider adding more relevant skills');
  }
  
  if (scores.keywords < 50) {
    weaknesses.push('Lacks action verbs and impactful keywords');
  }
  
  if (resume.projects.length === 0) {
    weaknesses.push('No projects listed - consider adding relevant work');
  }
  
  const hasGenericPhrases = resume.rawText.toLowerCase().includes('team player') || 
                          resume.rawText.toLowerCase().includes('hard worker');
  if (hasGenericPhrases) {
    weaknesses.push('Contains generic phrases that could be more specific');
  }
  
  return weaknesses;
};

const generateSuggestions = (resume: ParsedResume, scores: any): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  
  if (scores.structure < 70) {
    suggestions.push({
      section: 'Structure',
      issue: 'Missing key resume sections',
      recommendation: 'Ensure your resume includes contact info, work experience, education, and skills sections',
      priority: 'high'
    });
  }
  
  if (resume.skills.length < 8) {
    suggestions.push({
      section: 'Skills',
      issue: 'Limited skills listed',
      recommendation: 'Add more relevant technical and soft skills. Include programming languages, tools, and frameworks',
      priority: 'medium'
    });
  }
  
  if (scores.keywords < 60) {
    suggestions.push({
      section: 'Content',
      issue: 'Lacks impactful action verbs',
      recommendation: 'Use strong action verbs like "developed", "implemented", "optimized", "led" instead of passive language',
      priority: 'high'
    });
  }
  
  const lackQuantification = !resume.rawText.match(/\d+%|\$\d+|\d+ (users|projects|team)/);
  if (lackQuantification) {
    suggestions.push({
      section: 'Experience',
      issue: 'Missing quantifiable achievements',
      recommendation: 'Add specific numbers, percentages, and metrics to demonstrate impact (e.g., "Improved performance by 25%")',
      priority: 'high'
    });
  }
  
  if (resume.projects.length === 0) {
    suggestions.push({
      section: 'Projects',
      issue: 'No projects section',
      recommendation: 'Add a projects section showcasing relevant work, personal projects, or open-source contributions',
      priority: 'medium'
    });
  }
  
  return suggestions;
};

const identifySkillGaps = (resume: ParsedResume): string[] => {
  const detectedRole = detectRole(resume);
  const skillGaps: string[] = [];
  
  const roleRequirements: { [key: string]: string[] } = {
    'Software Engineer': ['Git', 'Testing', 'Debugging', 'Algorithms', 'System Design'],
    'Data Scientist': ['Statistics', 'Machine Learning', 'Data Visualization', 'SQL', 'Python/R'],
    'Product Manager': ['Analytics', 'User Research', 'Roadmap Planning', 'Stakeholder Management'],
    'Designer': ['User Experience', 'Prototyping', 'Design Systems', 'User Research'],
    'Marketing': ['SEO', 'Content Marketing', 'Analytics', 'Social Media', 'Email Marketing']
  };
  
  const requiredSkills = roleRequirements[detectedRole] || [];
  const resumeSkillsLower = resume.skills.map(skill => skill.toLowerCase());
  
  requiredSkills.forEach(skill => {
    if (!resumeSkillsLower.some(resumeSkill => resumeSkill.includes(skill.toLowerCase()))) {
      skillGaps.push(skill);
    }
  });
  
  return skillGaps;
};

const detectRole = (resume: ParsedResume): string => {
  const text = resume.rawText.toLowerCase();
  const skills = resume.skills.map(skill => skill.toLowerCase());
  
  // Software Engineering indicators
  const softwareKeywords = ['javascript', 'python', 'java', 'react', 'node', 'git', 'api', 'database'];
  const softwareScore = softwareKeywords.reduce((score, keyword) => {
    return score + (text.includes(keyword) || skills.includes(keyword) ? 1 : 0);
  }, 0);
  
  // Data Science indicators
  const dataKeywords = ['python', 'machine learning', 'data analysis', 'statistics', 'pandas', 'numpy'];
  const dataScore = dataKeywords.reduce((score, keyword) => {
    return score + (text.includes(keyword) || skills.includes(keyword) ? 1 : 0);
  }, 0);
  
  // Product Management indicators
  const productKeywords = ['product', 'roadmap', 'stakeholder', 'analytics', 'user research', 'agile'];
  const productScore = productKeywords.reduce((score, keyword) => {
    return score + (text.includes(keyword) ? 1 : 0);
  }, 0);
  
  // Design indicators
  const designKeywords = ['design', 'ui', 'ux', 'figma', 'photoshop', 'sketch', 'prototype'];
  const designScore = designKeywords.reduce((score, keyword) => {
    return score + (text.includes(keyword) || skills.includes(keyword) ? 1 : 0);
  }, 0);
  
  // Marketing indicators
  const marketingKeywords = ['marketing', 'seo', 'content', 'social media', 'campaign', 'analytics'];
  const marketingScore = marketingKeywords.reduce((score, keyword) => {
    return score + (text.includes(keyword) ? 1 : 0);
  }, 0);
  
  const scores = {
    'Software Engineer': softwareScore,
    'Data Scientist': dataScore,
    'Product Manager': productScore,
    'Designer': designScore,
    'Marketing': marketingScore
  };
  
  const detectedRole = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
  
  return detectedRole;
};
