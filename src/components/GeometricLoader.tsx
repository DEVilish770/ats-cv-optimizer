"use client";

/**
 * Symmetrical, self-repeating geometric loader.
 * Four concentric squares rotate in alternating directions,
 * breathing in opacity, creating a seamless infinite loop.
 */
export default function GeometricLoader({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "sm" ? 40 : size === "md" ? 72 : 112;
  const sw = size === "sm" ? 0.4 : 0.6;

  // Each layer: inset from center, rotation duration, direction
  const layers = [
    { inset: 4, dur: 10, reverse: false, opacity: 0.12 },
    { inset: 16, dur: 7, reverse: true, opacity: 0.2 },
    { inset: 26, dur: 5, reverse: false, opacity: 0.3 },
    { inset: 34, dur: 3.5, reverse: true, opacity: 0.45 },
  ];

  return (
    <div className="flex items-center justify-center">
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 100 100"
        fill="none"
        style={{ overflow: "visible" }}
      >
        {layers.map((layer, i) => {
          const half = 50 - layer.inset;
          const points = `${50 - half},${50 - half} ${50 + half},${50 - half} ${50 + half},${50 + half} ${50 - half},${50 + half}`;

          return (
            <polygon
              key={i}
              points={points}
              stroke={`rgba(255,255,255,${layer.opacity})`}
              strokeWidth={sw}
              fill="none"
              style={{ transformOrigin: "50px 50px" }}
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={layer.reverse ? "360 50 50" : "0 50 50"}
                to={layer.reverse ? "0 50 50" : "360 50 50"}
                dur={`${layer.dur}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values={`${layer.opacity};${layer.opacity * 2.2};${layer.opacity}`}
                dur={`${layer.dur * 0.8}s`}
                repeatCount="indefinite"
              />
            </polygon>
          );
        })}

        {/* Center pulsing dot */}
        <circle cx="50" cy="50" r="1.5" fill="rgba(255,255,255,0.4)">
          <animate
            attributeName="r"
            values="1;2.5;1"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.3;0.7;0.3"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
}
