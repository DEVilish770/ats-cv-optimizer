import type { JobSearchResult } from "@/types";

interface AdzunaJob {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  created: string;
  category?: { label: string };
  contract_type?: string;
}

interface AdzunaResponse {
  results: AdzunaJob[];
  count: number;
}

export async function searchAdzunaJobs(
  query: string,
  location?: string,
  page: number = 1,
  resultsPerPage: number = 20
): Promise<JobSearchResult[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    throw new Error("Adzuna API credentials not configured");
  }

  if (!query.trim()) {
    throw new Error("Search query is empty");
  }

  const country = "us";
  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: String(resultsPerPage),
    what: query.trim(),
  });

  if (location) {
    params.set("where", location);
  }

  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${params}`;

  console.log(`[Adzuna] Searching: query="${query.trim()}", country=${country}`);

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Adzuna] API error ${response.status}:`, errorText);
    throw new Error(`Adzuna API error: ${response.status} - ${errorText.slice(0, 200)}`);
  }

  const data: AdzunaResponse = await response.json();

  console.log(`[Adzuna] Found ${data.results?.length || 0} results (total: ${data.count})`);

  if (!data.results || data.results.length === 0) {
    return [];
  }

  return data.results.map((job) => ({
    id: "",
    externalId: String(job.id),
    source: "adzuna",
    title: job.title,
    company: job.company.display_name,
    location: job.location.display_name,
    jobType: job.contract_type || undefined,
    description: job.description,
    url: job.redirect_url,
    salaryMin: job.salary_min ? Math.round(job.salary_min) : undefined,
    salaryMax: job.salary_max ? Math.round(job.salary_max) : undefined,
    postedAt: job.created,
  }));
}

export async function searchJobsForCV(
  targetRole: string,
  targetSkills: string[],
  location?: string
): Promise<JobSearchResult[]> {
  // Build a search query from the CV's target role and top skills
  const skillsQuery = targetSkills.slice(0, 3).join(" ");
  const query = `${targetRole} ${skillsQuery}`.trim();

  // If query is still empty, can't search
  if (!query) {
    throw new Error("No target role or skills found in CV to search for jobs");
  }

  console.log(`[JobSearch] CV query: "${query}"`);

  let results = await searchAdzunaJobs(query, location, 1, 30);

  // If combined query returns nothing, try just the target role
  if (results.length === 0 && targetRole) {
    console.log(`[JobSearch] No results, trying role only: "${targetRole}"`);
    results = await searchAdzunaJobs(targetRole, location, 1, 30);
  }

  // If still nothing, try individual skills
  if (results.length === 0 && targetSkills.length > 0) {
    console.log(`[JobSearch] No results, trying first skill: "${targetSkills[0]}"`);
    results = await searchAdzunaJobs(targetSkills[0], location, 1, 30);
  }

  // Score relevance based on keyword overlap
  const scoredResults = results.map((job) => {
    const descLower = job.description.toLowerCase();
    const titleLower = job.title.toLowerCase();
    let score = 0;

    // Check target role match in title
    if (targetRole) {
      const roleWords = targetRole.toLowerCase().split(" ");
      for (const word of roleWords) {
        if (word.length > 2 && titleLower.includes(word)) score += 10;
      }
    }

    // Check skill matches in description
    for (const skill of targetSkills) {
      if (descLower.includes(skill.toLowerCase())) score += 5;
    }

    return { ...job, relevanceScore: score };
  });

  // Sort by relevance score descending
  return scoredResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
}
