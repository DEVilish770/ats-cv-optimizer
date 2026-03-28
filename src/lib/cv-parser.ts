import Anthropic from "@anthropic-ai/sdk";
import { parseCV } from "./claude";

function getClient() {
  return new Anthropic();
}

/** Retry wrapper for transient Claude API errors (429, 529) */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      const isRetryable = status === 429 || status === 529;
      if (!isRetryable || attempt === maxRetries) {
        if (status === 529) throw new Error("AI service is temporarily overloaded. Please try again in a moment.");
        if (status === 429) throw new Error("Rate limit reached. Please wait a moment and try again.");
        throw err;
      }
      await new Promise((r) => setTimeout(r, 2000 * Math.pow(2, attempt)));
    }
  }
  throw new Error("Unexpected retry exhaustion");
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const base64 = buffer.toString("base64");
  const response = await withRetry(() => getClient().messages.create({
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
  }));

  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function extractTextFromImage(base64Image: string): Promise<string> {
  const response = await withRetry(() => getClient().messages.create({
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
  }));

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

  const parsed = await parseCV(rawText);

  return {
    rawText,
    ...parsed,
  };
}
