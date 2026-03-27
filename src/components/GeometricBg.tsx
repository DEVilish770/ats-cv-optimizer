"use client";

/**
 * Subtle always-present geometric background.
 * Thin white lines forming a slowly drifting wireframe grid.
 * Not distracting — just adds depth to the dark background.
 */
export default function GeometricBg() {
  return (
    <div data-bg className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-[0.025]">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {/* Large slow-rotating triangle grid */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 400 300"
            to="360 400 300"
            dur="120s"
            repeatCount="indefinite"
          />
          {/* Horizontal lines */}
          {[-200, -100, 0, 100, 200, 300, 400, 500, 600, 700, 800].map((y) => (
            <line
              key={`h${y}`}
              x1="-200" y1={y} x2="1000" y2={y}
              stroke="white" strokeWidth="0.5"
            />
          ))}
          {/* Diagonal lines — forward */}
          {[-400, -200, 0, 200, 400, 600, 800, 1000].map((x) => (
            <line
              key={`d1${x}`}
              x1={x} y1="-200" x2={x + 600} y2="800"
              stroke="white" strokeWidth="0.5"
            />
          ))}
          {/* Diagonal lines — backward */}
          {[-400, -200, 0, 200, 400, 600, 800, 1000].map((x) => (
            <line
              key={`d2${x}`}
              x1={x} y1="-200" x2={x - 600} y2="800"
              stroke="white" strokeWidth="0.5"
            />
          ))}
        </g>

        {/* Second layer — counter-rotating, offset, even subtler */}
        <g opacity="0.5">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="360 400 300"
            to="0 400 300"
            dur="180s"
            repeatCount="indefinite"
          />
          {/* Concentric hexagon wireframes */}
          {[80, 180, 300, 440].map((r) => {
            const pts = Array.from({ length: 6 }, (_, i) => {
              const a = (Math.PI / 3) * i - Math.PI / 2;
              return `${400 + r * Math.cos(a)},${300 + r * Math.sin(a)}`;
            }).join(" ");
            return (
              <polygon
                key={`hex${r}`}
                points={pts}
                stroke="white"
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
