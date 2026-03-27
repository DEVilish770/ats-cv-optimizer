"use client";

import { useEffect, useState } from "react";

interface ATSScoreProps {
  score: number;
}

/**
 * ATS Score — animated arc gauge with segmented fill,
 * pulsing glow, and large centered score.
 */
export default function ATSScore({ score }: ATSScoreProps) {
  const clamped = Math.min(100, Math.max(0, score));
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const dur = 1400;
    function tick(now: number) {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setAnimated(Math.round(clamped * ease));
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [clamped]);

  // Color
  let color: string;
  let glow: string;
  let label: string;
  if (clamped >= 70) {
    color = "#34d399";
    glow = "rgba(52,211,153,0.15)";
    label = "Strong Match";
  } else if (clamped >= 40) {
    color = "#fbbf24";
    glow = "rgba(251,191,36,0.15)";
    label = "Moderate Match";
  } else {
    color = "#f87171";
    glow = "rgba(248,113,113,0.15)";
    label = "Needs Work";
  }

  // Arc geometry — 240° arc (from 150° to 390°)
  const cx = 60;
  const cy = 60;
  const r = 48;
  const startAngle = 150;
  const totalAngle = 240;
  const fillAngle = (animated / 100) * totalAngle;

  function polarToCart(angleDeg: number, radius: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function arcPath(start: number, sweep: number, radius: number) {
    const s = polarToCart(start, radius);
    const e = polarToCart(start + sweep, radius);
    const large = sweep > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  // Segment ticks — 20 segments
  const segments = 20;
  const segAngle = totalAngle / segments;
  const filledSegs = Math.floor((animated / 100) * segments);

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative"
        style={{ filter: `drop-shadow(0 0 24px ${glow})` }}
      >
        <svg width="120" height="110" viewBox="0 0 120 110">
          {/* Background arc */}
          <path
            d={arcPath(startAngle, totalAngle, r)}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Filled arc */}
          {fillAngle > 0 && (
            <path
              d={arcPath(startAngle, fillAngle, r)}
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              className="transition-all duration-100"
            />
          )}

          {/* Segment tick marks */}
          {Array.from({ length: segments + 1 }, (_, i) => {
            const angle = startAngle + i * segAngle;
            const inner = polarToCart(angle, r - 10);
            const outer = polarToCart(angle, r - 6);
            const filled = i <= filledSegs;
            return (
              <line
                key={i}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={filled ? color : "rgba(255,255,255,0.08)"}
                strokeWidth="1"
                opacity={filled ? 0.6 : 1}
              />
            );
          })}

          {/* Endpoint dot */}
          {fillAngle > 0 && (() => {
            const ep = polarToCart(startAngle + fillAngle, r);
            return (
              <circle cx={ep.x} cy={ep.y} r="3" fill={color}>
                <animate
                  attributeName="r"
                  values="2.5;4;2.5"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.8;1;0.8"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            );
          })()}

          {/* Score number */}
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="28"
            fontWeight="700"
            fontFamily="var(--font-heading)"
          >
            {animated}
          </text>

          {/* Label */}
          <text
            x={cx}
            y={cy + 16}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={color}
            fontSize="8"
            fontWeight="600"
            letterSpacing="2"
            fontFamily="var(--font-body)"
          >
            {label.toUpperCase()}
          </text>
        </svg>
      </div>
    </div>
  );
}
