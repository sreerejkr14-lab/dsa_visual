import type { ReactNode } from 'react';
import type { DPFrame, ElementState, GraphFrame, TreeFrame } from '../lib/algorithms';
import { nodeLabel } from '../lib/algorithms';
import { stateColors } from '../lib/stateColors';

const muted = 'var(--muted-foreground)';
const lineColor = '#3b3b52';

/* ------------------------------------------------------------------ */
/* Legend                                                              */
/* ------------------------------------------------------------------ */

export function Legend({ items }: { items: [string, ElementState][] }) {
  return (
    <div className="flex flex-wrap gap-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
      {items.map(([label, state]) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: stateColors[state], border: '1px solid var(--border)' }} />
          <span className="text-xs" style={{ color: muted }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function Chip({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return (
    <span
      className="mono text-xs px-2 py-1 rounded-md"
      style={{
        background: 'var(--secondary)',
        color: accent ? 'var(--accent)' : 'var(--foreground)',
        border: '1px solid var(--border)',
      }}
    >
      {children}
    </span>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 flex-wrap" style={{ minHeight: 28 }}>
      <span className="text-xs" style={{ color: muted, minWidth: 130 }}>
        {label}
      </span>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Binary search tree                                                  */
/* ------------------------------------------------------------------ */

export function TreeView({ frame }: { frame: TreeFrame }) {
  const { nodes, root } = frame;

  if (root === -1 || nodes.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm" style={{ color: muted, minHeight: 160 }}>
        Empty tree
      </div>
    );
  }

  // In-order position gives x, depth gives y, so a BST never has crossing edges.
  const pos = new Map<number, { x: number; y: number }>();
  let counter = 0;
  let maxDepth = 0;
  const walk = (idx: number, depth: number) => {
    if (idx === -1) return;
    walk(nodes[idx].left, depth + 1);
    pos.set(idx, { x: counter++, y: depth });
    maxDepth = Math.max(maxDepth, depth);
    walk(nodes[idx].right, depth + 1);
  };
  walk(root, 0);

  const X = 48;
  const Y = 60;
  const PAD = 26;
  const R = 18;
  const width = counter * X + PAD;
  const height = maxDepth * Y + R * 2 + PAD;
  const cx = (i: number) => PAD / 2 + (pos.get(i)!.x + 0.5) * X;
  const cy = (i: number) => PAD / 2 + R + pos.get(i)!.y * Y;

  return (
    <div className="flex flex-col gap-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Binary search tree with ${nodes.length} nodes`}
        style={{ width: '100%', maxHeight: 340, minHeight: 160 }}
      >
        {nodes.map((n, i) =>
          [n.left, n.right]
            .filter((c) => c !== -1)
            .map((c) => (
              <line key={`${i}-${c}`} x1={cx(i)} y1={cy(i)} x2={cx(c)} y2={cy(c)} stroke={lineColor} strokeWidth={2} />
            ))
        )}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={cx(i)} cy={cy(i)} r={R} fill={stateColors[n.state]} style={{ transition: 'fill 0.25s' }} />
            <text
              x={cx(i)}
              y={cy(i)}
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize={n.value >= 100 ? 11 : 13}
              fontWeight={700}
              fontFamily="'JetBrains Mono', monospace"
            >
              {n.value}
            </text>
          </g>
        ))}
      </svg>

      {frame.output && (
        <Row label="In-order output">
          {frame.output.length === 0 ? (
            <span className="text-xs" style={{ color: muted }}>
              (nothing yet)
            </span>
          ) : (
            frame.output.map((v, i) => (
              <Chip key={i} accent>
                {v}
              </Chip>
            ))
          )}
        </Row>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Graph (BFS / DFS)                                                   */
/* ------------------------------------------------------------------ */

const edgeStyle = {
  normal: { stroke: lineColor, width: 2 },
  examining: { stroke: '#f59e0b', width: 4 },
  tree: { stroke: '#7c3aed', width: 4 },
} as const;

export function GraphView({ frame }: { frame: GraphFrame }) {
  const { n, edges, states, edgeStates } = frame;
  const W = 360;
  const H = 300;
  const r = 112;
  const pts = Array.from({ length: n }, (_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return { x: W / 2 + r * Math.cos(angle), y: H / 2 + r * Math.sin(angle) };
  });

  return (
    <div className="flex flex-col gap-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Graph with ${n} nodes and ${edges.length} edges`}
        style={{ width: '100%', maxHeight: 330, minHeight: 200 }}
      >
        {edges.map(([u, v], e) => {
          const s = edgeStyle[edgeStates[e]];
          return (
            <line
              key={e}
              x1={pts[u].x}
              y1={pts[u].y}
              x2={pts[v].x}
              y2={pts[v].y}
              stroke={s.stroke}
              strokeWidth={s.width}
              strokeLinecap="round"
              style={{ transition: 'stroke 0.25s' }}
            />
          );
        })}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={20} fill={stateColors[states[i]]} style={{ transition: 'fill 0.25s' }} />
            <text
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize={14}
              fontWeight={700}
              fontFamily="'JetBrains Mono', monospace"
            >
              {nodeLabel(i)}
            </text>
          </g>
        ))}
      </svg>

      <Row label={frame.structureLabel}>
        {frame.structure.length === 0 ? (
          <span className="text-xs" style={{ color: muted }}>
            empty
          </span>
        ) : (
          frame.structure.map((v, i) => <Chip key={`${v}-${i}`}>{nodeLabel(v)}</Chip>)
        )}
      </Row>
      <Row label="Visit order">
        {frame.order.length === 0 ? (
          <span className="text-xs" style={{ color: muted }}>
            (nothing yet)
          </span>
        ) : (
          frame.order.map((v, i) => (
            <Chip key={`${v}-${i}`} accent>
              {nodeLabel(v)}
            </Chip>
          ))
        )}
      </Row>
      <div className="flex gap-4 text-xs" style={{ color: muted }}>
        <span className="flex items-center gap-1.5">
          <span style={{ width: 16, height: 4, background: edgeStyle.tree.stroke, borderRadius: 2, display: 'inline-block' }} />
          Tree edge
        </span>
        <span className="flex items-center gap-1.5">
          <span style={{ width: 16, height: 4, background: edgeStyle.examining.stroke, borderRadius: 2, display: 'inline-block' }} />
          Being checked
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* DP table (Fibonacci / LCS)                                          */
/* ------------------------------------------------------------------ */

export function DPTableView({ frame }: { frame: DPFrame }) {
  const { table, rowLabels, colLabels, cellStates } = frame;

  if (table.length === 0) {
    return null;
  }

  const labelCell = (text: string, highlighted: boolean) => (
    <td
      className="mono text-xs"
      style={{
        padding: '4px 10px',
        textAlign: 'center',
        fontWeight: 700,
        color: highlighted ? 'var(--accent)' : muted,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </td>
  );

  return (
    <div className="flex flex-col gap-3">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 3, margin: '0 auto' }} aria-label="Dynamic programming table">
          <tbody>
            <tr>
              {labelCell('', false)}
              {colLabels.map((label, j) => (
                <td key={j}>
                  <div
                    className="mono text-xs"
                    style={{
                      textAlign: 'center',
                      fontWeight: 700,
                      padding: '4px 0',
                      color: frame.highlightCol === j ? 'var(--accent)' : muted,
                    }}
                  >
                    {label === '' ? '∅' : label}
                  </div>
                </td>
              ))}
            </tr>
            {table.map((row, i) => (
              <tr key={i}>
                {labelCell(rowLabels[i] === '' ? '∅' : rowLabels[i], frame.highlightRow === i)}
                {row.map((val, j) => (
                  <td
                    key={j}
                    className="mono"
                    style={{
                      minWidth: 40,
                      height: 38,
                      textAlign: 'center',
                      fontSize: 13,
                      fontWeight: 700,
                      borderRadius: 6,
                      color: cellStates[i][j] === 'eliminated' ? '#374151' : 'white',
                      background: stateColors[cellStates[i][j]],
                      transition: 'background 0.25s',
                    }}
                  >
                    {val === null ? '' : val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {frame.result !== undefined && (
        <Row label={frame.resultLabel ?? 'Result'}>
          <Chip accent>{frame.result === '' ? '—' : frame.result}</Chip>
        </Row>
      )}
    </div>
  );
}