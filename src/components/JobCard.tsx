"use client";

import Link from "next/link";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  source: string;
  postedAt: string;
  relevanceScore?: number;
}

interface JobCardProps {
  job: Job;
}

function formatSalary(min?: number, max?: number, currency?: string) {
  if (!min && !max) return null;
  const curr = currency || "USD";
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: curr,
      maximumFractionDigits: 0,
    }).format(n);
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

const sourceLabels: Record<string, string> = {
  adzuna: "Adzuna",
  remotive: "Remotive",
  findwork: "Findwork",
  themuse: "The Muse",
};

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15";
  if (score >= 60) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/15";
  return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/15";
}

export default function JobCard({ job }: JobCardProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);

  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="card-border group bg-card p-4 transition-all duration-200 hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-foreground transition-colors group-hover:text-muted-foreground">
              {job.title}
            </h3>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>
          {job.relevanceScore !== undefined && (
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${scoreColor(job.relevanceScore)}`}>
              {job.relevanceScore}% match
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>{job.location}</span>
          <span>&middot;</span>
          <span>{new Date(job.postedAt).toLocaleDateString()}</span>
        </div>

        {salary && (
          <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">{salary}</p>
        )}

        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {job.description}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
            {sourceLabels[job.source] || job.source}
          </span>
          <span className="text-xs font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100">
            View Details &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
