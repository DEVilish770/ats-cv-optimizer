"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
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

const statusConfig: Record<Application["status"], { label: string; className: string }> = {
  optimized: { label: "Optimized", className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400" },
  applied: { label: "Applied", className: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400" },
  interviewing: { label: "Interviewing", className: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400" },
  offered: { label: "Offered", className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400" },
  rejected: { label: "Rejected", className: "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400" },
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
      <div className="flex flex-col items-center justify-center px-5 py-20">
        <p className="mb-4 text-sm text-destructive">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Application History</h1>
        <p className="mt-2 text-sm text-muted-foreground">Track your job applications</p>
      </div>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <p className="text-sm text-muted-foreground">
            No applications yet. Start by optimizing your CV for a job.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app, i) => {
            const status = statusConfig[app.status];
            return (
              <FadeIn key={app.id} delay={i * 60}>
                <div className="card-border bg-card p-4 transition-all duration-200 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-foreground">{app.jobTitle}</h3>
                      <p className="text-sm text-muted-foreground">{app.company}</p>
                    </div>
                    <Badge variant="outline" className={`shrink-0 ${status.className}`}>
                      {status.label}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(app.date).toLocaleDateString()}</span>
                    {app.atsScore !== undefined && (
                      <span className="font-medium text-foreground">ATS: {app.atsScore}%</span>
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
