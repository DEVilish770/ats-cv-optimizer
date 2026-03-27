"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ATSScore from "@/components/ATSScore";
import CVDiff from "@/components/CVDiff";
import FadeIn from "@/components/FadeIn";
import GeometricLoader from "@/components/GeometricLoader";
import { CheckCircle, Circle, AlertTriangle } from "lucide-react";
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
        <div className="mb-4 rounded-full bg-red-500/10 p-3">
          <AlertTriangle className="h-6 w-6 text-red-400" />
        </div>
        <p className="mb-2 font-[family-name:var(--font-heading)] text-lg font-semibold text-white">
          Optimization Failed
        </p>
        <p className="mb-6 max-w-sm text-center text-sm text-[#7a7a92]">
          {error}
        </p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (currentStep !== "done") {
    return (
      <div className="py-12">
        <div className="mb-8 flex flex-col items-center text-center">
          <GeometricLoader size="lg" />
          <h2 className="mt-6 text-xl font-semibold text-white">
            Optimizing Your CV
          </h2>
          <p className="mt-1 text-sm text-[#7a7a92]">
            This usually takes 15-30 seconds
          </p>
        </div>
        <div className="mx-auto max-w-sm space-y-3">
          {steps.map((step) => {
            const stepIndex = steps.findIndex((s) => s.key === step.key);
            const currentIndex = steps.findIndex(
              (s) => s.key === currentStep
            );
            const isDone = stepIndex < currentIndex;
            const isActive = step.key === currentStep;

            return (
              <div
                key={step.key}
                className={`flex gap-3 rounded-lg p-3 transition-colors ${
                  isActive ? "bg-white/[0.02]" : ""
                }`}
              >
                <div className="mt-0.5">
                  {isDone ? (
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  ) : isActive ? (
                    <div className="h-5 w-5 animate-pulse rounded-full border border-[#c9a55c]/50 bg-[#c9a55c]/20" />
                  ) : (
                    <Circle className="h-5 w-5 text-[#2a2a3a]" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isDone
                        ? "text-emerald-400"
                        : isActive
                          ? "text-[#c9a55c]"
                          : "text-[#3a3a4a]"
                    }`}
                  >
                    {step.label}
                  </p>
                  {isActive && (
                    <p className="mt-0.5 text-xs text-[#5a5a70]">
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
      <FadeIn>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white">
            CV Optimization Complete
          </h2>
          <p className="mt-1 text-sm text-[#7a7a92]">
            Your CV has been tailored to match this job&apos;s requirements
          </p>
        </div>
      </FadeIn>

      {/* ATS Score + Actions — side by side */}
      <FadeIn delay={100}>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* ATS Score */}
          <div className="card-border flex flex-col items-center justify-center bg-[#0a0a0a] p-5">
            <ATSScore score={result.atsScore} />
            <p className="mt-2 text-sm font-medium text-white">
              {scoreLabel}
            </p>
            <p className="mt-0.5 max-w-[220px] text-center text-xs text-[#4a4a5e]">
              How well your optimized CV matches this job&apos;s ATS filters
            </p>
          </div>

          {/* Actions */}
          <div className="card-border flex flex-col justify-center gap-3 bg-[#0a0a0a] p-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#c9a55c]">
              Ready to apply?
            </p>
            {result.applyUrl && (
              <a
                href={result.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="h-11 w-full bg-[#c9a55c] text-sm font-semibold text-black hover:bg-[#d4b36a]">
                  Apply on Job Site
                </Button>
              </a>
            )}
            {result.pdfUrl && (
              <a href={result.pdfUrl} download>
                <Button
                  variant="outline"
                  className="h-11 w-full border-white/10 bg-white/[0.04] text-sm text-white hover:bg-white/[0.08]"
                >
                  Download Optimized CV
                </Button>
              </a>
            )}
            <p className="text-xs text-[#4a4a5e]">
              Download the PDF and upload it when applying
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Keywords — compact horizontal layout */}
      <FadeIn delay={200}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card-border bg-[#0a0a0a] p-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Keywords Matched
              </h4>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                {result.matchedKeywords.length}
              </span>
            </div>
            <p className="mb-2 text-xs text-[#4a4a5e]">
              Found in your optimized CV
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.matchedKeywords.map((kw) => (
                <Badge
                  key={kw}
                  variant="secondary"
                  className="border-emerald-500/10 bg-emerald-500/8 text-xs text-emerald-300"
                >
                  {kw}
                </Badge>
              ))}
            </div>
          </div>

          <div className="card-border bg-[#0a0a0a] p-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Not Applicable
              </h4>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                {result.missingKeywords.length}
              </span>
            </div>
            <p className="mb-2 text-xs text-[#4a4a5e]">
              Cannot add without fabricating experience
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.missingKeywords.map((kw) => (
                <Badge
                  key={kw}
                  variant="secondary"
                  className="border-amber-500/10 bg-amber-500/8 text-xs text-amber-300"
                >
                  {kw}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Diff */}
      {result.diff.length > 0 && (
        <FadeIn delay={300}>
          <div>
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-white">
                What We Changed
              </h3>
              <p className="mt-1 text-xs text-[#5a5a70]">
                Click each section to see details. No experience was fabricated.
              </p>
            </div>
            <CVDiff sections={result.diff} />
          </div>
        </FadeIn>
      )}
    </div>
  );
}
