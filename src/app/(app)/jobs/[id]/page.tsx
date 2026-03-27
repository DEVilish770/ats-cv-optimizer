"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FadeIn from "@/components/FadeIn";
import OptimizeFlow from "@/components/OptimizeFlow";
import GeometricLoader from "@/components/GeometricLoader";
import { ArrowLeft } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center py-20">
        <GeometricLoader />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-20">
        <p className="mb-4 text-sm text-destructive">{error || "Job not found"}</p>
        <Link href="/jobs">
          <Button variant="outline">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  if (showOptimize) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-6">
        <button
          onClick={() => setShowOptimize(false)}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
    <div className="mx-auto max-w-2xl px-5 py-6">
      <Link
        href="/jobs"
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      {/* Header */}
      <FadeIn>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">
            {job.title}
          </h1>
          <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <p className="font-medium">{job.company}</p>
            <p>{job.location}</p>
            {salary && (
              <p className="font-medium text-emerald-600 dark:text-emerald-400">{salary}</p>
            )}
            <p className="text-xs">
              Posted {new Date(job.postedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-3">
            <Badge variant="outline">
              {job.source}
            </Badge>
          </div>
        </div>
      </FadeIn>

      {/* Analysis */}
      {job.analysis && (
        <div className="mb-6 space-y-3">
          {job.analysis.requiredSkills.length > 0 && (
            <FadeIn delay={100}>
              <div className="card-border bg-card p-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.analysis.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {job.analysis.preferredSkills.length > 0 && (
            <FadeIn delay={200}>
              <div className="card-border bg-card p-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Preferred Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.analysis.preferredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {job.analysis.atsKeywords.length > 0 && (
            <FadeIn delay={300}>
              <div className="card-border bg-card p-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  ATS Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.analysis.atsKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      )}

      {/* Description */}
      <FadeIn delay={400}>
        <div className="card-border mb-6 bg-card p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Job Description
          </h3>
          <div className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {job.description}
          </div>
        </div>
      </FadeIn>

      {/* Actions */}
      <FadeIn delay={500}>
        <Button
          className="h-12 w-full rounded-xl bg-foreground text-base font-semibold text-background transition-all hover:opacity-90"
          onClick={() => setShowOptimize(true)}
        >
          Optimize &amp; Apply for This Role
        </Button>
      </FadeIn>
    </div>
  );
}
