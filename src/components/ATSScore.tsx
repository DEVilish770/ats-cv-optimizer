"use client";

import { useEffect, useState } from "react";

interface ATSScoreProps {
  score: number;
  label?: string;
}

/**
 * ATS Score visualization — a hexagonal gauge with animated
 * segments and a pulsing glow that reflects the match quality.
 */
export default function ATSScore({ score, label = "ATS Score" }: ATSScoreProps) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 1200;

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(clampedScore * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [clampedScore]);

  // Color based on score
  let color: string;
  let glowColor: string;
  let labelText: string;
  if (clampedScore >= 70) {
    color = "#34d399";
    glowColor = "rgba(52, 211, 153, 0.25)";
    labelText = "Strong";
  } else if (clampedScore >= 40) {
    color = "#fbbf24";
    glowColor = "rgba(251, 191, 36, 0.25)";
    labelText = "Moderate";
  } else {
    color = "#f87171";
    glowColor = "rgba(248, 113, 113, 0.25)";
    labelText = "Low";
  }

  // Generate hexagon segments — 6 segments, each covering score/6
  const totalSegments = 6;
  const filledSegments = Math.floor((clampedScore / 100) * totalSegments);
  const partialFill = ((clampedScore / 100) * totalSegments) - filledSegments;

  // Generate hexagon points for each segment
  function hexPoint(i: number, radius: number): [number, number] {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return [50 + radius * Math.cos(angle), 50 + radius * Math.sin(angle)];
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative h-40 w-40"
        style={{ filter: `drop-shadow(0 0 20px ${glowColor})` }}
      >
        <svg viewBox="0 0 100 100" className="h-40 w-40">
          {/* Background hexagon */}
          <polygon
            points={Array.from({ length: 6 }, (_, i) => hexPoint(i, 40).join(",")).join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
          {/* Inner hexagon */}
          <polygon
            points={Array.from({ length: 6 }, (_, i) => hexPoint(i, 28).join(",")).join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="0.5"
          />

          {/* Score segments — lines from inner to outer hex */}
          {Array.from({ length: totalSegments }, (_, i) => {
            const inner = hexPoint(i, 28);
            const outer = hexPoint(i, 40);
            const isFilled = i < filledSegments;
            const isPartial = i === filledSegments;
            const opacity = isFilled ? 1 : isPartial ? partialFill : 0.1;

            return (
              <line
                key={`seg-${i}`}
                x1={inner[0]}
                y1={inner[1]}
                x2={outer[0]}
                y2={outer[1]}
                stroke={isFilled || isPartial ? color : "rgba(255,255,255,0.06)"}
                strokeWidth="2"
                strokeLinecap="round"
                opacity={opacity}
                className="transition-all duration-1000"
              />
            );
          })}

          {/* Filled hex edges */}
          {Array.from({ length: totalSegments }, (_, i) => {
            const p1 = hexPoint(i, 40);
            const p2 = hexPoint((i + 1) % 6, 40);
            const isFilled = i < filledSegments;
            const isPartial = i === filledSegments;

            return (
              <line
                key={`edge-${i}`}
                x1={p1[0]}
                y1={p1[1]}
                x2={p2[0]}
                y2={p2[1]}
                stroke={isFilled ? color : isPartial ? color : "rgba(255,255,255,0.06)"}
                strokeWidth={isFilled ? "1.5" : "0.5"}
                strokeLinecap="round"
                opacity={isPartial ? partialFill : 1}
                className="transition-all duration-1000"
              />
            );
          })}

          {/* Pulsing vertex dots for filled segments */}
          {Array.from({ length: totalSegments }, (_, i) => {
            if (i > filledSegments) return null;
            const p = hexPoint(i, 40);
            return (
              <circle
                key={`dot-${i}`}
                cx={p[0]}
                cy={p[1]}
                r="1.5"
                fill={color}
                opacity={i <= filledSegments ? 0.8 : 0.1}
              >
                {i === filledSegments && (
                  <animate attributeName="r" values="1;2.5;1" dur="2s" repeatCount="indefinite" />
                )}
              </circle>
            );
          })}

          {/* Center score number */}
          <text
            x="50"
            y="47"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={color}
            fontSize="18"
            fontWeight="700"
            fontFamily="inherit"
          >
            {animatedScore}
          </text>
          <text
            x="50"
            y="60"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.3)"
            fontSize="6"
            fontWeight="500"
            letterSpacing="1.5"
            fontFamily="inherit"
          >
            {labelText.toUpperCase()}
          </text>
        </svg>
      </div>
      <p className="mt-1 text-sm font-medium text-[#7a7a92]">{label}</p>
    </div>
  );
}
