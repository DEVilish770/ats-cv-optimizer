"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, FileText, Loader2 } from "lucide-react";
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

const uploadOptions = [
  {
    id: "camera",
    icon: Camera,
    title: "Camera",
    description: "Take a photo of your printed CV",
    gradient: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-400",
    borderGlow: "hover:shadow-[0_0_30px_-8px_rgba(245,158,11,0.15)]",
  },
  {
    id: "photo",
    icon: ImageIcon,
    title: "Photo",
    description: "Upload a photo or screenshot of your CV",
    gradient: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-400",
    borderGlow: "hover:shadow-[0_0_30px_-8px_rgba(52,211,153,0.15)]",
  },
  {
    id: "pdf",
    icon: FileText,
    title: "PDF",
    description: "Upload your CV as a PDF document",
    gradient: "from-blue-500/20 to-indigo-500/10",
    iconColor: "text-blue-400",
    borderGlow: "hover:shadow-[0_0_30px_-8px_rgba(74,125,255,0.15)]",
  },
];

export default function CVUploader({ onUploadComplete }: CVUploaderProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [, setParsedCV] = useState<ParsedCV | null>(null);
  const [error, setError] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File, uploadType?: "pdf" | "photo" | "camera") {
    setState("uploading");
    setProgress(0);
    setError("");

    try {
      const type = uploadType || (file.type === "application/pdf" ? "pdf" : "photo");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

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
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-[#c9a55c]/20 blur-xl animate-pulse" />
          <Loader2 className="relative h-10 w-10 animate-spin text-[#c9a55c]" />
        </div>
        <p className="text-lg font-medium text-white">
          {state === "uploading" ? "Uploading your CV..." : "Analyzing your CV with AI..."}
        </p>
        {state === "uploading" && (
          <div className="mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#c9a55c] to-[#d4b36a] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {state === "parsing" && (
          <p className="mt-2 text-sm text-[#7a7a92]">
            Extracting skills, experience, and education...
          </p>
        )}
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-4 rounded-full bg-red-500/10 p-3">
          <FileText className="h-6 w-6 text-red-400" />
        </div>
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
          className={`gradient-border group w-full cursor-pointer rounded-xl bg-[#101118] p-5 text-left transition-all duration-300 hover:-translate-y-0.5 ${opt.borderGlow}`}
          onClick={() => {
            if (opt.id === "camera") setShowCamera(true);
            else if (opt.id === "photo") photoInputRef.current?.click();
            else pdfInputRef.current?.click();
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${opt.gradient}`}
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
