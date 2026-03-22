"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/FadeIn";
import GeometricLoader from "@/components/GeometricLoader";
import { apiFetch } from "@/lib/session";

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  status: "optimized" | "applied" | "interviewing" | "offered" | "rejected";
  date: string;
  atsScore?: number;
}

const statusConfig: Record<
  Application["status"],
  { label: string; className: string }
> = {
  optimized: {
    label: "Optimized",
    className: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  },
  applied: {
    label: "Applied",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  },
  interviewing: {
    label: "Interviewing",
    className: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  },
  offered: {
    label: "Offered",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  },
  rejected: {
    label: "Rejected",
    className: "border-red-500/20 bg-red-500/10 text-red-400",
  },
};

export default function HistoryPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await apiFetch("/api/applications");
        if (!res.ok) throw new Error("Failed to load history");
        const data = await res.json();
        setApplications(data.applications || []);
      } catch {
        setError("Failed to load application history.");
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <GeometricLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20">
        <p className="mb-4 text-sm text-red-400">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">
          Application History
        </h1>
        <p className="mt-2 text-sm text-[#7a7a92]">
          Track your job applications
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <div className="mb-4 rounded-full bg-white/[0.04] p-4">
            <Clock className="h-8 w-8 text-[#3a3a4a]" />
          </div>
          <p className="text-sm text-[#5a5a70]">
            No applications yet. Start by optimizing your CV for a job.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app, i) => {
            const status = statusConfig[app.status];
            return (
              <FadeIn key={app.id} delay={i * 60}>
                <div className="card-border bg-[#0a0a0a] p-4 transition-all duration-300 hover:bg-[#0f0f0f]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-white">
                        {app.jobTitle}
                      </h3>
                      <p className="text-sm text-[#7a7a92]">{app.company}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 ${status.className}`}
                    >
                      {status.label}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-[#4a4a5e]">
                    <span>
                      {new Date(app.date).toLocaleDateString()}
                    </span>
                    {app.atsScore !== undefined && (
                      <span className="font-medium text-[#c9a55c]">
                        ATS: {app.atsScore}%
                      </span>
                    )}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      )}
    </div>
  );
}
