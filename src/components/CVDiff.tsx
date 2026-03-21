"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Plus, RefreshCw } from "lucide-react";

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

  // Group sections: experience entries together, others standalone
  const experienceSections = sections.filter(
    (s) => s.section.toLowerCase() === "experience"
  );
  const otherSections = sections.filter(
    (s) => s.section.toLowerCase() !== "experience"
  );

  return (
    <div className="space-y-3">
      {/* Non-experience sections */}
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
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                  {isNewContent ? "Added" : "Updated"}
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {isExpanded && (
              <CardContent className="border-t px-4 pb-4 pt-3">
                {/* What changed */}
                {section.changeDescriptions.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                      What changed
                    </p>
                    <ul className="list-inside list-disc space-y-0.5 text-sm text-slate-600">
                      {section.changeDescriptions.map((desc, i) => (
                        <li key={i}>{desc}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Original */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Before
                    </p>
                    {section.original ? (
                      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                        {section.original}
                      </p>
                    ) : (
                      <p className="text-sm italic text-slate-400">
                        No existing content — this section was added during
                        optimization
                      </p>
                    )}
                  </div>

                  {/* Optimized */}
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-green-600">
                      After
                    </p>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800">
                      {section.optimized}
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Experience sections grouped */}
      {experienceSections.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 border-b bg-slate-50 p-4">
            <RefreshCw className="h-4 w-4 text-blue-600" />
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
                      {/* What changed */}
                      {section.changeDescriptions.length > 0 && (
                        <div className="mb-3">
                          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                            What changed
                          </p>
                          <ul className="list-inside list-disc space-y-0.5 text-sm text-slate-600">
                            {section.changeDescriptions.map((desc, i) => (
                              <li key={i}>{desc}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                            Before
                          </p>
                          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                            {section.original || "No changes to original"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-green-600">
                            After
                          </p>
                          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800">
                            {section.optimized}
                          </p>
                        </div>
                      </div>
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
