import { prisma } from "@/lib/prisma";
import { analyzeJobRequirements, optimizeCV } from "@/lib/claude";
import type { CVStructured, JobRequirements } from "@/types";

export const maxDuration = 60;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const sessionId = request.headers.get("x-session-id") || "anonymous";

    // Find the session's latest CV automatically
    const cv = await prisma.cV.findFirst({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
    });

    if (!cv) {
      return Response.json(
        { error: "No CV found. Please upload your CV first." },
        { status: 404 }
      );
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

    // Create CVVersion
    const cvVersion = await prisma.cVVersion.create({
      data: {
        cvId: cv.id,
        jobId,
        optimizedData: JSON.parse(
          JSON.stringify(optimizationResult.optimizedData)
        ),
        diffData: JSON.parse(JSON.stringify(optimizationResult.diffData)),
        atsScore: optimizationResult.atsScore,
      },
    });

    // Upsert Application record (unique on sessionId+jobId, so re-optimizing works)
    await prisma.application.upsert({
      where: {
        sessionId_jobId: { sessionId, jobId },
      },
      update: {
        cvVersionId: cvVersion.id,
        status: "optimized",
      },
      create: {
        sessionId,
        jobId,
        cvVersionId: cvVersion.id,
        status: "optimized",
      },
    });

    // Transform diffData to match what the client expects
    const nameCounts: Record<string, number> = {};
    const diff = (optimizationResult.diffData || []).map(
      (d: {
        section: string;
        original: string;
        optimized: string;
        changes: string[];
      }) => {
        // Deduplicate names: "experience" → "experience", "experience (2)", etc.
        const base = d.section;
        nameCounts[base] = (nameCounts[base] || 0) + 1;
        const name =
          nameCounts[base] === 1 ? base : `${base} (${nameCounts[base]})`;

        // Build changes from actual text, not change descriptions
        const changes: Array<{
          type: "added" | "removed" | "unchanged";
          value: string;
        }> = [];
        if (d.original) {
          changes.push({ type: "removed", value: d.original });
        }
        if (d.optimized) {
          changes.push({ type: "added", value: d.optimized });
        }

        return {
          name,
          original: d.original || "(no content)",
          optimized: d.optimized,
          changes,
        };
      }
    );

    // PDF is generated on-demand via /api/cv-version/[id]/pdf
    const pdfUrl = `/api/cv-version/${cvVersion.id}/pdf`;

    return Response.json({
      atsScore: optimizationResult.atsScore,
      matchedKeywords: optimizationResult.matchedKeywords,
      missingKeywords: optimizationResult.missingKeywords,
      diff,
      pdfUrl,
      applyUrl: job.url,
    });
  } catch (error) {
    console.error("CV optimization error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to optimize CV";
    return Response.json({ error: message }, { status: 500 });
  }
}
