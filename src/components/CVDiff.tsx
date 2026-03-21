"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface DiffSection {
  name: string;
  original: string;
  optimized: string;
  changes: Array<{
    type: "added" | "removed" | "unchanged";
    value: string;
  }>;
}

interface CVDiffProps {
  sections: DiffSection[];
}

export default function CVDiff({ sections }: CVDiffProps) {
  const [activeTab, setActiveTab] = useState(sections[0]?.name || "");

  if (sections.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-slate-500">
        No changes made to your CV.
      </p>
    );
  }

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex w-full overflow-x-auto">
          {sections.map((section) => (
            <TabsTrigger
              key={section.name}
              value={section.name}
              className="min-w-fit text-xs"
            >
              {section.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map((section) => (
          <TabsContent key={section.name} value={section.name}>
            {/* Mobile: stacked layout */}
            <div className="space-y-3 sm:hidden">
              <Card>
                <CardContent className="p-3">
                  <h4 className="mb-2 text-xs font-semibold uppercase text-slate-400">
                    Original
                  </h4>
                  <div className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                    {section.original}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-3">
                  <h4 className="mb-2 text-xs font-semibold uppercase text-blue-500">
                    Optimized
                  </h4>
                  <div className="text-sm leading-relaxed">
                    {section.changes.map((change, i) => (
                      <span
                        key={i}
                        className={
                          change.type === "added"
                            ? "rounded bg-green-100 px-0.5 text-green-800"
                            : change.type === "removed"
                              ? "rounded bg-red-100 px-0.5 text-red-800 line-through"
                              : "text-slate-700"
                        }
                      >
                        {change.value}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Desktop: side-by-side */}
            <div className="hidden gap-3 sm:grid sm:grid-cols-2">
              <Card>
                <CardContent className="p-3">
                  <h4 className="mb-2 text-xs font-semibold uppercase text-slate-400">
                    Original
                  </h4>
                  <div className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                    {section.original}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-3">
                  <h4 className="mb-2 text-xs font-semibold uppercase text-blue-500">
                    Optimized
                  </h4>
                  <div className="text-sm leading-relaxed">
                    {section.changes.map((change, i) => (
                      <span
                        key={i}
                        className={
                          change.type === "added"
                            ? "rounded bg-green-100 px-0.5 text-green-800"
                            : change.type === "removed"
                              ? "rounded bg-red-100 px-0.5 text-red-800 line-through"
                              : "text-slate-700"
                        }
                      >
                        {change.value}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
