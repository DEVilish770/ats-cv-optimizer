"use client";

import { useEffect, useState } from "react";

const tips = [
  "75% of resumes are rejected by ATS before a human sees them",
  "Matching exact job posting keywords increases your chances by 60%",
  "ATS systems rank candidates by keyword density and relevance",
  "Tailored resumes are 3x more likely to get an interview",
  "Most ATS systems cannot read headers, footers, or text in images",
  "Using standard section headings helps ATS parse your resume correctly",
  "Quantified achievements with numbers score higher in ATS ranking",
];

interface GeometricLoaderProps {
  size?: "sm" | "md" | "lg";
  showTips?: boolean;
}

/**
 * Geometric loader — straight-line hexagonal wireframes
 * with optional rotating ATS tips for long waits.
 */
export default function GeometricLoader({
  size = "md",
  showTips = false,
}: GeometricLoaderProps) {
  const dim = size === "sm" ? 44 : size === "md" ? 76 : 120;
  const sw = size === "sm" ? 0.4 : 0.6;
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (!showTips) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [showTips]);

  function hexPoints(r: number): [number, number][] {
    return Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      return [50 + r * Math.cos(angle), 50 + r * Math.sin(angle)] as [number, number];
    });
  }

  const outer = hexPoints(44);
  const mid = hexPoints(28);
  const inner = hexPoints(14);

  return (
    <div className="flex flex-col items-center gap-6">
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 100 100"
        fill="none"
        className="text-foreground"
      >
        {/* Outer hexagon */}
        <g>
          <animateTransform
            attributeName="transform" type="rotate"
            from="0 50 50" to="360 50 50" dur="12s" repeatCount="indefinite"
          />
          {outer.map((p, i) => {
            const next = outer[(i + 1) % 6];
            return (
              <line key={`o${i}`}
                x1={p[0]} y1={p[1]} x2={next[0]} y2={next[1]}
                stroke="currentColor" strokeWidth={sw} opacity="0.15"
              />
            );
          })}
        </g>

        {/* Mid hexagon + star */}
        <g>
          <animateTransform
            attributeName="transform" type="rotate"
            from="360 50 50" to="0 50 50" dur="8s" repeatCount="indefinite"
          />
          {mid.map((p, i) => {
            const next = mid[(i + 1) % 6];
            return (
              <line key={`m${i}`}
                x1={p[0]} y1={p[1]} x2={next[0]} y2={next[1]}
                stroke="currentColor" strokeWidth={sw} opacity="0.25"
              />
            );
          })}
          {[0, 2, 4].map((i) => {
            const next = mid[(i + 2) % 6];
            return (
              <line key={`mt${i}`}
                x1={mid[i][0]} y1={mid[i][1]} x2={next[0]} y2={next[1]}
                stroke="currentColor" strokeWidth={sw * 0.7} opacity="0.12"
              />
            );
          })}
          {[1, 3, 5].map((i) => {
            const next = mid[(i + 2) % 6];
            return (
              <line key={`mt2${i}`}
                x1={mid[i][0]} y1={mid[i][1]} x2={next[0]} y2={next[1]}
                stroke="currentColor" strokeWidth={sw * 0.7} opacity="0.12"
              />
            );
          })}
        </g>

        {/* Inner hexagon */}
        <g>
          <animateTransform
            attributeName="transform" type="rotate"
            from="0 50 50" to="360 50 50" dur="5s" repeatCount="indefinite"
          />
          {inner.map((p, i) => {
            const next = inner[(i + 1) % 6];
            return (
              <line key={`in${i}`}
                x1={p[0]} y1={p[1]} x2={next[0]} y2={next[1]}
                stroke="currentColor" strokeWidth={sw} opacity="0.4"
              />
            );
          })}
        </g>

        {/* Spokes */}
        <g>
          <animateTransform
            attributeName="transform" type="rotate"
            from="360 50 50" to="0 50 50" dur="20s" repeatCount="indefinite"
          />
          {outer.map((p, i) => (
            <line key={`sp${i}`}
              x1={50} y1={50} x2={p[0]} y2={p[1]}
              stroke="currentColor" strokeWidth={sw * 0.5} opacity="0.08"
            />
          ))}
        </g>

        {/* Center dot */}
        <circle cx="50" cy="50" r="1.5" fill="currentColor" opacity="0.4">
          <animate attributeName="r" values="0.8;2;0.8" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Rotating tips */}
      {showTips && (
        <div className="max-w-xs text-center">
          <p
            key={tipIndex}
            className="animate-[fadeIn_0.5s_ease-out] text-xs leading-relaxed text-muted-foreground"
          >
            {tips[tipIndex]}
          </p>
        </div>
      )}
    </div>
  );
}
