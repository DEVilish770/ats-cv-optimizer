import { prisma } from "@/lib/prisma";
import { searchJobsForCV, searchAdzunaJobs } from "@/lib/job-search";

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
      searchResults = await searchAdzunaJobs(q, location);
    } else {
      // No cvId or query — find the latest CV for this session
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

    // Upsert jobs into the database and preserve relevance scores
    const jobs = await Promise.all(
      searchResults.map(async (job) => {
        const dbJob = await prisma.job.upsert({
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
        });
        return {
          ...dbJob,
          relevanceScore: (job as unknown as { relevanceScore?: number }).relevanceScore,
        };
      })
    );

    console.log(`[Search] Returning ${jobs.length} jobs`);
    return Response.json({ jobs, count: jobs.length });
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
