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
  let bgColor: string;
  if (clampedScore >= 70) {
    color = "#16a34a"; // green-600
    bgColor = "#dcfce7"; // green-100
  } else if (clampedScore >= 40) {
    color = "#ca8a04"; // yellow-600
    bgColor = "#fef9c3"; // yellow-100
  } else {
    color = "#dc2626"; // red-600
    bgColor = "#fee2e2"; // red-100
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-32 w-32">
        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 128 128">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={bgColor}
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
      <p className="mt-2 text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}
