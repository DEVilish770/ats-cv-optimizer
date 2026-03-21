import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeJobRequirements } from "@/lib/claude";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
    });

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
