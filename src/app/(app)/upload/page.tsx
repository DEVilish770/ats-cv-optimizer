"use client";

import { useRouter } from "next/navigation";
import CVUploader from "@/components/CVUploader";

export default function UploadPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-lg px-5 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Upload Your CV
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose how you&apos;d like to upload — we&apos;ll handle the rest
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
