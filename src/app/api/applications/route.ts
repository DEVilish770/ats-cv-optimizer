import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const sessionId = request.headers.get("x-session-id") || "anonymous";

    const applications = await prisma.application.findMany({
      where: { sessionId },
      include: {
        job: true,
        cvVersion: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform DB records to match client-expected format
    const transformed = applications.map((app) => ({
      id: app.id,
      jobTitle: app.job?.title || "Unknown Job",
      company: app.job?.company || "Unknown Company",
      status: app.status,
      date: app.createdAt.toISOString(),
      atsScore: app.cvVersion?.atsScore ?? undefined,
    }));

    return Response.json({ applications: transformed });
  } catch (error) {
    console.error("Applications list error:", error);
    return Response.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
