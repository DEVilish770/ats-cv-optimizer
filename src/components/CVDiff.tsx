"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, RefreshCw, Briefcase } from "lucide-react";

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
      {section.changeDescriptions.length > 0 && (
        <div className="rounded-lg bg-secondary p-3">
          <ul className="space-y-0.5 text-xs text-muted-foreground">
            {section.changeDescriptions.map((desc, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-foreground/30" />
                <span>{desc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isNewContent ? (
        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-500/10">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Added</p>
          <p className="whitespace-pre-line text-xs leading-relaxed text-foreground">{section.optimized}</p>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg bg-secondary p-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Before</p>
            <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">{section.original}</p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-500/10">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">After</p>
            <p className="whitespace-pre-line text-xs leading-relaxed text-foreground">{section.optimized}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CVDiff({ sections }: CVDiffProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  if (sections.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">No changes were needed.</p>;
  }

  function toggleSection(index: number) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  const experienceSections = sections.filter((s) => s.section === "experience");
  const otherSections = sections.filter((s) => s.section !== "experience");

  return (
    <div className="space-y-2">
      {otherSections.map((section) => {
        const globalIndex = sections.indexOf(section);
        const isExpanded = expandedSections.has(globalIndex);
        const isNewContent = !section.original;

        return (
          <div key={globalIndex} className="card-border overflow-hidden bg-card">
            <button
              onClick={() => toggleSection(globalIndex)}
              className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-secondary"
            >
              <div className="flex items-center gap-2">
                {isNewContent ? (
                  <Plus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5 text-foreground/50" />
                )}
                <span className="text-sm font-semibold text-foreground">{section.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                  isNewContent
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                    : "bg-secondary text-muted-foreground"
                }`}>
                  {isNewContent ? "New" : "Optimized"}
                </span>
              </div>
              {isExpanded ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
            </button>
            {isExpanded && (
              <div className="border-t border-border px-3 pb-3 pt-2">
                <SectionDiffContent section={section} />
              </div>
            )}
          </div>
        );
      })}

      {experienceSections.length > 0 && (
        <div className="card-border overflow-hidden bg-card">
          <div className="flex items-center gap-2 border-b border-border bg-secondary p-3">
            <Briefcase className="h-3.5 w-3.5 text-foreground/50" />
            <span className="text-sm font-semibold text-foreground">Work Experience</span>
            <span className="rounded-full bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
              {experienceSections.length} {experienceSections.length === 1 ? "role" : "roles"}
            </span>
          </div>
          <div className="divide-y divide-border">
            {experienceSections.map((section) => {
              const globalIndex = sections.indexOf(section);
              const isExpanded = expandedSections.has(globalIndex);
              return (
                <div key={globalIndex}>
                  <button
                    onClick={() => toggleSection(globalIndex)}
                    className="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-secondary"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{section.name}</p>
                      {section.subtitle && <p className="text-xs text-muted-foreground">{section.subtitle}</p>}
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border px-3 pb-3 pt-2">
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
