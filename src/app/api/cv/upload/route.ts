import { prisma } from "@/lib/prisma";
import { processCV } from "@/lib/cv-parser";

export async function POST(request: Request) {
  try {
    const sessionId = request.headers.get("x-session-id") || "anonymous";

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as "pdf" | "photo" | "camera" | null;

    if (!file || !type) {
      return Response.json(
        { error: "File and type are required" },
        { status: 400 }
      );
    }

    if (!["pdf", "photo", "camera"].includes(type)) {
      return Response.json(
        { error: "Type must be pdf, photo, or camera" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { rawText, structured, targetRole, targetSkills } = await processCV(
      buffer,
      type
    );

    const cv = await prisma.cV.create({
      data: {
        sessionId,
        originalFileUrl: "local://uploaded",
        originalType: type,
        rawText,
        structured: JSON.parse(JSON.stringify(structured)),
        targetRole,
        targetSkills,
      },
    });

    return Response.json(cv, { status: 201 });
  } catch (error) {
    console.error("CV upload error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process CV";
    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}
