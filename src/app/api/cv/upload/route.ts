import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processCV } from "@/lib/cv-parser";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        userId: session.user.id,
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
    return Response.json(
      { error: "Failed to process CV" },
      { status: 500 }
    );
  }
}
