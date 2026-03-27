"use client";

/**
 * Geometric loader — straight lines forming rotating triangles
 * and hexagonal wireframes. Pure line-based, no curves.
 */
export default function GeometricLoader({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "sm" ? 44 : size === "md" ? 76 : 120;
  const sw = size === "sm" ? 0.4 : 0.6;

  // Hexagon vertices at radius r from center (50,50)
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
    <div className="flex items-center justify-center">
      <svg width={dim} height={dim} viewBox="0 0 100 100" fill="none">
        {/* Outer hexagon — slow clockwise */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="12s"
            repeatCount="indefinite"
          />
          {outer.map((p, i) => {
            const next = outer[(i + 1) % 6];
            return (
              <line
                key={`o${i}`}
                x1={p[0]} y1={p[1]} x2={next[0]} y2={next[1]}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={sw}
              />
            );
          })}
        </g>

        {/* Mid hexagon — counter-clockwise */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="360 50 50"
            to="0 50 50"
            dur="8s"
            repeatCount="indefinite"
          />
          {mid.map((p, i) => {
            const next = mid[(i + 1) % 6];
            return (
              <line
                key={`m${i}`}
                x1={p[0]} y1={p[1]} x2={next[0]} y2={next[1]}
                stroke="rgba(255,255,255,0.22)"
                strokeWidth={sw}
              />
            );
          })}
          {/* Cross-lines connecting alternate mid vertices (two triangles) */}
          {[0, 2, 4].map((i) => {
            const next = mid[(i + 2) % 6];
            return (
              <line
                key={`mt${i}`}
                x1={mid[i][0]} y1={mid[i][1]} x2={next[0]} y2={next[1]}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={sw * 0.7}
              />
            );
          })}
          {[1, 3, 5].map((i) => {
            const next = mid[(i + 2) % 6];
            return (
              <line
                key={`mt2${i}`}
                x1={mid[i][0]} y1={mid[i][1]} x2={next[0]} y2={next[1]}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={sw * 0.7}
              />
            );
          })}
        </g>

        {/* Inner hexagon — clockwise faster */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="5s"
            repeatCount="indefinite"
          />
          {inner.map((p, i) => {
            const next = inner[(i + 1) % 6];
            return (
              <line
                key={`in${i}`}
                x1={p[0]} y1={p[1]} x2={next[0]} y2={next[1]}
                stroke="rgba(255,255,255,0.35)"
                strokeWidth={sw}
              />
            );
          })}
        </g>

        {/* Spokes — connecting inner to outer, slow reverse rotation */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="360 50 50"
            to="0 50 50"
            dur="20s"
            repeatCount="indefinite"
          />
          {outer.map((p, i) => (
            <line
              key={`sp${i}`}
              x1={50} y1={50} x2={p[0]} y2={p[1]}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={sw * 0.5}
            />
          ))}
        </g>

        {/* Breathing opacity overlay on the whole thing */}
        <circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.5)">
          <animate
            attributeName="r"
            values="0.8;1.8;0.8"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.3;0.6;0.3"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
}
