"use client";

import { useRouter } from "next/navigation";
import CVUploader from "@/components/CVUploader";

export default function UploadPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          Upload Your CV
        </h1>
        <p className="mt-2 text-sm text-[#7a7a92]">
          Choose how you&apos;d like to upload your CV — we&apos;ll handle the rest
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
