import { prisma } from "@/lib/prisma";
import { generateATSPdf } from "@/lib/pdf-generator";
import type { CVStructured } from "@/types";

export const maxDuration = 30;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cvVersion = await prisma.cVVersion.findUnique({
      where: { id },
    });

    if (!cvVersion) {
      return Response.json(
        { error: "CV version not found" },
        { status: 404 }
      );
    }

    const optimizedData = cvVersion.optimizedData as unknown as CVStructured;
    const pdfBuffer = await generateATSPdf(optimizedData);

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="optimized-cv.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate PDF";
    return Response.json({ error: message }, { status: 500 });
  }
}
