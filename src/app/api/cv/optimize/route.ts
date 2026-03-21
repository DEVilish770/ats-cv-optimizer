import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeJobRequirements, optimizeCV } from "@/lib/claude";
import { generateATSPdf } from "@/lib/pdf-generator";
import type { CVStructured, JobRequirements } from "@/types";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cvId, jobId } = await request.json();

    if (!cvId || !jobId) {
      return Response.json(
        { error: "cvId and jobId are required" },
        { status: 400 }
      );
    }

    // Load CV and verify ownership
    const cv = await prisma.cV.findUnique({
      where: { id: cvId },
    });

    if (!cv) {
      return Response.json({ error: "CV not found" }, { status: 404 });
    }

    if (cv.userId !== session.user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Load job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    // Analyze job requirements if not already done
    let requirements: JobRequirements;
    if (!job.requirements) {
      requirements = await analyzeJobRequirements(job.description);
      await prisma.job.update({
        where: { id: jobId },
        data: { requirements: JSON.parse(JSON.stringify(requirements)) },
      });
    } else {
      requirements = job.requirements as unknown as JobRequirements;
    }

    // Optimize the CV
    const cvData = cv.structured as unknown as CVStructured;
    const optimizationResult = await optimizeCV(
      cvData,
      requirements,
      job.description
    );

    // Generate ATS-friendly PDF
    const pdfBuffer = await generateATSPdf(optimizationResult.optimizedData);
    // Store PDF URL as placeholder (Vercel Blob requires a token)
    const pdfUrl = `local://optimized-cv-${Date.now()}.pdf`;
    void pdfBuffer; // PDF generated but stored as placeholder URL for now

    // Create CVVersion
    const cvVersion = await prisma.cVVersion.create({
      data: {
        cvId,
        jobId,
        optimizedData: JSON.parse(JSON.stringify(optimizationResult.optimizedData)),
        diffData: JSON.parse(JSON.stringify(optimizationResult.diffData)),
        atsScore: optimizationResult.atsScore,
        pdfUrl,
      },
    });

    // Create Application record
    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        jobId,
        cvVersionId: cvVersion.id,
        status: "optimized",
      },
    });

    return Response.json(
      {
        cvVersion,
        application,
        matchedKeywords: optimizationResult.matchedKeywords,
        missingKeywords: optimizationResult.missingKeywords,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CV optimization error:", error);
    return Response.json(
      { error: "Failed to optimize CV" },
      { status: 500 }
    );
  }
}
