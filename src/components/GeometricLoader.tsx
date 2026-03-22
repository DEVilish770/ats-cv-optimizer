"use client";

/**
 * Geometric loading animation — self-repeating, always-in-motion
 * patterns made from thin white lines.
 */
export default function GeometricLoader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? 48 : size === "md" ? 80 : 120;
  const strokeW = size === "sm" ? 0.5 : 0.8;

  return (
    <div className="flex items-center justify-center">
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 100 100"
        fill="none"
        className="geometric-loader"
      >
        {/* Outer rotating hexagon */}
        <polygon
          points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={strokeW}
          className="animate-[spin_8s_linear_infinite]"
          style={{ transformOrigin: "50px 50px" }}
        />
        {/* Inner counter-rotating hexagon */}
        <polygon
          points="50,20 78,35 78,65 50,80 22,65 22,35"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={strokeW}
          className="animate-[spin_6s_linear_infinite_reverse]"
          style={{ transformOrigin: "50px 50px" }}
        />
        {/* Innermost rotating triangle */}
        <polygon
          points="50,30 68,60 32,60"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth={strokeW}
          className="animate-[spin_4s_linear_infinite]"
          style={{ transformOrigin: "50px 50px" }}
        />
        {/* Cross lines — slowly rotating */}
        <g
          className="animate-[spin_12s_linear_infinite_reverse]"
          style={{ transformOrigin: "50px 50px" }}
        >
          <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(255,255,255,0.1)" strokeWidth={strokeW * 0.6} />
          <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth={strokeW * 0.6} />
          <line x1="15" y1="15" x2="85" y2="85" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeW * 0.6} />
          <line x1="85" y1="15" x2="15" y2="85" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeW * 0.6} />
        </g>
        {/* Orbiting dot */}
        <circle r="1.5" fill="rgba(255,255,255,0.6)" className="animate-[orbit_3s_linear_infinite]">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path="M50,5 A45,45 0 1,1 49.99,5"
          />
        </circle>
        {/* Second orbiting dot — opposite direction */}
        <circle r="1" fill="rgba(255,255,255,0.3)">
          <animateMotion
            dur="4s"
            repeatCount="indefinite"
            path="M50,20 A30,30 0 1,0 49.99,20"
          />
        </circle>
        {/* Pulsing center dot */}
        <circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.4)">
          <animate attributeName="r" values="1.5;3;1.5" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}
