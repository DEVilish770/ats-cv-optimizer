"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  applied: {
    label: "Applied",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  interviewing: {
    label: "Interviewing",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  offered: {
    label: "Offered",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20">
        <p className="mb-4 text-sm text-red-600">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Application History
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track your job applications
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <div className="mb-4 rounded-full bg-slate-100 p-4">
            <Clock className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">
            No applications yet. Start by optimizing your CV for a job.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const status = statusConfig[app.status];
            return (
              <Card
                key={app.id}
                className="cursor-pointer transition-shadow hover:shadow-md active:scale-[0.99]"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-slate-900">
                        {app.jobTitle}
                      </h3>
                      <p className="text-sm text-slate-600">{app.company}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 ${status.className}`}
                    >
                      {status.label}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      {new Date(app.date).toLocaleDateString()}
                    </span>
                    {app.atsScore !== undefined && (
                      <span className="font-medium text-slate-500">
                        ATS: {app.atsScore}%
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
