"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, FileText } from "lucide-react";
import CameraCapture from "@/components/CameraCapture";
import GeometricLoader from "@/components/GeometricLoader";
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

const uploadOptions = [
  {
    id: "camera",
    icon: Camera,
    title: "Camera",
    description: "Take a photo of your printed CV",
  },
  {
    id: "photo",
    icon: ImageIcon,
    title: "Photo",
    description: "Upload a photo or screenshot of your CV",
  },
  {
    id: "pdf",
    icon: FileText,
    title: "PDF",
    description: "Upload your CV as a PDF document",
  },
];

export default function CVUploader({ onUploadComplete }: CVUploaderProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [, setParsedCV] = useState<ParsedCV | null>(null);
  const [error, setError] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File, uploadType?: "pdf" | "photo" | "camera") {
    setState("uploading");
    setError("");

    try {
      const type = uploadType || (file.type === "application/pdf" ? "pdf" : "photo");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await apiFetch("/api/cv/upload", {
        method: "POST",
        body: formData,
      });

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
    if (file) uploadFile(file);
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
      <div className="flex flex-col items-center justify-center py-20">
        <GeometricLoader size="lg" showTips />
        <p className="mt-6 text-lg font-medium text-foreground">
          {state === "uploading" ? "Uploading your CV..." : "Analyzing your CV with AI..."}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {state === "uploading"
            ? "Sending your document securely"
            : "Extracting skills, experience, and education"}
        </p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-2 text-lg font-medium text-foreground">Upload Failed</p>
        <p className="mb-6 text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => setState("idle")} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
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

      {uploadOptions.map((opt) => (
        <button
          key={opt.id}
          className="card-border group flex w-full items-center gap-4 bg-card p-5 text-left transition-all duration-200 hover:shadow-md"
          onClick={() => {
            if (opt.id === "camera") setShowCamera(true);
            else if (opt.id === "photo") photoInputRef.current?.click();
            else pdfInputRef.current?.click();
          }}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary">
            <opt.icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{opt.title}</h3>
            <p className="text-sm text-muted-foreground">{opt.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
