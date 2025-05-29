
import { ParsedResume, JobMatch } from '@/types/resume';

export const generateJobMatches = async (resume: ParsedResume): Promise<JobMatch[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const detectedRole = detectPrimaryRole(resume);
  const experienceLevel = determineExperienceLevel(resume);
  const skillSet = resume.skills.map(skill => skill.toLowerCase());
  
  const jobMatches: JobMatch[] = [];
  
  // Generate role-specific job matches
  const roleMatches = generateRoleBasedMatches(detectedRole, experienceLevel, skillSet);
  jobMatches.push(...roleMatches);
  
  // Generate skill-based matches
  const skillMatches = generateSkillBasedMatches(skillSet, experienceLevel);
  jobMatches.push(...skillMatches);
  
  // Sort by match score and return top matches
  return jobMatches
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6);
};

const detectPrimaryRole = (resume: ParsedResume): string => {
  const text = resume.rawText.toLowerCase();
  const skills = resume.skills.map(skill => skill.toLowerCase());
  
  // Define role indicators
  const roleIndicators = {
    'Software Engineer': ['javascript', 'python', 'java', 'react', 'node', 'git', 'api', 'web development'],
    'Data Scientist': ['python', 'machine learning', 'data analysis', 'pandas', 'numpy', 'statistics', 'sql'],
    'Product Manager': ['product management', 'roadmap', 'stakeholder', 'analytics', 'user research', 'agile'],
    'UX Designer': ['ux', 'ui', 'design', 'figma', 'sketch', 'user research', 'prototyping'],
    'DevOps Engineer': ['aws', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'terraform', 'monitoring'],
    'Frontend Developer': ['react', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript'],
    'Backend Developer': ['node.js', 'python', 'java', 'api', 'database', 'microservices', 'server'],
    'Mobile Developer': ['react native', 'flutter', 'ios', 'android', 'swift', 'kotlin', 'mobile'],
  };
  
  let maxScore = 0;
  let primaryRole = 'Software Engineer';
  
  Object.entries(roleIndicators).forEach(([role, indicators]) => {
    const score = indicators.reduce((acc, indicator) => {
      const skillMatch = skills.some(skill => skill.includes(indicator));
      const textMatch = text.includes(indicator);
      return acc + (skillMatch ? 2 : 0) + (textMatch ? 1 : 0);
    }, 0);
    
    if (score > maxScore) {
      maxScore = score;
      primaryRole = role;
    }
  });
  
  return primaryRole;
};

const determineExperienceLevel = (resume: ParsedResume): string => {
  const workExperience = resume.workExperience.length;
  const yearsPattern = /(\d+)\s*(?:years?|yrs?)/gi;
  const yearMatches = resume.rawText.match(yearsPattern);
  
  let totalYears = 0;
  if (yearMatches) {
    yearMatches.forEach(match => {
      const years = parseInt(match.match(/\d+/)?.[0] || '0');
      totalYears = Math.max(totalYears, years);
    });
  }
  
  // Estimate based on work experience count
  const estimatedYears = Math.max(totalYears, workExperience * 1.5);
  
  if (estimatedYears < 1) return 'Entry Level';
  if (estimatedYears < 3) return 'Junior';
  if (estimatedYears < 6) return 'Mid Level';
  if (estimatedYears < 10) return 'Senior';
  return 'Lead/Principal';
};

const generateRoleBasedMatches = (role: string, level: string, skills: string[]): JobMatch[] => {
  const matches: JobMatch[] = [];
  
  const roleVariations = {
    'Software Engineer': [
      'Software Developer',
      'Full Stack Developer',
      'Software Engineer',
      'Web Developer',
      'Application Developer'
    ],
    'Data Scientist': [
      'Data Scientist',
      'Data Analyst',
      'Machine Learning Engineer',
      'Research Scientist',
      'Data Engineer'
    ],
    'Product Manager': [
      'Product Manager',
      'Product Owner',
      'Program Manager',
      'Technical Product Manager',
      'Growth Product Manager'
    ],
    'UX Designer': [
      'UX Designer',
      'UI Designer',
      'Product Designer',
      'User Experience Designer',
      'Digital Designer'
    ],
    'DevOps Engineer': [
      'DevOps Engineer',
      'Site Reliability Engineer',
      'Cloud Engineer',
      'Infrastructure Engineer',
      'Platform Engineer'
    ]
  };
  
  const variations = roleVariations[role] || [role];
  
  variations.forEach((variation, index) => {
    const matchingSkills = getMatchingSkills(skills, variation);
    const matchScore = calculateMatchScore(matchingSkills, skills.length);
    
    matches.push({
      title: `${level} ${variation}`,
      level: level,
      keywords: matchingSkills.slice(0, 6),
      linkedinUrl: generateLinkedInURL(`${level} ${variation}`),
      matchScore: Math.max(matchScore - (index * 5), 60) // Decrease score for variations
    });
  });
  
  return matches;
};

const generateSkillBasedMatches = (skills: string[], level: string): JobMatch[] => {
  const matches: JobMatch[] = [];
  
  // Tech stack specific roles
  const techStacks = {
    'React Developer': ['react', 'javascript', 'html', 'css', 'node'],
    'Python Developer': ['python', 'django', 'flask', 'fastapi', 'sql'],
    'Java Developer': ['java', 'spring', 'hibernate', 'maven', 'sql'],
    'Cloud Engineer': ['aws', 'azure', 'gcp', 'docker', 'kubernetes'],
    'Machine Learning Engineer': ['python', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas'],
    'Mobile Developer': ['react native', 'flutter', 'swift', 'kotlin', 'mobile'],
  };
  
  Object.entries(techStacks).forEach(([title, requiredSkills]) => {
    const matchingSkills = requiredSkills.filter(skill => 
      skills.some(userSkill => userSkill.includes(skill))
    );
    
    if (matchingSkills.length >= 2) {
      const matchScore = calculateMatchScore(matchingSkills, requiredSkills.length);
      matches.push({
        title: `${level} ${title}`,
        level: level,
        keywords: matchingSkills,
        linkedinUrl: generateLinkedInURL(`${level} ${title}`),
        matchScore: matchScore
      });
    }
  });
  
  return matches;
};

const getMatchingSkills = (userSkills: string[], role: string): string[] => {
  const roleSkillsMap: { [key: string]: string[] } = {
    'Software Developer': ['JavaScript', 'Python', 'React', 'Node.js', 'Git', 'HTML', 'CSS'],
    'Data Scientist': ['Python', 'SQL', 'Machine Learning', 'Pandas', 'Statistics', 'Tableau'],
    'Product Manager': ['Analytics', 'Agile', 'Roadmap', 'Stakeholder Management', 'User Research'],
    'UX Designer': ['Figma', 'Sketch', 'Prototyping', 'User Research', 'Design Systems'],
    'DevOps Engineer': ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Linux'],
  };
  
  const roleSkills = roleSkillsMap[role] || ['JavaScript', 'Python', 'SQL', 'Git'];
  
  return roleSkills.filter(skill => 
    userSkills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
  );
};

const calculateMatchScore = (matchingSkills: string[], totalRequiredSkills: number): number => {
  const baseScore = (matchingSkills.length / Math.max(totalRequiredSkills, 1)) * 100;
  const randomVariation = Math.random() * 10 - 5; // Add some variation
  return Math.min(Math.max(Math.round(baseScore + randomVariation), 50), 95);
};

const generateLinkedInURL = (jobTitle: string): string => {
  const encodedTitle = encodeURIComponent(jobTitle);
  return `https://www.linkedin.com/jobs/search/?keywords=${encodedTitle}`;
};
