import Anthropic from "@anthropic-ai/sdk";
import { parseCV } from "./claude";

function getClient() {
  return new Anthropic();
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Use Claude's native PDF reading — no server-side PDF library needed
  const base64 = buffer.toString("base64");
  const response = await getClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64,
            },
          },
          {
            type: "text",
            text: "Extract ALL text from this CV/resume PDF. Preserve the structure and formatting as much as possible. Return only the extracted text, nothing else.",
          },
        ],
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function extractTextFromImage(base64Image: string): Promise<string> {
  const response = await getClient().messages.create({
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
