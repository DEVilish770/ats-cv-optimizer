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

    return Response.json(applications);
  } catch (error) {
    console.error("Applications list error:", error);
    return Response.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
