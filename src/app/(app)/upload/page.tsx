"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import CVUploader from "@/components/CVUploader";
import { ArrowRight } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const [cvId, setCvId] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Upload Your CV</h1>
        <p className="mt-1 text-sm text-slate-500">
          Choose how you&apos;d like to upload your CV
        </p>
      </div>

      <CVUploader
        onUploadComplete={(cv) => {
          setCvId(cv.id);
        }}
      />

      {cvId && (
        <div className="mt-6">
          <Button
            className="h-12 w-full bg-blue-600 text-base font-semibold hover:bg-blue-500"
            onClick={() => router.push(`/jobs?cvId=${cvId}`)}
          >
            Find Matching Jobs
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
