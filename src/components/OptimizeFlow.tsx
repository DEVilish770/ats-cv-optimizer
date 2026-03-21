"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ATSScore from "@/components/ATSScore";
import CVDiff from "@/components/CVDiff";
import {
  Loader2,
  CheckCircle,
  Circle,
  Download,
  ExternalLink,
  Sparkles,
  Target,
  AlertTriangle,
} from "lucide-react";
import { apiFetch } from "@/lib/session";

interface DiffSection {
  name: string;
  subtitle?: string;
  section: string;
  original: string;
  optimized: string;
  changeDescriptions: string[];
}

interface OptimizationResult {
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  diff: DiffSection[];
  pdfUrl?: string;
  applyUrl?: string;
}

interface OptimizeFlowProps {
  jobId: string;
}

type Step = "analyzing" | "optimizing" | "generating" | "done" | "error";

const steps: { key: Step; label: string; description: string }[] = [
  {
    key: "analyzing",
    label: "Analyzing job requirements",
    description: "Extracting key skills, qualifications, and ATS keywords",
  },
  {
    key: "optimizing",
    label: "Optimizing your CV",
    description: "Tailoring your experience to match the job description",
  },
  {
    key: "generating",
    label: "Finalizing results",
    description: "Preparing your optimization report",
  },
];

export default function OptimizeFlow({ jobId }: OptimizeFlowProps) {
  const [currentStep, setCurrentStep] = useState<Step>("analyzing");
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function optimize() {
      try {
        setCurrentStep("analyzing");
        await new Promise((r) => setTimeout(r, 1200));

        setCurrentStep("optimizing");

        const res = await apiFetch(`/api/jobs/${jobId}/optimize`, {
          method: "POST",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Optimization failed");
        }

        setCurrentStep("generating");
        await new Promise((r) => setTimeout(r, 800));

        setResult(data);
        setCurrentStep("done");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Optimization failed. Please try again."
        );
        setCurrentStep("error");
      }
    }

    optimize();
  }, [jobId]);

  if (currentStep === "error") {
    return (
      <div className="flex flex-col items-center py-12">
        <div className="mb-4 rounded-full bg-red-100 p-3">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <p className="mb-2 text-lg font-semibold text-slate-900">
          Optimization Failed
        </p>
        <p className="mb-6 max-w-sm text-center text-sm text-slate-500">
          {error}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (currentStep !== "done") {
    return (
      <div className="py-12">
        <div className="mb-6 text-center">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900">
            Optimizing Your CV
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            This usually takes 15-30 seconds
          </p>
        </div>
        <div className="mx-auto max-w-sm space-y-4">
          {steps.map((step) => {
            const stepIndex = steps.findIndex((s) => s.key === step.key);
            const currentIndex = steps.findIndex(
              (s) => s.key === currentStep
            );
            const isDone = stepIndex < currentIndex;
            const isActive = step.key === currentStep;

            return (
              <div key={step.key} className="flex gap-3">
                <div className="mt-0.5">
                  {isDone ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : isActive ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isDone
                        ? "text-green-700"
                        : isActive
                          ? "text-blue-700"
                          : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  {isActive && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (!result) return null;

  const scoreLabel =
    result.atsScore >= 80
      ? "Excellent match"
      : result.atsScore >= 60
        ? "Good match"
        : result.atsScore >= 40
          ? "Fair match"
          : "Needs improvement";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
        <h2 className="text-xl font-bold text-slate-900">
          CV Optimization Complete
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Your CV has been tailored to match this job&apos;s requirements
        </p>
      </div>

      {/* ATS Score + Actions side by side on desktop */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* ATS Score */}
        <Card>
          <CardContent className="flex flex-col items-center py-6">
            <ATSScore score={result.atsScore} />
            <p className="mt-2 text-sm font-medium text-slate-600">
              {scoreLabel}
            </p>
            <p className="mt-1 max-w-[200px] text-center text-xs text-slate-400">
              How well your optimized CV matches this job&apos;s ATS filters
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="flex flex-col justify-center gap-3 py-6">
            <p className="mb-1 text-sm font-semibold text-slate-700">
              Ready to apply?
            </p>
            {result.applyUrl && (
              <a
                href={result.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="h-11 w-full bg-blue-600 text-sm font-semibold hover:bg-blue-500">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Apply on Job Site
                </Button>
              </a>
            )}
            {result.pdfUrl && (
              <a href={result.pdfUrl} download>
                <Button variant="outline" className="h-11 w-full text-sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download Optimized CV (PDF)
                </Button>
              </a>
            )}
            <p className="text-xs text-slate-400">
              Download the PDF and upload it when applying
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Keywords */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-700">
            Keyword Analysis
          </h3>
        </div>
        <p className="mb-3 text-xs text-slate-500">
          ATS systems scan for specific keywords from the job posting. Here is
          how your optimized CV matches.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-green-700">
                  Matched Keywords
                </h4>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  {result.matchedKeywords.length}
                </span>
              </div>
              <p className="mb-2 text-xs text-slate-400">
                These keywords from the job posting are in your CV
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.matchedKeywords.map((kw) => (
                  <Badge
                    key={kw}
                    variant="secondary"
                    className="bg-green-50 text-green-700"
                  >
                    {kw}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-amber-700">
                  Missing Keywords
                </h4>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  {result.missingKeywords.length}
                </span>
              </div>
              <p className="mb-2 text-xs text-slate-400">
                Could not be added without fabricating experience
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.missingKeywords.map((kw) => (
                  <Badge
                    key={kw}
                    variant="secondary"
                    className="bg-amber-50 text-amber-700"
                  >
                    {kw}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Diff */}
      {result.diff.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-700">
              What We Changed
            </h3>
          </div>
          <p className="mb-3 text-xs text-slate-500">
            Click each section to see how your CV was optimized. No experience
            or qualifications were fabricated.
          </p>
          <CVDiff sections={result.diff} />
        </div>
      )}
    </div>
  );
}
