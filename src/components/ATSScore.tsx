"use client";

interface ATSScoreProps {
  score: number;
  label?: string;
}

export default function ATSScore({ score, label = "ATS Score" }: ATSScoreProps) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  let color: string;
  let glowColor: string;
  if (clampedScore >= 70) {
    color = "#34d399";
    glowColor = "rgba(52, 211, 153, 0.3)";
  } else if (clampedScore >= 40) {
    color = "#fbbf24";
    glowColor = "rgba(251, 191, 36, 0.3)";
  } else {
    color = "#f87171";
    glowColor = "rgba(248, 113, 113, 0.3)";
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-32 w-32">
        <svg
          className="h-32 w-32 -rotate-90"
          viewBox="0 0 128 128"
          style={{ filter: `drop-shadow(0 0 12px ${glowColor})` }}
        >
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="10"
          />
          {/* Score arc */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-3xl font-bold"
            style={{ color }}
          >
            {clampedScore}
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-[#7a7a92]">{label}</p>
    </div>
  );
}
