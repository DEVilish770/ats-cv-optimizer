import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { applicationId } = await request.json();

    if (!applicationId) {
      return Response.json(
        { error: "applicationId is required" },
        { status: 400 }
      );
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) {
      return Response.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (application.userId !== session.user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: "applied",
        appliedAt: new Date(),
      },
      include: { job: true },
    });

    return Response.json({
      application: updated,
      jobUrl: updated.job.url,
    });
  } catch (error) {
    console.error("Apply error:", error);
    return Response.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}
