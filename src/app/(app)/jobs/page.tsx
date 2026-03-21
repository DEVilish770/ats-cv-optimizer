"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import JobCard from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Search } from "lucide-react";
import { apiFetch } from "@/lib/session";

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

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg font-medium text-slate-900">Loading...</p>
        </div>
      }
    >
      <JobsContent />
    </Suspense>
  );
}

function JobsContent() {
  const searchParams = useSearchParams();
  const cvId = searchParams.get("cvId");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noCv, setNoCv] = useState(false);

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError("");

      try {
        const url = cvId
          ? `/api/jobs/search?cvId=${cvId}`
          : "/api/jobs/search";

        const res = await apiFetch(url);

        if (res.status === 404) {
          setNoCv(true);
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch jobs");
        }

        setJobs(data.jobs || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [cvId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-600" />
        <p className="text-lg font-medium text-slate-900">
          Finding matching jobs...
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Searching across multiple job boards
        </p>
      </div>
    );
  }

  if (noCv) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20">
        <div className="mb-4 rounded-full bg-slate-100 p-4">
          <Upload className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">
          No CV Found
        </h2>
        <p className="mb-6 text-center text-sm text-slate-500">
          Upload your CV first so we can find jobs that match your skills.
        </p>
        <Link href="/upload">
          <Button className="bg-blue-600 hover:bg-blue-500">
            Upload Your CV
          </Button>
        </Link>
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
        <h1 className="text-2xl font-bold text-slate-900">Matching Jobs</h1>
        <p className="mt-1 text-sm text-slate-500">
          {jobs.length > 0 ? (
            <>
              <Search className="mr-1 inline h-3.5 w-3.5" />
              Found {jobs.length} matching {jobs.length === 1 ? "job" : "jobs"}
            </>
          ) : (
            "No matching jobs found"
          )}
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-slate-500">
            No jobs found matching your profile. Try updating your CV or check
            back later.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
