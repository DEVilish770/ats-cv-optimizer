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
    <div className="space-y-2">
      {/* ATS improvement explanation — compact */}
      {section.changeDescriptions.length > 0 && (
        <div className="rounded-lg bg-blue-500/5 px-3 py-2">
          <ul className="space-y-0.5 text-xs text-[#8a8aa0]">
            {section.changeDescriptions.map((desc, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-blue-400/50" />
                <span>{desc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Before / After — compact */}
      {isNewContent ? (
        <div className="rounded-lg bg-emerald-500/5 px-3 py-2">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-500/60">
            Added
          </p>
          <p className="whitespace-pre-line text-xs leading-relaxed text-[#b0b0c0]">
            {section.optimized}
          </p>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg bg-white/[0.02] px-3 py-2">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#3a3a4a]">
              Before
            </p>
            <p className="whitespace-pre-line text-xs leading-relaxed text-[#6a6a80]">
              {section.original}
            </p>
          </div>
          <div className="rounded-lg bg-emerald-500/5 px-3 py-2">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-500/60">
              After
            </p>
            <p className="whitespace-pre-line text-xs leading-relaxed text-[#b0b0c0]">
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
    <div className="space-y-2">
      {/* Non-experience sections */}
      {otherSections.map((section) => {
        const globalIndex = sections.indexOf(section);
        const isExpanded = expandedSections.has(globalIndex);
        const isNewContent = !section.original;

        return (
          <div key={globalIndex} className="card-border overflow-hidden bg-[#0a0a0a]">
            <button
              onClick={() => toggleSection(globalIndex)}
              className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-white/[0.02]"
            >
              <div className="flex items-center gap-2">
                {isNewContent ? (
                  <Plus className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5 text-blue-400" />
                )}
                <span className="text-sm font-semibold text-white">
                  {section.name}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    isNewContent
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-blue-500/10 text-blue-400"
                  }`}
                >
                  {isNewContent ? "New" : "Optimized"}
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 shrink-0 text-[#3a3a4a]" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 text-[#3a3a4a]" />
              )}
            </button>

            {isExpanded && (
              <div className="border-t border-white/[0.04] px-3 pb-3 pt-2">
                <SectionDiffContent section={section} />
              </div>
            )}
          </div>
        );
      })}

      {/* Experience sections — grouped */}
      {experienceSections.length > 0 && (
        <div className="card-border overflow-hidden bg-[#0a0a0a]">
          <div className="flex items-center gap-2 border-b border-white/[0.04] p-3">
            <Briefcase className="h-3.5 w-3.5 text-[#c9a55c]" />
            <span className="text-sm font-semibold text-white">
              Work Experience
            </span>
            <span className="rounded-full bg-[#c9a55c]/10 px-2 py-0.5 text-[10px] text-[#c9a55c]">
              {experienceSections.length} {experienceSections.length === 1 ? "role" : "roles"}
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
                    className="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-white/[0.02]"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {section.name}
                      </p>
                      {section.subtitle && (
                        <p className="text-xs text-[#5a5a70]">
                          {section.subtitle}
                        </p>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-[#3a3a4a]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-[#3a3a4a]" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-white/[0.04] px-3 pb-3 pt-2">
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
