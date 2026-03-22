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
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
  },
  {
    id: "photo",
    icon: ImageIcon,
    title: "Photo",
    description: "Upload a photo or screenshot of your CV",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
  },
  {
    id: "pdf",
    icon: FileText,
    title: "PDF",
    description: "Upload your CV as a PDF document",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
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
        <GeometricLoader size="lg" />
        <p className="mt-6 text-lg font-medium text-white">
          {state === "uploading" ? "Uploading your CV..." : "Analyzing your CV with AI..."}
        </p>
        <p className="mt-2 text-sm text-[#5a5a70]">
          {state === "uploading"
            ? "Sending your document securely"
            : "Extracting skills, experience, and education..."}
        </p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-2 text-lg font-medium text-white">Upload Failed</p>
        <p className="mb-6 text-sm text-[#7a7a92]">{error}</p>
        <Button
          onClick={() => setState("idle")}
          variant="outline"
          className="border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
        >
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
          className="card-border group w-full cursor-pointer bg-[#0a0a0a] p-5 text-left transition-all duration-300 hover:bg-[#0f0f0f]"
          onClick={() => {
            if (opt.id === "camera") setShowCamera(true);
            else if (opt.id === "photo") photoInputRef.current?.click();
            else pdfInputRef.current?.click();
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${opt.iconBg}`}
            >
              <opt.icon className={`h-6 w-6 ${opt.iconColor}`} />
            </div>
            <div>
              <h3 className="font-semibold text-white">{opt.title}</h3>
              <p className="text-sm text-[#7a7a92]">{opt.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
