import { v4 as uuidv4 } from "uuid";

export function getSessionId(): string {
  if (typeof window === "undefined") return "anonymous";
  let sessionId = localStorage.getItem("ats-session-id");
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem("ats-session-id", sessionId);
  }
  return sessionId;
}

export async function apiFetch(url: string, options: RequestInit = {}) {
  const sessionId = getSessionId();
  const headers = new Headers(options.headers);
  headers.set("x-session-id", sessionId);
  return fetch(url, { ...options, headers });
}
