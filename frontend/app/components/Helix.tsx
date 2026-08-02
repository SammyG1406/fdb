/**
 * Decorative double-helix strand built from paired SVG sine waves.
 * Purely visual — aria-hidden and pointer-events-none.
 */
export default function Helix({
  className = '',
  strands = 14,
}: {
  className?: string;
  strands?: number;
}) {
  const height = 640;
  const width = 220;
  const amplitude = 70;
  const centerX = width / 2;
  const rungs = Array.from({ length: strands }, (_, i) => i);

  return (
    <svg
      aria-hidden="true"
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
    >
      <defs>
        <linearGradient id="helixA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="helixB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>

      {rungs.map((i) => {
        const t = i / (strands - 1);
        const y = t * height;
        const x1 = centerX + amplitude * Math.sin(t * Math.PI * 4);
        const x2 = centerX + amplitude * Math.sin(t * Math.PI * 4 + Math.PI);
        return (
          <line
            key={`rung-${i}`}
            x1={x1}
            y1={y}
            x2={x2}
            y2={y}
            stroke="url(#helixA)"
            strokeWidth="1.5"
            opacity="0.35"
          />
        );
      })}

      <path
        d={Array.from({ length: 65 }, (_, i) => {
          const t = i / 64;
          const y = t * height;
          const x = centerX + amplitude * Math.sin(t * Math.PI * 4);
          return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ')}
        stroke="url(#helixA)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d={Array.from({ length: 65 }, (_, i) => {
          const t = i / 64;
          const y = t * height;
          const x = centerX + amplitude * Math.sin(t * Math.PI * 4 + Math.PI);
          return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ')}
        stroke="url(#helixB)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {rungs.map((i) => {
        const t = i / (strands - 1);
        const y = t * height;
        const x1 = centerX + amplitude * Math.sin(t * Math.PI * 4);
        const x2 = centerX + amplitude * Math.sin(t * Math.PI * 4 + Math.PI);
        return (
          <g key={`node-${i}`}>
            <circle cx={x1} cy={y} r="4.5" fill="#8b5cf6" />
            <circle cx={x2} cy={y} r="4.5" fill="#ec4899" />
          </g>
        );
      })}
    </svg>
  );
}
