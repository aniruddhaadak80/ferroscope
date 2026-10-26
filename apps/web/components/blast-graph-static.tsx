import type { BlastGraph } from "@ferroscope/core";

const SEVERITY_FILL: Record<string, string> = {
  critical: "var(--rust)",
  high: "var(--amber)",
  medium: "var(--faint)",
  low: "var(--moss)",
};

export function BlastGraphStatic({ graph, className }: { graph: BlastGraph; className?: string }) {
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));

  return (
    <svg
      viewBox={`0 0 ${graph.width} ${graph.height}`}
      className={className}
      role="img"
      aria-label="Blast radius graph for the default profile"
    >
      <defs>
        <radialGradient id="ferro-core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--amber)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={graph.width / 2} cy={graph.height / 2} r="150" fill="url(#ferro-core-glow)" />

      {graph.edges.map((edge) => {
        const from = byId.get(edge.from);
        const to = byId.get(edge.to);
        if (!from || !to) return null;
        return (
          <line
            key={`${edge.from}-${edge.to}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={edge.kind === "stack-incident" ? "var(--amber)" : "var(--line-strong)"}
            strokeOpacity={edge.kind === "stack-incident" ? 0.55 : 0.35}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}

      {graph.nodes.map((node) => {
        if (node.kind === "self") {
          return (
            <g key={node.id}>
              <rect
                x={node.x - 11}
                y={node.y - 11}
                width="22"
                height="22"
                fill="var(--canvas)"
                stroke="var(--amber)"
                strokeWidth="1.5"
              />
              <rect x={node.x - 3} y={node.y - 3} width="6" height="6" fill="var(--amber)" />
              <text
                x={node.x}
                y={node.y + 30}
                textAnchor="middle"
                fontSize="11"
                fill="var(--ink)"
                fontFamily="var(--font-mono)"
                letterSpacing="2"
              >
                YOU
              </text>
            </g>
          );
        }

        if (node.kind === "stack") {
          return (
            <g key={node.id}>
              <rect
                x={node.x - 4}
                y={node.y - 4}
                width="8"
                height="8"
                fill="var(--surface)"
                stroke="var(--line-strong)"
                strokeWidth="1"
              />
              <text
                x={node.x}
                y={node.y + 16}
                textAnchor="middle"
                fontSize="9"
                fill="var(--muted)"
                fontFamily="var(--font-mono)"
              >
                {node.label}
              </text>
            </g>
          );
        }

        return (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={7 + node.weight * 8}
              fill={SEVERITY_FILL[node.severity ?? "medium"] ?? "var(--amber)"}
              fillOpacity="0.18"
              stroke={SEVERITY_FILL[node.severity ?? "medium"] ?? "var(--amber)"}
              strokeWidth="1.2"
            />
            <circle
              cx={node.x}
              cy={node.y}
              r="2.2"
              fill={SEVERITY_FILL[node.severity ?? "medium"] ?? "var(--amber)"}
            />
            <text
              x={node.x}
              y={node.y - 16}
              textAnchor="middle"
              fontSize="10"
              fill="var(--ink)"
              fontFamily="var(--font-mono)"
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
