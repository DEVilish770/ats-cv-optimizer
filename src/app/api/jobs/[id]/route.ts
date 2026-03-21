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
      // Fallback: try looking up by externalId
      job = await prisma.job.findFirst({
        where: { externalId: id },
      });
    }

    if (!job) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    // Analyze requirements if not already done
    if (!job.requirements) {
      const requirements = await analyzeJobRequirements(job.description);

      const updatedJob = await prisma.job.update({
        where: { id },
        data: {
          requirements: JSON.parse(JSON.stringify(requirements)),
        },
      });

      return Response.json(updatedJob);
    }

    return Response.json(job);
  } catch (error) {
    console.error("Job detail error:", error);
    return Response.json(
      { error: "Failed to fetch job details" },
      { status: 500 }
    );
  }
}
