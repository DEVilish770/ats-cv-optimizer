import type { JobSearchResult } from "@/types";

// ─── Adzuna ────────────────────────────────────────────────────────────────────

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
    console.warn("[Adzuna] API credentials not configured, skipping");
    return [];
  }

  if (!query.trim()) return [];

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
    return [];
  }

  const data: AdzunaResponse = await response.json();

  console.log(`[Adzuna] Found ${data.results?.length || 0} results (total: ${data.count})`);

  if (!data.results || data.results.length === 0) return [];

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

// ─── Remotive (remote jobs, no auth required) ──────────────────────────────────

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  category: string;
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  description: string;
}

interface RemotiveResponse {
  jobs: RemotiveJob[];
}

export async function searchRemotiveJobs(
  query: string
): Promise<JobSearchResult[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    search: query.trim(),
    limit: "20",
  });

  const url = `https://remotive.com/api/remote-jobs?${params}`;
  console.log(`[Remotive] Searching: query="${query.trim()}"`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`[Remotive] API error ${response.status}`);
      return [];
    }

    const data: RemotiveResponse = await response.json();
    console.log(`[Remotive] Found ${data.jobs?.length || 0} results`);

    if (!data.jobs || data.jobs.length === 0) return [];

    return data.jobs.map((job) => ({
      id: "",
      externalId: `remotive-${job.id}`,
      source: "remotive",
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || "Remote",
      jobType: job.job_type?.replace("_", " ") || undefined,
      description: job.description.replace(/<[^>]*>/g, " ").slice(0, 2000),
      url: job.url,
      postedAt: job.publication_date,
    }));
  } catch (err) {
    console.error("[Remotive] Fetch error:", err);
    return [];
  }
}

// ─── Findwork.dev (tech jobs, free API key) ────────────────────────────────────

interface FindworkJob {
  id: number;
  role: string;
  company_name: string;
  company_num_employees: string | null;
  employment_type: string | null;
  location: string;
  remote: boolean;
  logo: string | null;
  url: string;
  text: string;
  date_posted: string;
  keywords: string[];
  source: string;
}

interface FindworkResponse {
  results: FindworkJob[];
  count: number;
}

export async function searchFindworkJobs(
  query: string,
  location?: string
): Promise<JobSearchResult[]> {
  const apiKey = process.env.FINDWORK_API_KEY;

  if (!apiKey) {
    console.warn("[Findwork] API key not configured, skipping");
    return [];
  }

  if (!query.trim()) return [];

  const params = new URLSearchParams({
    search: query.trim(),
  });

  if (location) {
    params.set("location", location);
  }

  const url = `https://findwork.dev/api/jobs/?${params}`;
  console.log(`[Findwork] Searching: query="${query.trim()}"`);

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Token ${apiKey}` },
    });

    if (!response.ok) {
      console.error(`[Findwork] API error ${response.status}`);
      return [];
    }

    const data: FindworkResponse = await response.json();
    console.log(`[Findwork] Found ${data.results?.length || 0} results`);

    if (!data.results || data.results.length === 0) return [];

    return data.results.map((job) => ({
      id: "",
      externalId: `findwork-${job.id}`,
      source: "findwork",
      title: job.role,
      company: job.company_name,
      location: job.remote ? `${job.location || "Remote"} (Remote)` : job.location,
      jobType: job.employment_type || undefined,
      description: job.text.replace(/<[^>]*>/g, " ").slice(0, 2000),
      url: job.url,
      postedAt: job.date_posted,
    }));
  } catch (err) {
    console.error("[Findwork] Fetch error:", err);
    return [];
  }
}

// ─── The Muse (broad company listings, free tier) ──────────────────────────────

interface MuseJob {
  id: number;
  name: string;
  company: { name: string };
  locations: { name: string }[];
  levels: { name: string }[];
  categories: { name: string }[];
  refs: { landing_page: string };
  contents: string;
  publication_date: string;
  type: string;
}

interface MuseResponse {
  results: MuseJob[];
  page: number;
  page_count: number;
}

export async function searchMuseJobs(
  query: string,
  location?: string
): Promise<JobSearchResult[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    page: "0",
  });

  // The Muse doesn't have a direct keyword search, so we use category matching
  // and filter results client-side
  if (location) {
    params.set("location", location);
  }

  const url = `https://www.themuse.com/api/public/jobs?${params}`;
  console.log(`[TheMuse] Searching with location filter`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`[TheMuse] API error ${response.status}`);
      return [];
    }

    const data: MuseResponse = await response.json();
    console.log(`[TheMuse] Found ${data.results?.length || 0} results`);

    if (!data.results || data.results.length === 0) return [];

    // Filter results by query keywords since The Muse doesn't support text search
    const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const filtered = data.results.filter((job) => {
      const text = `${job.name} ${job.contents}`.toLowerCase();
      return queryWords.some((word) => text.includes(word));
    });

    return filtered.slice(0, 15).map((job) => ({
      id: "",
      externalId: `muse-${job.id}`,
      source: "themuse",
      title: job.name,
      company: job.company.name,
      location: job.locations.map((l) => l.name).join(", ") || undefined,
      jobType: job.type || undefined,
      description: job.contents.replace(/<[^>]*>/g, " ").slice(0, 2000),
      url: job.refs.landing_page,
      postedAt: job.publication_date,
    }));
  } catch (err) {
    console.error("[TheMuse] Fetch error:", err);
    return [];
  }
}

// ─── Aggregated Search ─────────────────────────────────────────────────────────

/** Search all configured job sources in parallel and merge results */
async function searchAllSources(
  query: string,
  location?: string
): Promise<JobSearchResult[]> {
  const searches = [
    searchAdzunaJobs(query, location, 1, 20),
    searchRemotiveJobs(query),
    searchFindworkJobs(query, location),
    searchMuseJobs(query, location),
  ];

  const results = await Promise.allSettled(searches);

  const allJobs: JobSearchResult[] = [];
  const sourceNames = ["Adzuna", "Remotive", "Findwork", "TheMuse"];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled") {
      console.log(`[Aggregator] ${sourceNames[i]}: ${result.value.length} jobs`);
      allJobs.push(...result.value);
    } else {
      console.error(`[Aggregator] ${sourceNames[i]} failed:`, result.reason);
    }
  }

  // Deduplicate by normalized title + company
  const seen = new Set<string>();
  return allJobs.filter((job) => {
    const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function searchJobsForCV(
  targetRole: string,
  targetSkills: string[],
  location?: string
): Promise<JobSearchResult[]> {
  const skillsQuery = targetSkills.slice(0, 3).join(" ");
  const query = `${targetRole} ${skillsQuery}`.trim();

  if (!query) {
    throw new Error("No target role or skills found in CV to search for jobs");
  }

  console.log(`[JobSearch] CV query: "${query}"`);

  let results = await searchAllSources(query, location);

  // If combined query returns nothing, try just the target role
  if (results.length === 0 && targetRole) {
    console.log(`[JobSearch] No results, trying role only: "${targetRole}"`);
    results = await searchAllSources(targetRole, location);
  }

  // If still nothing, try individual skills
  if (results.length === 0 && targetSkills.length > 0) {
    console.log(`[JobSearch] No results, trying first skill: "${targetSkills[0]}"`);
    results = await searchAllSources(targetSkills[0], location);
  }

  // Score relevance based on keyword overlap
  const scoredResults = results.map((job) => {
    const descLower = job.description.toLowerCase();
    const titleLower = job.title.toLowerCase();
    let score = 0;

    if (targetRole) {
      const roleWords = targetRole.toLowerCase().split(" ");
      for (const word of roleWords) {
        if (word.length > 2 && titleLower.includes(word)) score += 10;
      }
    }

    for (const skill of targetSkills) {
      if (descLower.includes(skill.toLowerCase())) score += 5;
    }

    return { ...job, relevanceScore: score };
  });

  return scoredResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
}
