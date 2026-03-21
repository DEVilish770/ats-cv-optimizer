import { parseCV } from "./claude";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Dynamic import to avoid issues with server components
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string }>;
  const data = await pdfParse(buffer);
  return data.text;
}

export async function extractTextFromImage(base64Image: string): Promise<string> {
  // Use Claude's vision capability to extract text from images
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: base64Image,
            },
          },
          {
            type: "text",
            text: "Extract ALL text from this CV/resume image. Preserve the structure and formatting as much as possible. Return only the extracted text, nothing else.",
          },
        ],
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function processCV(
  fileBuffer: Buffer,
  fileType: "pdf" | "photo" | "camera"
) {
  let rawText: string;

  if (fileType === "pdf") {
    rawText = await extractTextFromPDF(fileBuffer);
  } else {
    // For photos and camera captures, use Claude Vision OCR
    const base64 = fileBuffer.toString("base64");
    rawText = await extractTextFromImage(base64);
  }

  // Use Claude to structure the raw text
  const parsed = await parseCV(rawText);

  return {
    rawText,
    ...parsed,
  };
}
