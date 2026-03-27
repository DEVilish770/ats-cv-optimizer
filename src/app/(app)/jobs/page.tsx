"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import JobCard from "@/components/JobCard";
import FadeIn from "@/components/FadeIn";
import { Button } from "@/components/ui/button";
import GeometricLoader from "@/components/GeometricLoader";
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
          <GeometricLoader showTips />
          <p className="mt-6 text-lg font-medium text-foreground">Loading...</p>
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
        <GeometricLoader size="lg" showTips />
        <p className="mt-6 text-lg font-medium text-foreground">
          Finding matching jobs...
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Searching across multiple job boards
        </p>
      </div>
    );
  }

  if (noCv) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-20">
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          No CV Found
        </h2>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Upload your CV first so we can find jobs that match your skills.
        </p>
        <Link href="/upload">
          <Button className="bg-foreground text-background hover:opacity-90">
            Upload Your CV
          </Button>
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-20">
        <p className="mb-4 text-sm text-destructive">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Matching Jobs
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {jobs.length > 0
            ? `Found ${jobs.length} matching ${jobs.length === 1 ? "job" : "jobs"} for your profile`
            : "No matching jobs found"}
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            No jobs found matching your profile. Try updating your CV or check
            back later.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job, i) => (
            <FadeIn key={job.id} delay={i * 60}>
              <JobCard job={job} />
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
