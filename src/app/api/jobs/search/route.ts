import { prisma } from "@/lib/prisma";
import { searchJobsForCV, searchAdzunaJobs, searchRemotiveJobs, searchFindworkJobs, searchMuseJobs } from "@/lib/job-search";

export const maxDuration = 30; // Allow up to 30 seconds on Vercel

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cvId = searchParams.get("cvId");
    const q = searchParams.get("q");
    const location = searchParams.get("location") || undefined;

    const sessionId = request.headers.get("x-session-id") || "anonymous";
    let searchResults;

    if (cvId) {
      const cv = await prisma.cV.findUnique({
        where: { id: cvId },
      });

      if (!cv) {
        return Response.json({ error: "CV not found", jobs: [] }, { status: 404 });
      }

      console.log(`[Search] CV found: targetRole="${cv.targetRole}", skills=${cv.targetSkills?.length || 0}`);

      searchResults = await searchJobsForCV(
        cv.targetRole || "",
        cv.targetSkills || [],
        location
      );
    } else if (q) {
      // Search all sources in parallel for manual queries
      const [adzuna, remotive, findwork, muse] = await Promise.allSettled([
        searchAdzunaJobs(q, location),
        searchRemotiveJobs(q),
        searchFindworkJobs(q, location),
        searchMuseJobs(q, location),
      ]);
      searchResults = [
        ...(adzuna.status === "fulfilled" ? adzuna.value : []),
        ...(remotive.status === "fulfilled" ? remotive.value : []),
        ...(findwork.status === "fulfilled" ? findwork.value : []),
        ...(muse.status === "fulfilled" ? muse.value : []),
      ];
    } else {
      const latestCv = await prisma.cV.findFirst({
        where: { sessionId },
        orderBy: { createdAt: "desc" },
      });

      if (!latestCv) {
        return Response.json({ error: "No CV found", jobs: [] }, { status: 404 });
      }

      console.log(`[Search] Latest CV: targetRole="${latestCv.targetRole}", skills=${latestCv.targetSkills?.length || 0}`);

      searchResults = await searchJobsForCV(
        latestCv.targetRole || "",
        latestCv.targetSkills || [],
        location
      );
    }

    console.log(`[Search] Got ${searchResults.length} results from all sources`);

    if (searchResults.length === 0) {
      return Response.json({ jobs: [], count: 0 });
    }

    // Save all jobs to DB in a single transaction (faster than individual upserts)
    const jobs = await prisma.$transaction(
      searchResults.map((job) =>
        prisma.job.upsert({
          where: {
            externalId_source: {
              externalId: job.externalId,
              source: job.source,
            },
          },
          update: {
            title: job.title,
            company: job.company,
            location: job.location || null,
            jobType: job.jobType || null,
            description: job.description,
            url: job.url,
            salaryMin: job.salaryMin || null,
            salaryMax: job.salaryMax || null,
            postedAt: job.postedAt ? new Date(job.postedAt) : null,
          },
          create: {
            externalId: job.externalId,
            source: job.source,
            title: job.title,
            company: job.company,
            location: job.location || null,
            jobType: job.jobType || null,
            description: job.description,
            url: job.url,
            salaryMin: job.salaryMin || null,
            salaryMax: job.salaryMax || null,
            postedAt: job.postedAt ? new Date(job.postedAt) : null,
          },
        })
      )
    );

    // Add relevance scores from search results
    const jobsWithScores = jobs.map((dbJob, i) => ({
      ...dbJob,
      relevanceScore: (searchResults[i] as unknown as { relevanceScore?: number }).relevanceScore,
    }));

    console.log(`[Search] Returning ${jobsWithScores.length} jobs`);
    return Response.json({ jobs: jobsWithScores, count: jobsWithScores.length });
  } catch (error) {
    console.error("Job search error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to search jobs";
    return Response.json(
      { error: message, jobs: [] },
      { status: 500 }
    );
  }
}
