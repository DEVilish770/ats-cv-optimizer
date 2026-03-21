import { prisma } from "@/lib/prisma";
import { analyzeJobRequirements } from "@/lib/claude";

export const maxDuration = 30;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try by DB id first, then by externalId
    let job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      job = await prisma.job.findFirst({
        where: { externalId: id },
      });
    }

    if (!job) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    // Analyze requirements if not already done
    if (!job.requirements) {
      try {
        const requirements = await analyzeJobRequirements(job.description);
        job = await prisma.job.update({
          where: { id: job.id },
          data: {
            requirements: JSON.parse(JSON.stringify(requirements)),
          },
        });
      } catch (err) {
        console.error("Failed to analyze requirements:", err);
        // Continue without requirements — don't block the response
      }
    }

    // Wrap in { job: ... } to match what the client expects
    return Response.json({ job });
  } catch (error) {
    console.error("Job detail error:", error);
    return Response.json(
      { error: "Failed to fetch job details" },
      { status: 500 }
    );
  }
}
