"use client";

/**
 * Subtle always-present geometric background.
 * Adapts to light/dark mode.
 */
export default function GeometricBg() {
  return (
    <div
      data-bg
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-[0.04] dark:opacity-[0.025]"
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g className="text-foreground">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 400 300"
            to="360 400 300"
            dur="120s"
            repeatCount="indefinite"
          />
          {[-200, -100, 0, 100, 200, 300, 400, 500, 600, 700, 800].map((y) => (
            <line
              key={`h${y}`}
              x1="-200" y1={y} x2="1000" y2={y}
              stroke="currentColor" strokeWidth="0.5"
            />
          ))}
          {[-400, -200, 0, 200, 400, 600, 800, 1000].map((x) => (
            <line
              key={`d1${x}`}
              x1={x} y1="-200" x2={x + 600} y2="800"
              stroke="currentColor" strokeWidth="0.5"
            />
          ))}
          {[-400, -200, 0, 200, 400, 600, 800, 1000].map((x) => (
            <line
              key={`d2${x}`}
              x1={x} y1="-200" x2={x - 600} y2="800"
              stroke="currentColor" strokeWidth="0.5"
            />
          ))}
        </g>

        <g className="text-foreground" opacity="0.5">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="360 400 300"
            to="0 400 300"
            dur="180s"
            repeatCount="indefinite"
          />
          {[80, 180, 300, 440].map((r) => {
            const pts = Array.from({ length: 6 }, (_, i) => {
              const a = (Math.PI / 3) * i - Math.PI / 2;
              return `${400 + r * Math.cos(a)},${300 + r * Math.sin(a)}`;
            }).join(" ");
            return (
              <polygon
                key={`hex${r}`}
                points={pts}
                stroke="currentColor"
                strokeWidth="0.5"
                fill="none"
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
