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

    // Map structured data to the format the client expects
    const s = structured as unknown as Record<string, unknown>;
    const experience = (s.experience as Array<Record<string, unknown>>) || [];
    const education = (s.education as Array<Record<string, unknown>>) || [];

    return Response.json(
      {
        cv: {
          id: cv.id,
          targetRole: cv.targetRole,
          sections: {
            contactInfo: s.contact || {},
            summary: s.summary || "",
            experience: experience.map((exp) => ({
              title: exp.title || "",
              company: exp.company || "",
              period: `${exp.startDate || ""} - ${exp.endDate || "Present"}`,
              description: Array.isArray(exp.bullets)
                ? (exp.bullets as string[]).join(". ")
                : exp.description || "",
            })),
            education: education.map((edu) => ({
              degree: edu.degree || "",
              institution: edu.institution || "",
              year: edu.graduationDate || edu.year || "",
            })),
            skills: (s.skills as string[]) || [],
          },
        },
      },
      { status: 201 }
    );
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
