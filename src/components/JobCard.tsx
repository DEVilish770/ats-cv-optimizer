"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-400";
}

export default function JobCard({ job }: JobCardProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);

  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="transition-shadow hover:shadow-md active:scale-[0.99]">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-slate-900">
                {job.title}
              </h3>
              <p className="text-sm text-slate-600">{job.company}</p>
            </div>
            {job.relevanceScore !== undefined && (
              <div className="flex shrink-0 items-center gap-1.5">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${scoreColor(job.relevanceScore)}`}
                />
                <span className="text-xs font-medium text-slate-500">
                  {job.relevanceScore}%
                </span>
              </div>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
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
            <p className="mt-2 text-sm font-medium text-green-700">{salary}</p>
          )}

          <p className="mt-2 line-clamp-2 text-sm text-slate-500">
            {job.description}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {job.source}
            </Badge>
            <span className="flex items-center gap-1 text-xs font-medium text-blue-600">
              View Details
              <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
