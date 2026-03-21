import { prisma } from "@/lib/prisma";
import { searchJobsForCV, searchAdzunaJobs } from "@/lib/job-search";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cvId = searchParams.get("cvId");
    const q = searchParams.get("q");
    const location = searchParams.get("location") || undefined;

    let searchResults;

    if (cvId) {
      const cv = await prisma.cV.findUnique({
        where: { id: cvId },
      });

      if (!cv) {
        return Response.json({ error: "CV not found" }, { status: 404 });
      }

      searchResults = await searchJobsForCV(
        cv.targetRole || "",
        cv.targetSkills,
        location
      );
    } else if (q) {
      searchResults = await searchAdzunaJobs(q, location);
    } else {
      return Response.json(
        { error: "Either cvId or q parameter is required" },
        { status: 400 }
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

    return Response.json({ jobs });
  } catch (error) {
    console.error("Job search error:", error);
    return Response.json(
      { error: "Failed to search jobs" },
      { status: 500 }
    );
  }
}
