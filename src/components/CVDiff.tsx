"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  RefreshCw,
  Briefcase,
} from "lucide-react";

interface DiffSection {
  name: string;
  subtitle?: string;
  section: string;
  original: string;
  optimized: string;
  changeDescriptions: string[];
}

interface CVDiffProps {
  sections: DiffSection[];
}

function SectionDiffContent({ section }: { section: DiffSection }) {
  const isNewContent = !section.original;

  return (
    <div className="space-y-3">
      {/* What changed — ATS improvement explanation */}
      {section.changeDescriptions.length > 0 && (
        <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-blue-600">
            ATS Improvements Made
          </p>
          <ul className="space-y-1 text-sm text-slate-700">
            {section.changeDescriptions.map((desc, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                <span>{desc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Before / After comparison */}
      {isNewContent ? (
        // New section — just show the added content
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-green-600">
            Added to your CV
          </p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800">
            {section.optimized}
          </p>
        </div>
      ) : (
        // Existing section — show side by side
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Your original
            </p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {section.original}
            </p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-green-600">
              ATS-optimized version
            </p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800">
              {section.optimized}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CVDiff({ sections }: CVDiffProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set([0])
  );

  if (sections.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-slate-500">
        No changes were needed.
      </p>
    );
  }

  function toggleSection(index: number) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  // Separate experience from other sections
  const experienceSections = sections.filter((s) => s.section === "experience");
  const otherSections = sections.filter((s) => s.section !== "experience");

  return (
    <div className="space-y-3">
      {/* Non-experience sections (summary, skills, education, etc.) */}
      {otherSections.map((section) => {
        const globalIndex = sections.indexOf(section);
        const isExpanded = expandedSections.has(globalIndex);
        const isNewContent = !section.original;

        return (
          <Card key={globalIndex} className="overflow-hidden">
            <button
              onClick={() => toggleSection(globalIndex)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-50"
            >
              <div className="flex items-center gap-2">
                {isNewContent ? (
                  <Plus className="h-4 w-4 text-green-600" />
                ) : (
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                )}
                <span className="font-semibold text-slate-900">
                  {section.name}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    isNewContent
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {isNewContent ? "New section added" : "Optimized for ATS"}
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
              )}
            </button>

            {isExpanded && (
              <CardContent className="border-t px-4 pb-4 pt-3">
                <SectionDiffContent section={section} />
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Experience sections — grouped under one card */}
      {experienceSections.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 border-b bg-slate-50 p-4">
            <Briefcase className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-slate-900">
              Work Experience
            </span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
              {experienceSections.length}{" "}
              {experienceSections.length === 1 ? "role" : "roles"} optimized
            </span>
          </div>

          <div className="divide-y">
            {experienceSections.map((section) => {
              const globalIndex = sections.indexOf(section);
              const isExpanded = expandedSections.has(globalIndex);

              return (
                <div key={globalIndex}>
                  <button
                    onClick={() => toggleSection(globalIndex)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {section.name}
                      </p>
                      {section.subtitle && (
                        <p className="text-sm text-slate-500">
                          {section.subtitle}
                        </p>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t bg-white px-4 pb-4 pt-3">
                      <SectionDiffContent section={section} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
