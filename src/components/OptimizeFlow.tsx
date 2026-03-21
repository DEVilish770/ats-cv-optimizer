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
} from "lucide-react";
import { apiFetch } from "@/lib/session";

interface OptimizationResult {
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  diff: Array<{
    name: string;
    original: string;
    optimized: string;
    changes: Array<{
      type: "added" | "removed" | "unchanged";
      value: string;
    }>;
  }>;
  pdfUrl?: string;
  applyUrl?: string;
}

interface OptimizeFlowProps {
  jobId: string;
}

type Step = "analyzing" | "optimizing" | "generating" | "done" | "error";

const steps: { key: Step; label: string }[] = [
  { key: "analyzing", label: "Analyzing job requirements" },
  { key: "optimizing", label: "Optimizing your CV" },
  { key: "generating", label: "Generating PDF" },
];

export default function OptimizeFlow({ jobId }: OptimizeFlowProps) {
  const [currentStep, setCurrentStep] = useState<Step>("analyzing");
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function optimize() {
      try {
        // Simulate step progression
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
          err instanceof Error ? err.message : "Optimization failed. Please try again."
        );
        setCurrentStep("error");
      }
    }

    optimize();
  }, [jobId]);

  if (currentStep === "error") {
    return (
      <div className="flex flex-col items-center py-12">
        <p className="mb-4 text-sm text-red-600">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (currentStep !== "done") {
    return (
      <div className="py-12">
        <div className="space-y-4">
          {steps.map((step) => {
            const stepIndex = steps.findIndex((s) => s.key === step.key);
            const currentIndex = steps.findIndex(
              (s) => s.key === currentStep
            );
            const isDone = stepIndex < currentIndex;
            const isActive = step.key === currentStep;

            return (
              <div key={step.key} className="flex items-center gap-3">
                {isDone ? (
                  <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                ) : isActive ? (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-blue-600" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-slate-300" />
                )}
                <span
                  className={`text-sm font-medium ${
                    isDone
                      ? "text-green-700"
                      : isActive
                        ? "text-blue-700"
                        : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-6">
      {/* ATS Score */}
      <Card>
        <CardContent className="flex justify-center py-6">
          <ATSScore score={result.atsScore} />
        </CardContent>
      </Card>

      {/* Keywords */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-green-700">
              Matched Keywords ({result.matchedKeywords.length})
            </h3>
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
            <h3 className="mb-3 text-sm font-semibold text-red-700">
              Missing Keywords ({result.missingKeywords.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {result.missingKeywords.map((kw) => (
                <Badge
                  key={kw}
                  variant="secondary"
                  className="bg-red-50 text-red-700"
                >
                  {kw}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diff */}
      {result.diff.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-700">
            Changes Made
          </h3>
          <CVDiff sections={result.diff} />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {result.pdfUrl && (
          <a href={result.pdfUrl} download className="flex-1">
            <Button variant="outline" className="h-12 w-full">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </a>
        )}
        {result.applyUrl && (
          <a
            href={result.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button className="h-12 w-full bg-blue-600 hover:bg-blue-500">
              <ExternalLink className="mr-2 h-4 w-4" />
              Apply Now
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
