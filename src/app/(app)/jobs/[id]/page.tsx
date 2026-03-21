"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20">
        <p className="mb-4 text-sm text-red-600">
          {error || "Job not found"}
        </p>
        <Link href="/jobs">
          <Button variant="outline">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  if (showOptimize) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <button
          onClick={() => setShowOptimize(false)}
          className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
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
    <div className="mx-auto max-w-lg px-4 py-6">
      <Link
        href="/jobs"
        className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
        <div className="mt-2 space-y-1.5 text-sm text-slate-600">
          <p className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-400" />
            {job.company}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            {job.location}
          </p>
          {salary && (
            <p className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-slate-400" />
              {salary}
            </p>
          )}
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            Posted {new Date(job.postedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-3">
          <Badge variant="secondary">{job.source}</Badge>
        </div>
      </div>

      {/* Analysis */}
      {job.analysis && (
        <div className="mb-6 space-y-4">
          {job.analysis.requiredSkills.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-700">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.analysis.requiredSkills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {job.analysis.preferredSkills.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-700">
                  Preferred Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.analysis.preferredSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="border-blue-200 text-blue-700"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {job.analysis.atsKeywords.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-700">
                  ATS Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.analysis.atsKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-800"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Description */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            Job Description
          </h3>
          <div className="prose prose-sm prose-slate max-w-none whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {job.description}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Button
        className="h-12 w-full bg-blue-600 text-base font-semibold hover:bg-blue-500"
        onClick={() => setShowOptimize(true)}
      >
        <Sparkles className="mr-2 h-5 w-5" />
        Optimize &amp; Apply
      </Button>
    </div>
  );
}
