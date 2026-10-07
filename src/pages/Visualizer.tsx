import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';
import { useParams, Link } from 'react-router';
import { algorithms } from '../lib/algorithmData';

import {
  generateBubbleSortFrames,
  generateSelectionSortFrames,
  generateInsertionSortFrames,
  generateMergeSortFrames,
  generateQuickSortFrames,
  generateBinarySearchFrames,
  generateLinearSearchFrames,
  generateStackFrames,
  generateQueueFrames,
  generateLinkedListFrames,
  generateBSTFrames,
  generateBFSFrames,
  generateDFSFrames,
  generateFibonacciFrames,
  generateLCSFrames,
  generateTwoSumFrames,
  generateContainerWaterFrames,
  generateMinSubarrayFrames,
  generateKadaneFrames,
  generateSortColorsFrames,
  generateKthLargestFrames,
  generateProductExceptSelfFrames,
  generateNextGreaterFrames,
  generateShipCapacityFrames,
  generateTopoSortFrames,
  generateUnionFindFrames,
  generateDirectedCycleFrames,
  generateKnapsackFrames,
  generateHouseRobberFrames,
  generateLISFrames,
  randomGraph,
  randomString,
  nodeLabel,
  MAX_FIB_N,
  MAX_LCS_LEN,
  MAX_TREE_NODES,
  type ArrayFrame,
  type BinarySearchFrame,
  type LinearDSFrame,
  type LinkedListFrame,
  type TreeFrame,
  type GraphFrame,
  type GraphData,
  type DPFrame,
  type ElementState,
} from '../lib/algorithms';
import { stateColors } from '../lib/stateColors';
import { Legend, TreeView, GraphView, DPTableView } from '../components/Structureviews';
import { useProgress } from '../lib/useProgress';
import { markVisited, markCompleted, toggleFavorite } from '../lib/Progress';

const diffColor = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#ef4444',
};

function randomArray(
  n = 10,
  min = 10,
  max = 90
): number[] {
  return Array.from(
    { length: n },
    () =>
      Math.floor(
        Math.random() * (max - min + 1)
      ) + min
  );
}

type Frames =
  | ArrayFrame[]
  | BinarySearchFrame[]
  | LinearDSFrame[]
  | LinkedListFrame[]
  | TreeFrame[]
  | GraphFrame[]
  | DPFrame[];

/** Inputs that don't fit the plain "list of numbers" box. */
interface ExtraInput {
  graph: GraphData;
  start: number;
  fibN: number;
  s1: string;
  s2: string;
  k: number; // Kth Largest
  days: number; // Ship Capacity
  values: number[]; // Knapsack item values (paired with the main array as weights)
  capacity: number; // Knapsack capacity
}

const GRAPH_NODES = 8;

function randomExtra(): ExtraInput {
  return {
    graph: randomGraph(GRAPH_NODES),
    start: 0,
    fibN: 8 + Math.floor(Math.random() * 8),
    s1: randomString(6 + Math.floor(Math.random() * 2), 'ABCD'),
    s2: randomString(6 + Math.floor(Math.random() * 2), 'ABCD'),
    k: 2,
    days: 5,
    values: Array.from({ length: 6 }, () => 5 + Math.floor(Math.random() * 20)),
    capacity: 15,
  };
}

function getFrames(
  id: string,
  arr: number[],
  target: number,
  extra: ExtraInput
): Frames {
  switch (id) {
    case 'bubble-sort':
      return generateBubbleSortFrames(arr);
    case 'selection-sort':
      return generateSelectionSortFrames(arr);
    case 'insertion-sort':
      return generateInsertionSortFrames(arr);
    case 'merge-sort':
      return generateMergeSortFrames(arr);
    case 'quick-sort':
      return generateQuickSortFrames(arr);
    case 'binary-search':
      return generateBinarySearchFrames(arr, target);
    case 'linear-search':
      return generateLinearSearchFrames(arr, target);
    case 'stack':
      return generateStackFrames(arr);
    case 'queue':
      return generateQueueFrames(arr);
    case 'linked-list':
      return generateLinkedListFrames(arr);
    case 'bst':
      return generateBSTFrames(arr, target);
    case 'bfs':
      return generateBFSFrames(extra.graph, extra.start);
    case 'dfs':
      return generateDFSFrames(extra.graph, extra.start);
    case 'fibonacci':
      return generateFibonacciFrames(extra.fibN);
    case 'lcs':
      return generateLCSFrames(extra.s1, extra.s2);
    case 'two-sum':
      return generateTwoSumFrames(arr, target);
    case 'container-water':
      return generateContainerWaterFrames(arr);
    case 'min-subarray-sum':
      return generateMinSubarrayFrames(arr, target);
    case 'kadane':
      return generateKadaneFrames(arr);
    case 'sort-colors':
      return generateSortColorsFrames(arr);
    case 'kth-largest':
      return generateKthLargestFrames(arr, extra.k);
    case 'product-except-self':
      return generateProductExceptSelfFrames(arr);
    case 'next-greater-element':
      return generateNextGreaterFrames(arr);
    case 'ship-capacity':
      return generateShipCapacityFrames(arr, extra.days);
    case 'topo-sort':
      return generateTopoSortFrames(extra.graph);
    case 'union-find':
      return generateUnionFindFrames(extra.graph);
    case 'cycle-detect-directed':
      return generateDirectedCycleFrames(extra.graph);
    case 'knapsack':
      return generateKnapsackFrames(arr, extra.values, extra.capacity);
    case 'house-robber':
      return generateHouseRobberFrames(arr);
    case 'lis':
      return generateLISFrames(arr);
    default:
      return generateBubbleSortFrames(arr);
  }
}

function isBinaryFrame(
  f: any
): f is BinarySearchFrame {
  return !!f && 'left' in f && 'right' in f;
}

function isLinearDSFrame(
  f: any
): f is LinearDSFrame {
  return !!f && 'items' in f && 'pointers' in f;
}

function isLinkedListFrame(
  f: any
): f is LinkedListFrame {
  return !!f && 'nodes' in f && 'headIndex' in f;
}

function isTreeFrame(f: any): f is TreeFrame {
  return !!f && 'nodes' in f && 'root' in f;
}

function isGraphFrame(f: any): f is GraphFrame {
  return !!f && 'edgeStates' in f;
}

function isDPFrame(f: any): f is DPFrame {
  return !!f && 'cellStates' in f;
}

type FrameShape = 'bars' | 'binary' | 'linearDS' | 'linkedList' | 'tree' | 'graph' | 'dp' | 'none';

/**
 * Which renderer a frame belongs to. Checking the frame itself (not just the URL id)
 * avoids a crash for one render when you navigate between algorithms, because the
 * previous algorithm's frames are still in state until the effect regenerates them.
 */
function frameShape(f: unknown): FrameShape {
  if (!f) return 'none';
  if (isBinaryFrame(f)) return 'binary';
  if (isLinearDSFrame(f)) return 'linearDS';
  if (isTreeFrame(f)) return 'tree';
  if (isLinkedListFrame(f)) return 'linkedList';
  if (isGraphFrame(f)) return 'graph';
  if (isDPFrame(f)) return 'dp';
  return 'bars';
}

/** Colour key shown under the visualization, specific to each algorithm. */
function legendItems(id: string): [string, ElementState][] {
  switch (id) {
    case 'binary-search':
    case 'ship-capacity':
      return [['Normal', 'normal'], ['Active', 'active'], ['Comparing', 'comparing'], ['Target', 'target'], ['Eliminated', 'eliminated']];
    case 'linear-search':
      return [['Normal', 'normal'], ['Active', 'active'], ['Comparing', 'comparing'], ['Target Found', 'target'], ['Eliminated', 'eliminated']];
    case 'stack':
    case 'queue':
    case 'linked-list':
    case 'next-greater-element':
      return [['Normal', 'normal'], ['Active', 'active'], ['Comparing', 'comparing'], ['Eliminated', 'eliminated']];
    case 'quick-sort':
    case 'kth-largest':
      return [['Unsorted', 'normal'], ['Pivot', 'pivot'], ['Comparing', 'comparing'], ['≤ pivot', 'target'], ['Swapping', 'swapping'], ['Sorted', 'sorted'], ['Out of range', 'eliminated']];
    case 'merge-sort':
      return [['Left half', 'active'], ['Right half', 'target'], ['Comparing', 'comparing'], ['Merged', 'sorted'], ['Inactive', 'eliminated']];
    case 'bst':
      return [['Normal', 'normal'], ['Path', 'visited'], ['Comparing', 'comparing'], ['Inserted / visited', 'sorted'], ['Found', 'target']];
    case 'bfs':
      return [['Unvisited', 'normal'], ['In queue', 'visited'], ['Current', 'current'], ['Just discovered', 'target'], ['Done', 'sorted']];
    case 'dfs':
    case 'cycle-detect-directed':
      return [['Unvisited', 'normal'], ['On call stack', 'visited'], ['Current', 'current'], ['Checking', 'target'], ['Done', 'sorted']];
    case 'topo-sort':
      return [['Unscheduled', 'normal'], ['In queue (in-degree 0)', 'visited'], ['Scheduled', 'sorted']];
    case 'union-find':
      return [['Each color is one connected component', 'normal']];
    case 'fibonacci':
    case 'lis':
    case 'house-robber':
      return [['Not computed', 'eliminated'], ['Computed', 'normal'], ['Computing', 'active'], ['Uses', 'comparing'], ['Answer', 'target']];
    case 'lcs':
    case 'knapsack':
      return [['Not computed', 'eliminated'], ['Computed', 'normal'], ['Computing', 'active'], ['Compared', 'comparing'], ['Traceback', 'sorted']];
    default:
      return [['Normal', 'normal'], ['Active', 'active'], ['Comparing', 'comparing'], ['Swapping', 'swapping'], ['Sorted', 'sorted']];
  }
}

export default function Visualizer() {
  const { id = 'bubble-sort' } = useParams();

  const algo =
    algorithms.find((a) => a.id === id) ??
    algorithms[0];

  const [arr, setArr] = useState<number[]>(
    () => randomArray()
  );

  const [inputStr, setInputStr] = useState('');

  const [target, setTarget] = useState(42);

  const [frames, setFrames] = useState<Frames>([]);
  // Which algorithm the frames above were built for (they lag the URL by one render after navigating).
  const [framesFor, setFramesFor] = useState<string | null>(null);

  const progress = useProgress();
  const isFavorite = progress.favorites.includes(algo.id);
  const isCompleted = !!progress.completed[algo.id];

  const [frameIdx, setFrameIdx] = useState(0);

  const [playing, setPlaying] =
    useState(false);

  const [speed, setSpeed] = useState(500);

  const [codeOpen, setCodeOpen] =
    useState(true);

  const intervalRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  const [extra, setExtra] = useState<ExtraInput>(() => randomExtra());

  // rebuild() is memoised on `id`, so it reads the latest extra inputs through a ref.
  const extraRef = useRef(extra);
  extraRef.current = extra;

  const rebuild = useCallback(
    (a: number[], t: number, x?: ExtraInput) => {
      const f = getFrames(id, a, t, x ?? extraRef.current);

      setFrames(f);
      setFramesFor(id);
      setFrameIdx(0);
      setPlaying(false);
    },
    [id]
  );

  // Fresh random input whenever you open an algorithm or press "Random".
  const randomize = useCallback(() => {
    // Knapsack needs small weights relative to its capacity, or nothing fits and the demo looks broken.
    const a = id === 'knapsack' ? randomArray(6, 2, 10) : randomArray();
    const t = a[Math.floor(a.length / 2)];
    const x = randomExtra();
    if (id === 'knapsack') x.capacity = 15 + Math.floor(Math.random() * 10);

    setArr(a);
    setInputStr(a.join(', '));
    setTarget(t);
    setExtra(x);

    rebuild(a, t, x);
  }, [rebuild, id]);

  useEffect(() => {
    randomize();
  }, [randomize]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setFrameIdx((i) => {
          if (i >= frames.length - 1) {
            setPlaying(false);
            return i;
          }

          return i + 1;
        });
      }, speed);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [playing, speed, frames.length]);

  // Progress tracking: one visit each time you open an algorithm...
  const visitedRef = useRef<string | null>(null);
  useEffect(() => {
    if (algo.id === id && visitedRef.current !== id) {
      visitedRef.current = id;
      markVisited(id);
    }
  }, [id, algo.id]);

  // ...and it counts as completed once you reach the final step.
  useEffect(() => {
    if (framesFor === id && algo.id === id && frames.length > 1 && frameIdx === frames.length - 1) {
      markCompleted(id);
    }
  }, [framesFor, id, algo.id, frames.length, frameIdx]);

  const frame = frames[frameIdx] as
    | (
        ArrayFrame &
        BinarySearchFrame &
        LinearDSFrame &
        LinkedListFrame &
        TreeFrame &
        GraphFrame &
        DPFrame
      )
    | undefined;

  const isBinary = id === 'binary-search';
  const needsTarget =
    id === 'binary-search' ||
    id === 'linear-search' ||
    id === 'bst' ||
    id === 'two-sum' ||
    id === 'min-subarray-sum';
  const isStackQueue = id === 'stack' || id === 'queue';
  const isLinkedList = id === 'linked-list';
  // bfs/dfs additionally take a start node; the other whole-graph algorithms just take the graph itself.
  const isGraph = id === 'bfs' || id === 'dfs';
  const usesGraphInput = isGraph || id === 'topo-sort' || id === 'union-find' || id === 'cycle-detect-directed';
  const isFib = id === 'fibonacci';
  const isLCS = id === 'lcs';
  const isKthLargest = id === 'kth-largest';
  const isShipCapacity = id === 'ship-capacity';
  const isKnapsack = id === 'knapsack';
  const usesExtraInput = usesGraphInput || isFib || isLCS;

  const MAX_ARRAY_LEN = 20;

  const applyInput = () => {
    if (usesExtraInput) {
      rebuild(arr, target, extra);
      return;
    }

    const parsed = inputStr
      .split(/[\s,]+/)
      .filter((t) => t.length > 0)
      .map(Number)
      .filter((n) => Number.isFinite(n))
      .slice(0, MAX_ARRAY_LEN);

    if (parsed.length > 0) {
      setArr(parsed);
      setInputStr(parsed.join(', '));
      rebuild(parsed, target, extra);
    }
  };

  const updateExtra = (patch: Partial<ExtraInput>) => {
    const x = { ...extra, ...patch };
    setExtra(x);
    rebuild(arr, target, x);
  };

  const onEnter = (e: { key: string }) => {
    if (e.key === 'Enter') applyInput();
  };

  const inputStyle: CSSProperties = {
    background: 'var(--secondary)',
    border: '1px solid var(--border)',
    color: 'var(--foreground)',
  };

  const barValues =
    !isStackQueue && !isLinkedList
      ? frame?.array ?? arr
      : [];

  const maxVal = Math.max(
    ...(barValues.length
      ? barValues
      : [1]),
    1
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">

        <div>
          <div className="flex items-center gap-3 mb-1">

            <Link
              to="/algorithms"
              className="text-xs"
              style={{
                color:
                  'var(--muted-foreground)',
              }}
            >
              ← Algorithms
            </Link>

          </div>

          <div className="flex items-center gap-3">

            <h1 className="text-2xl font-bold">
              {algo.name}
            </h1>

            <span
              className="px-2 py-0.5 rounded text-xs font-medium mono"
              style={{
                background: `${diffColor[algo.difficulty]}18`,
                color:
                  diffColor[algo.difficulty],
              }}
            >
              {algo.difficulty}
            </span>

            <button
              onClick={() => toggleFavorite(algo.id)}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className="text-xl leading-none px-1"
              style={{
                color: isFavorite ? '#f59e0b' : 'var(--muted-foreground)',
                background: 'transparent',
              }}
            >
              {isFavorite ? '★' : '☆'}
            </button>

            {isCompleted && (
              <span className="text-xs" style={{ color: '#10b981' }}>
                ✓ Completed
              </span>
            )}

          </div>

          <p
            className="text-sm mt-1"
            style={{
              color:
                'var(--muted-foreground)',
            }}
          >
            {algo.description}
          </p>
        </div>

        <div className="flex gap-4 shrink-0">

          {[
            [
              'Avg',
              algo.timeComplexity.average,
            ],
            [
              'Space',
              algo.spaceComplexity,
            ],
          ].map(([label, value]) => (

            <div
              key={label}
              className="text-center"
            >
              <div
                className="text-xs"
                style={{
                  color:
                    'var(--muted-foreground)',
                }}
              >
                {label}
              </div>

              <div
                className="mono font-bold text-sm"
                style={{
                  color: 'var(--accent)',
                }}
              >
                {value}
              </div>
            </div>

          ))}

        </div>
      </div>

      {/* ================= MAIN GRID ================= */}

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">

        {/* ================= LEFT ================= */}

        <div className="flex flex-col gap-4">

          {/* ================= VISUALIZATION ================= */}

          <div
            className="rounded-xl p-5 flex flex-col gap-4"
            style={{
              background: 'var(--card)',
              border:
                '1px solid var(--border)',
              minHeight: 260,
            }}
          >

            {/* ================= ARRAY BARS ================= */}

            {frame &&
              frameShape(frame) === 'bars' && (

                <div
                  className="flex-1 flex items-end justify-center gap-1.5"
                  style={{ height: 200 }}
                >

                  {frame.array.map(
                    (val, i) => (

                      <div
                        key={i}
                        className="flex flex-col items-center gap-1 flex-1"
                        style={{
                          maxWidth: 60,
                        }}
                      >

                        <span
                          className="mono text-xs"
                          style={{
                            color:
                              'var(--muted-foreground)',
                            fontSize: 10,
                          }}
                        >
                          {val}
                        </span>

                        <div
                          className="w-full rounded-t-sm transition-all duration-200"
                          style={{
                            height: `${
                              (val / maxVal) *
                              160
                            }px`,
                            background:
                              stateColors[
                                frame.states[i]
                              ],
                            minHeight: 4,
                          }}
                        />

                        <span
                          className="mono text-xs"
                          style={{
                            color:
                              'var(--muted-foreground)',
                            fontSize: 9,
                          }}
                        >
                          {i}
                        </span>

                      </div>

                    )
                  )}

                </div>

              )}

            {/* ================= BINARY SEARCH ================= */}

            {isBinary &&
              frame &&
              isBinaryFrame(frame) && (

                <div className="flex flex-col gap-6 py-4">

                  <div className="flex items-center justify-center gap-1 flex-wrap">

                    {frame.array.map(
                      (val, i) => (

                        <div
                          key={i}
                          className="flex flex-col items-center gap-1"
                        >

                          <div
                            className="text-xs mono mb-1 h-4"
                            style={{
                              color:
                                'var(--accent)',
                            }}
                          >
                            {i === frame.left &&
                            i === frame.right
                              ? 'L/R'
                              : i === frame.left
                              ? 'L'
                              : i === frame.right
                              ? 'R'
                              : ''}
                          </div>

                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center mono font-bold text-sm transition-all duration-300"
                            style={{
                              background:
                                stateColors[
                                  frame.states[i]
                                ],
                              color:
                                frame.states[i] ===
                                'eliminated'
                                  ? '#374151'
                                  : 'white',
                              border:
                                i === frame.mid
                                  ? '2px solid var(--accent)'
                                  : '2px solid transparent',
                              transform:
                                i === frame.mid
                                  ? 'scale(1.15)'
                                  : 'scale(1)',
                            }}
                          >
                            {val}
                          </div>

                          <div
                            className="text-xs mono h-4"
                            style={{
                              color:
                                'var(--accent)',
                            }}
                          >
                            {i === frame.mid
                              ? 'M'
                              : ''}
                          </div>

                          <div
                            className="text-xs"
                            style={{
                              color:
                                'var(--muted-foreground)',
                              fontSize: 9,
                            }}
                          >
                            {i}
                          </div>

                        </div>

                      )
                    )}

                  </div>

                  <div
                    className="text-center text-sm mono"
                    style={{
                      color:
                        'var(--muted-foreground)',
                    }}
                  >
                    Target ={' '}
                    <span
                      style={{
                        color:
                          'var(--state-target)',
                      }}
                    >
                      {frame.target}
                    </span>
                  </div>

                </div>

              )}

            {/* ================= STACK / QUEUE ================= */}

            {isStackQueue &&
              frame &&
              isLinearDSFrame(frame) && (

                <div className="flex flex-col gap-6 py-4">

                  <div
                    className="flex items-center justify-center gap-2 flex-wrap"
                    style={{
                      minHeight: 90,
                    }}
                  >

                    {frame.items.length ===
                      0 && (
                      <span
                        className="text-sm"
                        style={{
                          color:
                            'var(--muted-foreground)',
                        }}
                      >
                        Empty
                      </span>
                    )}

                    {frame.items.map(
                      (val, i) => {

                        const labels =
                          frame.pointers
                            .filter(
                              (p) =>
                                p.index === i
                            )
                            .map(
                              (p) =>
                                p.label
                            );

                        return (
                          <div
                            key={i}
                            className="flex flex-col items-center gap-1"
                          >

                            <div
                              className="text-xs mono mb-1 h-4"
                              style={{
                                color:
                                  'var(--accent)',
                              }}
                            >
                              {labels.join(
                                ' / '
                              )}
                            </div>

                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center mono font-bold text-sm transition-all duration-300"
                              style={{
                                background:
                                  stateColors[
                                    frame
                                      .states[
                                      i
                                    ]
                                  ],
                                color: 'white',
                                border:
                                  labels.length
                                    ? '2px solid var(--accent)'
                                    : '2px solid transparent',
                              }}
                            >
                              {val}
                            </div>

                            <div
                              className="text-xs"
                              style={{
                                color:
                                  'var(--muted-foreground)',
                                fontSize: 9,
                              }}
                            >
                              {i}
                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                  {frame.operation && (
                    <div
                      className="text-center text-sm mono"
                      style={{
                        color:
                          'var(--muted-foreground)',
                      }}
                    >
                      Operation:{' '}
                      <span
                        style={{
                          color:
                            'var(--accent)',
                        }}
                      >
                        {frame.operation}
                      </span>
                    </div>
                  )}

                </div>

              )}

            {/* ================= LINKED LIST ================= */}

            {isLinkedList &&
              frame &&
              isLinkedListFrame(frame) && (

                <div className="flex flex-col gap-6 py-4">

                  <div
                    className="flex items-center justify-center gap-1 flex-wrap"
                    style={{
                      minHeight: 90,
                    }}
                  >

                    {frame.nodes.length ===
                      0 && (
                      <span
                        className="text-sm"
                        style={{
                          color:
                            'var(--muted-foreground)',
                        }}
                      >
                        Empty list
                      </span>
                    )}

                    {frame.nodes.map(
                      (node, i) => (

                        <div
                          key={i}
                          className="flex items-center"
                        >

                          <div className="flex flex-col items-center gap-1">

                            <div
                              className="text-xs mono mb-1 h-4"
                              style={{
                                color:
                                  'var(--accent)',
                              }}
                            >
                              {i ===
                              frame.headIndex
                                ? 'head'
                                : ''}
                            </div>

                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center mono font-bold text-sm transition-all duration-300"
                              style={{
                                background:
                                  stateColors[
                                    node.state
                                  ],
                                color: 'white',
                              }}
                            >
                              {node.value}
                            </div>

                          </div>

                          {i <
                            frame.nodes.length -
                              1 && (
                            <span
                              className="mx-1 text-lg"
                              style={{
                                color:
                                  'var(--muted-foreground)',
                              }}
                            >
                              →
                            </span>
                          )}

                        </div>

                      )
                    )}

                    {frame.nodes.length >
                      0 && (
                      <span
                        className="ml-1 text-xs mono"
                        style={{
                          color:
                            'var(--muted-foreground)',
                        }}
                      >
                        → null
                      </span>
                    )}

                  </div>

                </div>

              )}

            {/* ================= TREE / GRAPH / DP ================= */}

            {frame && isTreeFrame(frame) && <TreeView frame={frame} />}
            {frame && isGraphFrame(frame) && <GraphView frame={frame} />}
            {frame && isDPFrame(frame) && <DPTableView frame={frame} />}

            {/* ================= STATE LEGEND ================= */}

            <Legend items={legendItems(id)} />

          </div>

          {/* ================= CONTROLS ================= */}

          <div
            className="rounded-xl p-4 flex flex-col gap-4"
            style={{
              background: 'var(--card)',
              border:
                '1px solid var(--border)',
            }}
          >

            <div className="flex items-center justify-between flex-wrap gap-3">

              <div className="flex items-center gap-2">

                <button
                  onClick={() => {
                    setFrameIdx(0);
                    setPlaying(false);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{
                    background:
                      'var(--secondary)',
                    color:
                      'var(--foreground)',
                  }}
                  title="Restart"
                >
                  ⏮
                </button>

                <button
                  onClick={() =>
                    setFrameIdx((i) =>
                      Math.max(0, i - 1)
                    )
                  }
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{
                    background:
                      'var(--secondary)',
                    color:
                      'var(--foreground)',
                  }}
                  title="Previous"
                >
                  ◀
                </button>

                <button
                  onClick={() =>
                    {
                      if (!playing && frameIdx >= frames.length - 1) setFrameIdx(0);
                      setPlaying((p) => !p);
                    }
                  }
                  className="px-5 h-8 rounded-lg flex items-center gap-2 font-semibold text-sm"
                  style={{
                    background:
                      'var(--primary)',
                    color: 'white',
                  }}
                >
                  {playing
                    ? '⏸ Pause'
                    : '▶ Play'}
                </button>

                <button
                  onClick={() =>
                    setFrameIdx((i) =>
                      Math.min(
                        frames.length - 1,
                        i + 1
                      )
                    )
                  }
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{
                    background:
                      'var(--secondary)',
                    color:
                      'var(--foreground)',
                  }}
                  title="Next"
                >
                  ▶
                </button>

                <button
                  onClick={() => {
                    rebuild(arr, target);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-sm"
                  style={{
                    background:
                      'var(--secondary)',
                    color:
                      'var(--foreground)',
                  }}
                  title="Restart"
                >
                  ↺
                </button>

              </div>

              <div className="flex items-center gap-2">

                <span
                  className="text-xs"
                  style={{
                    color:
                      'var(--muted-foreground)',
                  }}
                >
                  Speed
                </span>

                <input
                  type="range"
                  min={100}
                  max={1500}
                  step={100}
                  value={speed}
                  onChange={(e) =>
                    setSpeed(
                      Number(e.target.value)
                    )
                  }
                  className="w-24 accent-purple-600"
                />

                <span
                  className="mono text-xs w-12"
                  style={{
                    color:
                      'var(--muted-foreground)',
                  }}
                >
                  {speed}ms
                </span>

              </div>

            </div>

            {/* ================= PROGRESS ================= */}

            <div>

              <div
                className="flex justify-between text-xs mb-1"
                style={{
                  color:
                    'var(--muted-foreground)',
                }}
              >

                <span>
                  Step {frameIdx + 1} /{' '}
                  {frames.length}
                </span>

                <span>
                  {frames.length > 0
                    ? Math.round(
                        ((frameIdx + 1) /
                          frames.length) *
                          100
                      )
                    : 0}
                  %
                </span>

              </div>

              <div className="progress-bar">

                <div
                  className="progress-fill"
                  style={{
                    width:
                      frames.length > 0
                        ? `${
                            ((frameIdx + 1) /
                              frames.length) *
                            100
                          }%`
                        : '0%',
                  }}
                />

              </div>

            </div>

            {/* ================= INPUT ================= */}

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">

              {usesGraphInput && isGraph && (
                <label
                  className="flex items-center gap-2 text-sm"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Start node
                  <select
                    value={extra.start}
                    onChange={(e) =>
                      updateExtra({ start: Number(e.target.value) })
                    }
                    className="px-3 py-1.5 rounded-lg text-sm mono outline-none"
                    style={inputStyle}
                  >
                    {Array.from({ length: extra.graph.n }, (_, i) => (
                      <option key={i} value={i}>
                        {nodeLabel(i)}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {isFib && (
                <label
                  className="flex items-center gap-2 text-sm"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  n =
                  <input
                    type="number"
                    min={1}
                    max={MAX_FIB_N}
                    value={extra.fibN}
                    onChange={(e) =>
                      setExtra({ ...extra, fibN: Number(e.target.value) })
                    }
                    onKeyDown={onEnter}
                    className="w-24 px-3 py-1.5 rounded-lg text-sm mono outline-none"
                    style={inputStyle}
                  />
                  <span className="text-xs">(1 to {MAX_FIB_N})</span>
                </label>
              )}

              {isLCS && (
                <>
                  <input
                    value={extra.s1}
                    onChange={(e) =>
                      setExtra({
                        ...extra,
                        s1: e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, MAX_LCS_LEN),
                      })
                    }
                    onKeyDown={onEnter}
                    placeholder="String 1, e.g. ABCBDAB"
                    aria-label="First string"
                    className="flex-1 px-3 py-1.5 rounded-lg text-sm mono outline-none"
                    style={inputStyle}
                  />
                  <input
                    value={extra.s2}
                    onChange={(e) =>
                      setExtra({
                        ...extra,
                        s2: e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, MAX_LCS_LEN),
                      })
                    }
                    onKeyDown={onEnter}
                    placeholder="String 2, e.g. BDCABA"
                    aria-label="Second string"
                    className="flex-1 px-3 py-1.5 rounded-lg text-sm mono outline-none"
                    style={inputStyle}
                  />
                </>
              )}

              {!usesExtraInput && (
                <input
                  value={inputStr}
                  onChange={(e) => setInputStr(e.target.value)}
                  onKeyDown={onEnter}
                  placeholder="e.g. 5, 2, 8, 1, 3"
                  aria-label="Input values"
                  className="flex-1 px-3 py-1.5 rounded-lg text-sm mono outline-none"
                  style={inputStyle}
                />
              )}

              {needsTarget && (
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  onKeyDown={onEnter}
                  placeholder="Target"
                  aria-label="Target value"
                  className="w-24 px-3 py-1.5 rounded-lg text-sm mono outline-none"
                  style={inputStyle}
                />
              )}

              {isKthLargest && (
                <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  k =
                  <input
                    type="number"
                    min={1}
                    value={extra.k}
                    onChange={(e) => updateExtra({ k: Math.max(1, Number(e.target.value)) })}
                    onKeyDown={onEnter}
                    className="w-16 px-3 py-1.5 rounded-lg text-sm mono outline-none"
                    style={inputStyle}
                  />
                </label>
              )}

              {isShipCapacity && (
                <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Days =
                  <input
                    type="number"
                    min={1}
                    value={extra.days}
                    onChange={(e) => updateExtra({ days: Math.max(1, Number(e.target.value)) })}
                    onKeyDown={onEnter}
                    className="w-16 px-3 py-1.5 rounded-lg text-sm mono outline-none"
                    style={inputStyle}
                  />
                </label>
              )}

              {isKnapsack && (
                <>
                  <input
                    value={extra.values.join(', ')}
                    onChange={(e) =>
                      setExtra({
                        ...extra,
                        values: e.target.value
                          .split(/[\s,]+/)
                          .filter((t: string) => t.length > 0)
                          .map(Number)
                          .filter((n: number) => Number.isFinite(n)),
                      })
                    }
                    onKeyDown={onEnter}
                    placeholder="Values, e.g. 10, 20, 15"
                    aria-label="Item values"
                    className="flex-1 px-3 py-1.5 rounded-lg text-sm mono outline-none"
                    style={inputStyle}
                  />
                  <label className="flex items-center gap-2 text-sm shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                    Capacity =
                    <input
                      type="number"
                      min={1}
                      value={extra.capacity}
                      onChange={(e) => setExtra({ ...extra, capacity: Math.max(1, Number(e.target.value)) })}
                      onKeyDown={onEnter}
                      className="w-16 px-3 py-1.5 rounded-lg text-sm mono outline-none"
                      style={inputStyle}
                    />
                  </label>
                </>
              )}

              {!usesGraphInput && (
                <button
                  onClick={applyInput}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium"
                  style={inputStyle}
                >
                  Apply
                </button>
              )}

              <button
                onClick={randomize}
                className="px-4 py-1.5 rounded-lg text-sm font-medium"
                style={inputStyle}
              >
                {usesGraphInput ? 'New graph' : 'Random'}
              </button>
            </div>

            {id === 'bst' && arr.length > MAX_TREE_NODES && (
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Only the first {MAX_TREE_NODES} values are used so the tree stays readable.
              </p>
            )}

            {/* ================= STATS ================= */}

            {frame && (
              <div
                className="flex gap-4 text-xs mono"
                style={{
                  color:
                    'var(--muted-foreground)',
                }}
              >

                {frame.comparisons !==
                  undefined && (
                  <span>
                    Comparisons:{' '}
                    <strong
                      style={{
                        color:
                          'var(--foreground)',
                      }}
                    >
                      {frame.comparisons}
                    </strong>
                  </span>
                )}

                {frame.swaps !==
                  undefined && (
                  <span>
                    Swaps:{' '}
                    <strong
                      style={{
                        color:
                          'var(--foreground)',
                      }}
                    >
                      {frame.swaps}
                    </strong>
                  </span>
                )}

              </div>
            )}

          </div>

          {/* ================= STEP EXPLANATION ================= */}

          {frame && (
            <div
              className="rounded-xl p-4"
              style={{
                background:
                  'var(--card)',
                border:
                  '1px solid var(--border)',
              }}
            >

              <div className="flex items-center justify-between mb-2">

                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color:
                      'var(--muted-foreground)',
                  }}
                >
                  Current Step
                </span>

                <span
                  className="mono text-xs"
                  style={{
                    color:
                      'var(--muted-foreground)',
                  }}
                >
                  {frameIdx + 1} /{' '}
                  {frames.length}
                </span>

              </div>

              <h3 className="font-semibold mb-1">
                {frame.stepTitle}
              </h3>

              <p
                className="text-sm leading-relaxed"
                style={{
                  color:
                    'var(--muted-foreground)',
                }}
              >
                {frame.explanation}
              </p>

              <div className="flex gap-2 mt-3">

                <button
                  onClick={() =>
                    setFrameIdx((i) =>
                      Math.max(0, i - 1)
                    )
                  }
                  className="px-3 py-1.5 rounded text-xs"
                  style={{
                    background:
                      'var(--secondary)',
                    color:
                      'var(--foreground)',
                  }}
                >
                  ← Prev
                </button>

                <button
                  onClick={() =>
                    setFrameIdx((i) =>
                      Math.min(
                        frames.length - 1,
                        i + 1
                      )
                    )
                  }
                  className="px-3 py-1.5 rounded text-xs"
                  style={{
                    background:
                      'var(--secondary)',
                    color:
                      'var(--foreground)',
                  }}
                >
                  Next →
                </button>

              </div>

            </div>
          )}

        </div>

        {/* ================= RIGHT PANEL ================= */}

        <div className="flex flex-col gap-4">

          {/* ================= COMPLEXITY ================= */}

          <div
            className="rounded-xl p-4"
            style={{
              background: 'var(--card)',
              border:
                '1px solid var(--border)',
            }}
          >

            <h3 className="text-sm font-semibold mb-3">
              Complexity
            </h3>

            <div className="space-y-3">

              <div>

                <p
                  className="text-xs mb-2"
                  style={{
                    color:
                      'var(--muted-foreground)',
                  }}
                >
                  Time Complexity
                </p>

                <div className="space-y-1.5">

                  {[
                    [
                      'Best',
                      algo.timeComplexity.best,
                      '#10b981',
                    ],
                    [
                      'Avg',
                      algo.timeComplexity
                        .average,
                      '#f59e0b',
                    ],
                    [
                      'Worst',
                      algo.timeComplexity.worst,
                      '#ef4444',
                    ],
                  ].map(
                    ([label, value, color]) => (

                      <div
                        key={label}
                        className="flex items-center justify-between"
                      >

                        <span
                          className="text-xs"
                          style={{
                            color:
                              'var(--muted-foreground)',
                          }}
                        >
                          {label}
                        </span>

                        <span
                          className="mono text-xs font-semibold"
                          style={{
                            color,
                          }}
                        >
                          {value}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

              <div
                className="h-px"
                style={{
                  background:
                    'var(--border)',
                }}
              />

              <div className="flex justify-between">

                <span
                  className="text-xs"
                  style={{
                    color:
                      'var(--muted-foreground)',
                  }}
                >
                  Space
                </span>

                <span
                  className="mono text-xs font-semibold"
                  style={{
                    color: 'var(--accent)',
                  }}
                >
                  {algo.spaceComplexity}
                </span>

              </div>

              <div className="flex justify-between">

                <span
                  className="text-xs"
                  style={{
                    color:
                      'var(--muted-foreground)',
                  }}
                >
                  Stable
                </span>

                <span
                  className="mono text-xs font-semibold"
                  style={{
                    color: algo.stable
                      ? '#10b981'
                      : '#ef4444',
                  }}
                >
                  {algo.stable
                    ? 'Yes'
                    : 'No'}
                </span>

              </div>

            </div>

          </div>

          {/* ================= PSEUDOCODE ================= */}

          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'var(--card)',
              border:
                '1px solid var(--border)',
            }}
          >

            <button
              onClick={() =>
                setCodeOpen((o) => !o)
              }
              className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold"
              style={{
                borderBottom: codeOpen
                  ? '1px solid var(--border)'
                  : 'none',
              }}
            >

              <span>
                Pseudocode
              </span>

              <span
                style={{
                  color:
                    'var(--muted-foreground)',
                }}
              >
                {codeOpen ? '▲' : '▼'}
              </span>

            </button>

            {codeOpen && (
              <div className="p-4">

                <pre
                  className="text-xs mono leading-relaxed"
                  style={{
                    color:
                      'var(--foreground)',
                  }}
                >

                  {algo.pseudocode.map(
                    (line, i) => (

                      <div
                        key={i}
                        className={`code-line${
                          frame &&
                          frame.codeLineIndex ===
                            i
                            ? ' active'
                            : ''
                        }`}
                      >

                        <span
                          style={{
                            color:
                              'var(--muted-foreground)',
                            userSelect:
                              'none',
                            marginRight: 8,
                            fontSize: 10,
                          }}
                        >
                          {String(i + 1).padStart(
                            2
                          )}
                        </span>

                        {line}

                      </div>

                    )
                  )}

                </pre>

              </div>
            )}

          </div>

          {/* ================= RELATED ALGORITHMS ================= */}

          <div
            className="rounded-xl p-4"
            style={{
              background: 'var(--card)',
              border:
                '1px solid var(--border)',
            }}
          >

            <h3 className="text-sm font-semibold mb-3">
              Related Algorithms
            </h3>

            <div className="flex flex-col gap-1">

              {algorithms
                .filter(
                  (a) =>
                    a.category ===
                      algo.category &&
                    a.id !== algo.id
                )
                .slice(0, 4)
                .map((a) => (

                  <Link
                    key={a.id}
                    to={`/visualizer/${a.id}`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80"
                    style={{
                      background:
                        'var(--secondary)',
                    }}
                  >

                    <span>
                      {a.name}
                    </span>

                    <span
                      className="mono text-xs"
                      style={{
                        color:
                          'var(--muted-foreground)',
                      }}
                    >
                      {
                        a.timeComplexity
                          .average
                      }
                    </span>

                  </Link>

                ))}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}