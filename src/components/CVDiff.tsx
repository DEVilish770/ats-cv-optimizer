"use client";

import { useState } from "react";
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
      {/* ATS improvement explanation */}
      {section.changeDescriptions.length > 0 && (
        <div className="rounded-lg border border-blue-500/10 bg-blue-500/5 p-3">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-blue-400">
            ATS Improvements Made
          </p>
          <ul className="space-y-1 text-sm text-[#9a9ab0]">
            {section.changeDescriptions.map((desc, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400/60" />
                <span>{desc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Before / After comparison */}
      {isNewContent ? (
        <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Added to your CV
          </p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-[#c8c8d4]">
            {section.optimized}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#4a4a5e]">
              Your original
            </p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-[#7a7a92]">
              {section.original}
            </p>
          </div>
          <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              ATS-optimized version
            </p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-[#c8c8d4]">
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
      <p className="py-4 text-center text-sm text-[#5a5a70]">
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

  const experienceSections = sections.filter((s) => s.section === "experience");
  const otherSections = sections.filter((s) => s.section !== "experience");

  return (
    <div className="space-y-3">
      {/* Non-experience sections */}
      {otherSections.map((section) => {
        const globalIndex = sections.indexOf(section);
        const isExpanded = expandedSections.has(globalIndex);
        const isNewContent = !section.original;

        return (
          <div key={globalIndex} className="gradient-border overflow-hidden rounded-xl bg-[#101118]">
            <button
              onClick={() => toggleSection(globalIndex)}
              className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-white/[0.02]"
            >
              <div className="flex items-center gap-2">
                {isNewContent ? (
                  <Plus className="h-4 w-4 text-emerald-400" />
                ) : (
                  <RefreshCw className="h-4 w-4 text-blue-400" />
                )}
                <span className="font-semibold text-white">
                  {section.name}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    isNewContent
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-blue-500/10 text-blue-400"
                  }`}
                >
                  {isNewContent ? "New section added" : "Optimized for ATS"}
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 shrink-0 text-[#4a4a5e]" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 text-[#4a4a5e]" />
              )}
            </button>

            {isExpanded && (
              <div className="border-t border-white/[0.04] px-4 pb-4 pt-3">
                <SectionDiffContent section={section} />
              </div>
            )}
          </div>
        );
      })}

      {/* Experience sections — grouped */}
      {experienceSections.length > 0 && (
        <div className="gradient-border overflow-hidden rounded-xl bg-[#101118]">
          <div className="flex items-center gap-2 border-b border-white/[0.04] bg-white/[0.02] p-4">
            <Briefcase className="h-4 w-4 text-[#c9a55c]" />
            <span className="font-semibold text-white">
              Work Experience
            </span>
            <span className="rounded-full bg-[#c9a55c]/10 px-2 py-0.5 text-xs text-[#c9a55c]">
              {experienceSections.length}{" "}
              {experienceSections.length === 1 ? "role" : "roles"} optimized
            </span>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {experienceSections.map((section) => {
              const globalIndex = sections.indexOf(section);
              const isExpanded = expandedSections.has(globalIndex);

              return (
                <div key={globalIndex}>
                  <button
                    onClick={() => toggleSection(globalIndex)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {section.name}
                      </p>
                      {section.subtitle && (
                        <p className="text-sm text-[#5a5a70]">
                          {section.subtitle}
                        </p>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-[#4a4a5e]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-[#4a4a5e]" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-white/[0.04] px-4 pb-4 pt-3">
                      <SectionDiffContent section={section} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
