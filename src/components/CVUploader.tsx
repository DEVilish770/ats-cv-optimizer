"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, FileText, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import CameraCapture from "@/components/CameraCapture";
import { apiFetch } from "@/lib/session";

interface ParsedCV {
  id: string;
  targetRole: string;
  sections: {
    contactInfo: Record<string, string>;
    summary: string;
    experience: Array<{
      title: string;
      company: string;
      period: string;
      description: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      year: string;
    }>;
    skills: string[];
  };
}

interface CVUploaderProps {
  onUploadComplete: (cv: ParsedCV) => void;
}

type UploadState = "idle" | "uploading" | "parsing" | "done" | "error";

export default function CVUploader({ onUploadComplete }: CVUploaderProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [parsedCV, setParsedCV] = useState<ParsedCV | null>(null);
  const [error, setError] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File, uploadType?: "pdf" | "photo" | "camera") {
    setState("uploading");
    setProgress(0);
    setError("");

    try {
      // Determine type from file or override
      const type = uploadType || (file.type === "application/pdf" ? "pdf" : "photo");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const res = await apiFetch("/api/cv/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      setState("parsing");

      const data = await res.json();
      setParsedCV(data.cv);
      setState("done");
      onUploadComplete(data.cv);
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }

  function handleCameraCapture(file: File) {
    setShowCamera(false);
    uploadFile(file, "camera");
  }

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  if (state === "uploading" || state === "parsing") {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-600" />
        <p className="text-lg font-medium text-slate-900">
          {state === "uploading" ? "Uploading your CV..." : "Parsing your CV..."}
        </p>
        {state === "uploading" && (
          <div className="mt-4 h-2 w-48 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {state === "parsing" && (
          <p className="mt-2 text-sm text-slate-500">
            Extracting skills, experience, and education...
          </p>
        )}
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 rounded-full bg-red-100 p-3">
          <FileText className="h-6 w-6 text-red-600" />
        </div>
        <p className="mb-2 text-lg font-medium text-slate-900">Upload Failed</p>
        <p className="mb-6 text-sm text-slate-500">{error}</p>
        <Button onClick={() => setState("idle")} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  // "done" state is handled by the parent via onUploadComplete redirect

  // Idle state - show upload options
  return (
    <div className="space-y-4">
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileSelect}
      />

      <Card
        className="cursor-pointer transition-shadow hover:shadow-md active:scale-[0.98]"
        onClick={() => setShowCamera(true)}
      >
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-100">
            <Camera className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Camera</h3>
            <p className="text-sm text-slate-500">
              Take a photo of your printed CV
            </p>
          </div>
        </CardContent>
      </Card>

      <Card
        className="cursor-pointer transition-shadow hover:shadow-md active:scale-[0.98]"
        onClick={() => photoInputRef.current?.click()}
      >
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-green-100">
            <ImageIcon className="h-7 w-7 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Photo</h3>
            <p className="text-sm text-slate-500">
              Upload a photo or screenshot of your CV
            </p>
          </div>
        </CardContent>
      </Card>

      <Card
        className="cursor-pointer transition-shadow hover:shadow-md active:scale-[0.98]"
        onClick={() => pdfInputRef.current?.click()}
      >
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-purple-100">
            <FileText className="h-7 w-7 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">PDF</h3>
            <p className="text-sm text-slate-500">
              Upload your CV as a PDF document
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
