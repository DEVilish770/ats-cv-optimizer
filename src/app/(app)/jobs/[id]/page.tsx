"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import OptimizeFlow from "@/components/OptimizeFlow";
import {
  MapPin,
  Calendar,
  Building2,
  DollarSign,
  Loader2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/session";

interface JobDetail {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  source: string;
  sourceUrl?: string;
  postedAt: string;
  relevanceScore?: number;
  analysis?: {
    requiredSkills: string[];
    preferredSkills: string[];
    atsKeywords: string[];
  };
}

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showOptimize, setShowOptimize] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await apiFetch(`/api/jobs/${jobId}`);
        if (!res.ok) throw new Error("Job not found");
        const data = await res.json();
        setJob(data.job);
      } catch {
        setError("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#c9a55c]" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20">
        <p className="mb-4 text-sm text-red-400">{error || "Job not found"}</p>
        <Link href="/jobs">
          <Button
            variant="outline"
            className="border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
          >
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  if (showOptimize) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <button
          onClick={() => setShowOptimize(false)}
          className="mb-4 flex items-center gap-1 text-sm text-[#5a5a70] hover:text-[#c9a55c] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to job
        </button>
        <OptimizeFlow jobId={job.id} />
      </div>
    );
  }

  const salary =
    job.salaryMin || job.salaryMax
      ? [job.salaryMin, job.salaryMax]
          .filter(Boolean)
          .map((n) =>
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: job.salaryCurrency || "USD",
              maximumFractionDigits: 0,
            }).format(n!)
          )
          .join(" - ")
      : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link
        href="/jobs"
        className="mb-6 flex items-center gap-1 text-sm text-[#5a5a70] hover:text-[#c9a55c] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-white">
          {job.title}
        </h1>
        <div className="mt-3 space-y-2 text-sm text-[#7a7a92]">
          <p className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#5a5a70]" />
            {job.company}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#5a5a70]" />
            {job.location}
          </p>
          {salary && (
            <p className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500/60" />
              <span className="text-emerald-400">{salary}</span>
            </p>
          )}
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#5a5a70]" />
            Posted {new Date(job.postedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-3">
          <Badge
            variant="outline"
            className="border-white/[0.06] bg-white/[0.03] text-[#7a7a92]"
          >
            {job.source}
          </Badge>
        </div>
      </div>

      {/* Analysis */}
      {job.analysis && (
        <div className="mb-6 space-y-3">
          {job.analysis.requiredSkills.length > 0 && (
            <div className="gradient-border rounded-xl bg-[#101118] p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#c9a55c]">
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.analysis.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1 text-xs text-[#c8c8d4]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.analysis.preferredSkills.length > 0 && (
            <div className="gradient-border rounded-xl bg-[#101118] p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-blue-400">
                Preferred Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.analysis.preferredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-blue-500/10 bg-blue-500/8 px-3 py-1 text-xs text-blue-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.analysis.atsKeywords.length > 0 && (
            <div className="gradient-border rounded-xl bg-[#101118] p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-400">
                ATS Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.analysis.atsKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full border border-amber-500/10 bg-amber-500/8 px-3 py-1 text-xs text-amber-300"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      <div className="gradient-border mb-6 rounded-xl bg-[#101118] p-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#5a5a70]">
          Job Description
        </h3>
        <div className="whitespace-pre-line text-sm leading-relaxed text-[#9a9ab0]">
          {job.description}
        </div>
      </div>

      {/* Actions */}
      <Button
        className="group h-12 w-full rounded-xl bg-[#c9a55c] text-base font-semibold text-[#0a0b10] transition-all hover:bg-[#d4b36a] hover:shadow-[0_0_30px_-5px_rgba(201,165,92,0.4)]"
        onClick={() => setShowOptimize(true)}
      >
        <Sparkles className="mr-2 h-5 w-5" />
        Optimize &amp; Apply
      </Button>
    </div>
  );
}
