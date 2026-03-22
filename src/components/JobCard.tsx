"use client";

import Link from "next/link";
import { MapPin, Calendar, ExternalLink } from "lucide-react";

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

function scoreColor(score: number) {
  if (score >= 80) return { bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-400" };
  if (score >= 60) return { bg: "bg-amber-500/15", text: "text-amber-400", dot: "bg-amber-400" };
  return { bg: "bg-red-500/15", text: "text-red-400", dot: "bg-red-400" };
}

export default function JobCard({ job }: JobCardProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);
  const colors = job.relevanceScore !== undefined ? scoreColor(job.relevanceScore) : null;

  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="gradient-border group rounded-xl bg-[#101118] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-12px_rgba(201,165,92,0.1)]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-white group-hover:text-[#c9a55c] transition-colors">
              {job.title}
            </h3>
            <p className="text-sm text-[#7a7a92]">{job.company}</p>
          </div>
          {colors && job.relevanceScore !== undefined && (
            <div className={`flex shrink-0 items-center gap-1.5 rounded-full ${colors.bg} px-2.5 py-1`}>
              <div className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
              <span className={`text-xs font-medium ${colors.text}`}>
                {job.relevanceScore}%
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#5a5a70]">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(job.postedAt).toLocaleDateString()}
          </span>
        </div>

        {salary && (
          <p className="mt-2 text-sm font-medium text-emerald-400">{salary}</p>
        )}

        <p className="mt-2 line-clamp-2 text-sm text-[#5a5a70]">
          {job.description}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-xs text-[#5a5a70]">
            {job.source}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-[#c9a55c] opacity-0 transition-opacity group-hover:opacity-100">
            View Details
            <ExternalLink className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
