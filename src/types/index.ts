// CV structured data types
export interface CVContact {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
}

export interface CVExperience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  bullets: string[];
}

export interface CVEducation {
  degree: string;
  institution: string;
  location?: string;
  graduationDate?: string;
  gpa?: string;
  details?: string[];
}

export interface CVStructured {
  contact: CVContact;
  summary?: string;
  experience: CVExperience[];
  education: CVEducation[];
  skills: string[];
  certifications?: string[];
  projects?: { name: string; description: string; technologies?: string[] }[];
  languages?: string[];
}

// Job analysis types
export interface JobRequirements {
  requiredSkills: string[];
  preferredSkills: string[];
  keywords: string[];
  experienceLevel: string;
  educationRequirements?: string;
  certifications?: string[];
}

// Optimization types
export interface OptimizationResult {
  optimizedData: CVStructured;
  diffData: SectionDiff[];
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
}

export interface SectionDiff {
  section: string;
  original: string;
  optimized: string;
  changes: string[];
}

// Job search types
export interface JobSearchResult {
  id: string;
  externalId: string;
  source: string;
  title: string;
  company: string;
  location?: string;
  jobType?: string;
  description: string;
  url: string;
  salaryMin?: number;
  salaryMax?: number;
  postedAt?: string;
  relevanceScore?: number;
}
