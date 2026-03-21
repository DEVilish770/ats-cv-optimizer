"use client";

import { useRouter } from "next/navigation";
import CVUploader from "@/components/CVUploader";

export default function UploadPage() {
  const router = useRouter();

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
          router.push(`/jobs?cvId=${cv.id}`);
        }}
      />
    </div>
  );
}
