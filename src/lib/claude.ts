import Anthropic from "@anthropic-ai/sdk";
import type { CVStructured, JobRequirements, OptimizationResult, SectionDiff } from "@/types";

function getClient() {
  return new Anthropic();
}

export async function parseCV(rawText: string): Promise<{
  structured: CVStructured;
  targetRole: string;
  targetSkills: string[];
}> {
  const response = await getClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Parse the following CV/resume text into structured JSON. Extract all sections accurately.

CV Text:
${rawText}

Return a JSON object with exactly this structure:
{
  "structured": {
    "contact": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "website": "" },
    "summary": "professional summary if present",
    "experience": [{ "title": "", "company": "", "location": "", "startDate": "", "endDate": "", "current": false, "bullets": [""] }],
    "education": [{ "degree": "", "institution": "", "location": "", "graduationDate": "", "gpa": "", "details": [""] }],
    "skills": ["skill1", "skill2"],
    "certifications": ["cert1"],
    "projects": [{ "name": "", "description": "", "technologies": [""] }],
    "languages": ["English"]
  },
  "targetRole": "the most likely job role this person is targeting based on their experience",
  "targetSkills": ["top 10 most relevant skills for job searching"]
}

Return ONLY valid JSON, no markdown formatting.`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned);

  // Ensure targetRole and targetSkills are never empty
  if (!parsed.targetRole && parsed.structured?.experience?.length > 0) {
    // Derive from most recent job title
    parsed.targetRole = parsed.structured.experience[0].title || "Professional";
  }
  if (!parsed.targetRole) {
    parsed.targetRole = "Professional";
  }
  if (!parsed.targetSkills || parsed.targetSkills.length === 0) {
    parsed.targetSkills = parsed.structured?.skills || ["professional"];
  }

  console.log(`[parseCV] targetRole="${parsed.targetRole}", skills=${parsed.targetSkills?.length}`);

  return parsed;
}

export async function analyzeJobRequirements(
  jobDescription: string
): Promise<JobRequirements> {
  const response = await getClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Analyze this job description and extract the ATS-relevant requirements.

Job Description:
${jobDescription}

Return a JSON object with exactly this structure:
{
  "requiredSkills": ["skills that are explicitly required"],
  "preferredSkills": ["skills that are preferred or nice-to-have"],
  "keywords": ["important ATS keywords and phrases from the posting"],
  "experienceLevel": "entry/mid/senior/lead/executive",
  "educationRequirements": "education requirement if specified",
  "certifications": ["any certifications mentioned"]
}

Return ONLY valid JSON, no markdown formatting.`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

export async function optimizeCV(
  cvData: CVStructured,
  jobRequirements: JobRequirements,
  jobDescription: string
): Promise<OptimizationResult> {
  const response = await getClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: `You are an expert ATS optimization specialist. Optimize this CV to maximize its ATS compatibility score for the given job.

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. NEVER invent, fabricate, or add experience, skills, or qualifications that are NOT in the original CV
2. NEVER change job titles, company names, dates, or degrees
3. DO rephrase bullet points to naturally incorporate relevant keywords from the job posting
4. DO reorder bullet points to prioritize the most relevant experience first
5. DO use industry-standard terminology where the candidate has equivalent experience
6. DO optimize the summary/objective to align with the target role
7. DO ensure skills section includes all relevant skills the candidate actually has

ORIGINAL CV DATA:
${JSON.stringify(cvData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

JOB REQUIREMENTS:
${JSON.stringify(jobRequirements, null, 2)}

Return a JSON object with exactly this structure:
{
  "optimizedData": {
    // Same structure as the original CV but with optimized content
    "contact": { ... }, // Keep unchanged
    "summary": "optimized summary",
    "experience": [{ "title": "KEEP ORIGINAL", "company": "KEEP ORIGINAL", "location": "keep", "startDate": "keep", "endDate": "keep", "current": false, "bullets": ["optimized bullet points"] }],
    "education": [{ ... }], // Keep mostly unchanged
    "skills": ["reordered and properly termed skills"],
    "certifications": [...],
    "projects": [...],
    "languages": [...]
  },
  "diffData": [
    {
      "section": "summary",
      "original": "original text",
      "optimized": "optimized text",
      "changes": ["description of what changed and why"]
    }
  ],
  "atsScore": 85,
  "matchedKeywords": ["keywords from job that appear in optimized CV"],
  "missingKeywords": ["keywords from job that couldn't be added without fabrication"]
}

Return ONLY valid JSON, no markdown formatting.`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}
