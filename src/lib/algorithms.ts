export type ElementState = 'normal' | 'comparing' | 'swapping' | 'sorted' | 'active' | 'target' | 'eliminated' | 'visited' | 'pivot' | 'current';

export interface ArrayFrame {
  array: number[];
  states: ElementState[];
  stepTitle: string;
  explanation: string;
  codeLineIndex: number;
  comparisons?: number;
  swaps?: number;
}

export function generateBubbleSortFrames(arr: number[]): ArrayFrame[] {
  const frames: ArrayFrame[] = [];
  const a = [...arr];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;
  const sorted = new Set<number>();

  frames.push({
    array: [...a],
    states: a.map(() => 'normal'),
    stepTitle: 'Initial Array',
    explanation: `Starting Bubble Sort on [${a.join(', ')}]. We will compare adjacent elements and bubble larger ones to the end.`,
    codeLineIndex: 0,
    comparisons: 0,
    swaps: 0,
  });

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      const states: ElementState[] = a.map((_, idx) => {
        if (sorted.has(idx)) return 'sorted';
        if (idx === j || idx === j + 1) return 'comparing';
        return 'normal';
      });

      frames.push({
        array: [...a],
        states,
        stepTitle: `Comparing ${a[j]} and ${a[j + 1]}`,
        explanation: `Comparing a[${j}]=${a[j]} and a[${j+1}]=${a[j+1]}. ${a[j] > a[j+1] ? `${a[j]} > ${a[j+1]}, so we need to swap.` : `${a[j]} ≤ ${a[j+1]}, no swap needed.`}`,
        codeLineIndex: 2,
        comparisons,
        swaps,
      });

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swaps++;
        const swapStates: ElementState[] = a.map((_, idx) => {
          if (sorted.has(idx)) return 'sorted';
          if (idx === j || idx === j + 1) return 'swapping';
          return 'normal';
        });
        frames.push({
          array: [...a],
          states: swapStates,
          stepTitle: `Swapped positions ${j} and ${j + 1}`,
          explanation: `Swapped elements. Array is now [${a.join(', ')}].`,
          codeLineIndex: 3,
          comparisons,
          swaps,
        });
      }
    }
    sorted.add(n - 1 - i);
    const sortedStates: ElementState[] = a.map((_, idx) => (sorted.has(idx) ? 'sorted' : 'normal'));
    frames.push({
      array: [...a],
      states: sortedStates,
      stepTitle: `Pass ${i + 1} complete`,
      explanation: `Element ${a[n - 1 - i]} is now in its correct sorted position at index ${n - 1 - i}.`,
      codeLineIndex: 4,
      comparisons,
      swaps,
    });
  }
  sorted.add(0);
  frames.push({
    array: [...a],
    states: a.map(() => 'sorted'),
    stepTitle: 'Array Sorted!',
    explanation: `Bubble Sort complete. Final array: [${a.join(', ')}]. Total comparisons: ${comparisons}, swaps: ${swaps}.`,
    codeLineIndex: 0,
    comparisons,
    swaps,
  });
  return frames;
}

export function generateSelectionSortFrames(arr: number[]): ArrayFrame[] {
  const frames: ArrayFrame[] = [];
  const a = [...arr];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;
  const sorted = new Set<number>();

  frames.push({
    array: [...a],
    states: a.map(() => 'normal'),
    stepTitle: 'Initial Array',
    explanation: `Starting Selection Sort. In each pass, we find the minimum element and place it at the correct position.`,
    codeLineIndex: 0,
    comparisons: 0,
    swaps: 0,
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    frames.push({
      array: [...a],
      states: a.map((_, idx) => (sorted.has(idx) ? 'sorted' : idx === i ? 'active' : 'normal')),
      stepTitle: `Finding minimum from index ${i}`,
      explanation: `Looking for the minimum element starting at index ${i}. Current minimum: ${a[minIdx]}.`,
      codeLineIndex: 1,
      comparisons,
      swaps,
    });

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      frames.push({
        array: [...a],
        states: a.map((_, idx) => {
          if (sorted.has(idx)) return 'sorted';
          if (idx === j) return 'comparing';
          if (idx === minIdx) return 'active';
          return 'normal';
        }),
        stepTitle: `Comparing ${a[j]} with current min ${a[minIdx]}`,
        explanation: `a[${j}]=${a[j]} vs current min a[${minIdx}]=${a[minIdx]}. ${a[j] < a[minIdx] ? `${a[j]} is smaller — new minimum found!` : `${a[minIdx]} is still the minimum.`}`,
        codeLineIndex: 3,
        comparisons,
        swaps,
      });

      if (a[j] < a[minIdx]) minIdx = j;
    }

    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      swaps++;
      frames.push({
        array: [...a],
        states: a.map((_, idx) => {
          if (sorted.has(idx)) return 'sorted';
          if (idx === i || idx === minIdx) return 'swapping';
          return 'normal';
        }),
        stepTitle: `Placed ${a[i]} at position ${i}`,
        explanation: `Swapped minimum ${a[i]} to position ${i}.`,
        codeLineIndex: 5,
        comparisons,
        swaps,
      });
    }
    sorted.add(i);
  }
  sorted.add(n - 1);
  frames.push({
    array: [...a],
    states: a.map(() => 'sorted'),
    stepTitle: 'Array Sorted!',
    explanation: `Selection Sort complete. Final array: [${a.join(', ')}]. Comparisons: ${comparisons}, swaps: ${swaps}.`,
    codeLineIndex: 0,
    comparisons,
    swaps,
  });
  return frames;
}

export function generateInsertionSortFrames(arr: number[]): ArrayFrame[] {
  const frames: ArrayFrame[] = [];
  const a = [...arr];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;

  frames.push({
    array: [...a],
    states: a.map((_, i) => (i === 0 ? 'sorted' : 'normal')),
    stepTitle: 'Initial Array',
    explanation: `Starting Insertion Sort. The first element is already "sorted". We insert each remaining element into its correct position.`,
    codeLineIndex: 0,
    comparisons: 0,
    swaps: 0,
  });

  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    frames.push({
      array: [...a],
      states: a.map((_, idx) => (idx < i ? 'sorted' : idx === i ? 'active' : 'normal')),
      stepTitle: `Inserting ${key}`,
      explanation: `Picking up element ${key} from position ${i} and finding its correct position in the sorted portion.`,
      codeLineIndex: 1,
      comparisons,
      swaps,
    });

    while (j >= 0 && a[j] > key) {
      comparisons++;
      a[j + 1] = a[j];
      swaps++;
      frames.push({
        array: [...a],
        states: a.map((_, idx) => {
          if (idx < i && idx !== j + 1) return 'sorted';
          if (idx === j) return 'comparing';
          if (idx === j + 1) return 'swapping';
          return 'normal';
        }),
        stepTitle: `Shifting ${a[j]} right`,
        explanation: `${a[j]} > ${key}, shifting ${a[j]} from position ${j} to ${j + 1}.`,
        codeLineIndex: 4,
        comparisons,
        swaps,
      });
      j--;
    }
    a[j + 1] = key;
    frames.push({
      array: [...a],
      states: a.map((_, idx) => (idx <= i ? 'sorted' : 'normal')),
      stepTitle: `Inserted ${key} at position ${j + 1}`,
      explanation: `${key} placed at position ${j + 1}. Sorted portion is now [${a.slice(0, i + 1).join(', ')}].`,
      codeLineIndex: 6,
      comparisons,
      swaps,
    });
  }
  frames.push({
    array: [...a],
    states: a.map(() => 'sorted'),
    stepTitle: 'Array Sorted!',
    explanation: `Insertion Sort complete. Final: [${a.join(', ')}]. Comparisons: ${comparisons}, shifts: ${swaps}.`,
    codeLineIndex: 0,
    comparisons,
    swaps,
  });
  return frames;
}

export interface BinarySearchFrame {
  array: number[];
  left: number;
  right: number;
  mid: number;
  target: number;
  states: ElementState[];
  stepTitle: string;
  explanation: string;
  codeLineIndex: number;
  found: boolean;
}

export function generateBinarySearchFrames(arr: number[], target: number): BinarySearchFrame[] {
  const frames: BinarySearchFrame[] = [];
  const a = [...arr].sort((x, y) => x - y);

  const makeStates = (left: number, right: number, mid: number): ElementState[] =>
    a.map((_, i) => {
      if (i < left || i > right) return 'eliminated';
      if (i === mid) return 'target';
      return 'normal';
    });

  frames.push({
    array: a,
    left: 0,
    right: a.length - 1,
    mid: -1,
    target,
    states: a.map(() => 'normal'),
    stepTitle: 'Initial sorted array',
    explanation: `Searching for target = ${target} in sorted array [${a.join(', ')}].`,
    codeLineIndex: 0,
    found: false,
  });

  let left = 0;
  let right = a.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    frames.push({
      array: a,
      left,
      right,
      mid,
      target,
      states: makeStates(left, right, mid),
      stepTitle: `mid = ${mid}, a[mid] = ${a[mid]}`,
      explanation: `left=${left}, right=${right}. mid = (${left}+${right})/2 = ${mid}. a[mid] = ${a[mid]}.`,
      codeLineIndex: 2,
      found: false,
    });

    if (a[mid] === target) {
      frames.push({
        array: a,
        left,
        right,
        mid,
        target,
        states: a.map((_, i) => (i === mid ? 'sorted' : 'eliminated')),
        stepTitle: `Found ${target} at index ${mid}!`,
        explanation: `a[${mid}] = ${a[mid]} == ${target}. Target found at index ${mid}!`,
        codeLineIndex: 3,
        found: true,
      });
      return frames;
    } else if (a[mid] < target) {
      frames.push({
        array: a,
        left: mid + 1,
        right,
        mid,
        target,
        states: a.map((_, i) => {
          if (i <= mid) return 'eliminated';
          if (i > right) return 'eliminated';
          return 'normal';
        }),
        stepTitle: `${a[mid]} < ${target} — search right half`,
        explanation: `a[mid]=${a[mid]} < ${target}. Target is in the right half. Set left = ${mid + 1}.`,
        codeLineIndex: 4,
        found: false,
      });
      left = mid + 1;
    } else {
      frames.push({
        array: a,
        left,
        right: mid - 1,
        mid,
        target,
        states: a.map((_, i) => {
          if (i >= mid) return 'eliminated';
          if (i < left) return 'eliminated';
          return 'normal';
        }),
        stepTitle: `${a[mid]} > ${target} — search left half`,
        explanation: `a[mid]=${a[mid]} > ${target}. Target is in the left half. Set right = ${mid - 1}.`,
        codeLineIndex: 5,
        found: false,
      });
      right = mid - 1;
    }
  }

  frames.push({
    array: a,
    left,
    right,
    mid: -1,
    target,
    states: a.map(() => 'eliminated'),
    stepTitle: `${target} not found`,
    explanation: `Search space exhausted (left=${left} > right=${right}). Target ${target} is not in the array.`,
    codeLineIndex: 6,
    found: false,
  });
  return frames;
}

export function generateQuickSortFrames(arr: number[]): ArrayFrame[] {
  const frames: ArrayFrame[] = [];
  const a = [...arr];
  const done = new Set<number>();
  let comparisons = 0;
  let swaps = 0;

  const push = (states: ElementState[], stepTitle: string, explanation: string, codeLineIndex: number) => {
    frames.push({ array: [...a], states, stepTitle, explanation, codeLineIndex, comparisons, swaps });
  };

  // Finished elements are green, elements outside the range being partitioned are dimmed.
  const paint = (low: number, high: number, over: Record<number, ElementState> = {}): ElementState[] =>
    a.map((_, idx) => over[idx] ?? (done.has(idx) ? 'sorted' : idx < low || idx > high ? 'eliminated' : 'normal'));

  push(
    a.map(() => 'normal'),
    'Initial Array',
    `Starting Quick Sort on [${a.join(', ')}]. We pick a pivot, partition the array around it, then repeat on each side.`,
    0
  );

  function partition(low: number, high: number): number {
    const pivot = a[high];
    push(
      paint(low, high, { [high]: 'pivot' }),
      `Pivot = ${pivot}`,
      `Partitioning a[${low}..${high}]. The last element, a[${high}] = ${pivot}, is the pivot. Everything ≤ ${pivot} will be collected on the left.`,
      6
    );

    let i = low - 1;
    for (let j = low; j < high; j++) {
      comparisons++;
      const smaller = a[j] <= pivot;
      const lowGroup: Record<number, ElementState> = { [high]: 'pivot' };
      for (let k = low; k <= i; k++) lowGroup[k] = 'target';
      push(
        paint(low, high, { ...lowGroup, [j]: 'comparing' }),
        `Compare ${a[j]} with pivot ${pivot}`,
        smaller
          ? `a[${j}] = ${a[j]} ≤ ${pivot}, so it joins the "≤ pivot" group. i moves to ${i + 1}${
              i + 1 !== j ? `, and a[${i + 1}] swaps with a[${j}].` : '; it is already in the right place.'
            }`
          : `a[${j}] = ${a[j]} > ${pivot}, so it stays in the "> pivot" group. i stays at ${i}.`,
        9
      );

      if (smaller) {
        i++;
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          swaps++;
          const grouped: Record<number, ElementState> = { [high]: 'pivot' };
          for (let k = low; k < i; k++) grouped[k] = 'target';
          push(
            paint(low, high, { ...grouped, [i]: 'swapping', [j]: 'swapping' }),
            `Swap positions ${i} and ${j}`,
            `Swapped a[${i}] and a[${j}]. The current range is now [${a.slice(low, high + 1).join(', ')}].`,
            10
          );
        }
      }
    }

    const p = i + 1;
    const moved = p !== high;
    if (moved) {
      [a[p], a[high]] = [a[high], a[p]];
      swaps++;
    }
    done.add(p);
    push(
      paint(low, high, moved ? { [high]: 'swapping' } : {}),
      `Pivot ${pivot} placed at index ${p}`,
      `${moved ? `Swapped the pivot into position ${p}. ` : ''}${pivot} is now exactly where it belongs: everything to its left is ≤ ${pivot}, everything to its right is larger.`,
      11
    );
    return p;
  }

  function quickSort(low: number, high: number) {
    if (low < high) {
      const p = partition(low, high);
      quickSort(low, p - 1);
      quickSort(p + 1, high);
    } else if (low === high) {
      done.add(low);
    }
  }

  quickSort(0, a.length - 1);
  frames.push({
    array: [...a],
    states: a.map(() => 'sorted'),
    stepTitle: 'Array Sorted!',
    explanation: `Quick Sort complete. Final: [${a.join(', ')}]. Comparisons: ${comparisons}, swaps: ${swaps}.`,
    codeLineIndex: 0,
    comparisons,
    swaps,
  });
  return frames;
}

export function generateMergeSortFrames(arr: number[]): ArrayFrame[] {
  const frames: ArrayFrame[] = [];
  const a = [...arr];
  let comparisons = 0;

  frames.push({
    array: [...a],
    states: a.map(() => 'normal'),
    stepTitle: 'Initial Array',
    explanation: `Starting Merge Sort on [${a.join(', ')}]. We split the array in half, sort each half, then merge the two sorted halves.`,
    codeLineIndex: 0,
    comparisons: 0,
  });

  function mergeSort(left: number, right: number) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    frames.push({
      array: [...a],
      states: a.map((_, i) => (i < left || i > right ? 'eliminated' : i <= mid ? 'active' : 'target')),
      stepTitle: `Split [${left}..${right}] at mid=${mid}`,
      explanation: `Splitting [${a.slice(left, right + 1).join(', ')}] into a left half [${a
        .slice(left, mid + 1)
        .join(', ')}] and a right half [${a.slice(mid + 1, right + 1).join(', ')}].`,
      codeLineIndex: 2,
      comparisons,
    });
    mergeSort(left, mid);
    mergeSort(mid + 1, right);
    merge(left, mid, right);
  }

  function merge(left: number, mid: number, right: number) {
    const L = a.slice(left, mid + 1);
    const R = a.slice(mid + 1, right + 1);
    const merged: number[] = [];
    let i = 0;
    let j = 0;

    // While merging, the range shows: merged output so far, then the rest of L, then the rest of R.
    const withRange = () => {
      const view = [...a];
      [...merged, ...L.slice(i), ...R.slice(j)].forEach((v, k) => {
        view[left + k] = v;
      });
      return view;
    };

    while (i < L.length && j < R.length) {
      comparisons++;
      const leftHead = left + merged.length;
      const rightHead = leftHead + (L.length - i);
      const takeLeft = L[i] <= R[j];
      frames.push({
        array: withRange(),
        states: a.map((_, idx) => {
          if (idx < left || idx > right) return 'eliminated';
          if (idx === leftHead || idx === rightHead) return 'comparing';
          if (idx < leftHead) return 'sorted';
          return idx < rightHead ? 'active' : 'target';
        }),
        stepTitle: `Compare ${L[i]} and ${R[j]}`,
        explanation: `Front of left half = ${L[i]}, front of right half = ${R[j]}. ${
          takeLeft ? `${L[i]} ≤ ${R[j]}, so ${L[i]} goes next.` : `${R[j]} < ${L[i]}, so ${R[j]} goes next.`
        }`,
        codeLineIndex: 5,
        comparisons,
      });
      merged.push(takeLeft ? L[i++] : R[j++]);
    }
    while (i < L.length) merged.push(L[i++]);
    while (j < R.length) merged.push(R[j++]);
    merged.forEach((v, k) => {
      a[left + k] = v;
    });

    frames.push({
      array: [...a],
      states: a.map((_, idx) => (idx < left || idx > right ? 'eliminated' : 'sorted')),
      stepTitle: `Merged [${left}..${right}]`,
      explanation: `Both halves are used up (any leftovers are copied over). The range is now sorted: [${a
        .slice(left, right + 1)
        .join(', ')}].`,
      codeLineIndex: 5,
      comparisons,
    });
  }

  mergeSort(0, a.length - 1);
  frames.push({
    array: [...a],
    states: a.map(() => 'sorted'),
    stepTitle: 'Array Sorted!',
    explanation: `Merge Sort complete. Final: [${a.join(', ')}]. Comparisons: ${comparisons}.`,
    codeLineIndex: 0,
    comparisons,
  });
  return frames;
}

export function generateLinearSearchFrames(arr: number[], target: number): ArrayFrame[] {
  const frames: ArrayFrame[] = [];
  const a = [...arr];
  let comparisons = 0;

  frames.push({
    array: [...a],
    states: a.map(() => 'normal'),
    stepTitle: 'Initial Array',
    explanation: `Searching for target = ${target} in [${a.join(', ')}] by checking each element from left to right.`,
    codeLineIndex: 0,
    comparisons: 0,
  });

  for (let i = 0; i < a.length; i++) {
    comparisons++;
    const found = a[i] === target;
    frames.push({
      array: [...a],
      states: a.map((_, idx) => {
        if (idx < i) return 'eliminated';
        if (idx === i) return found ? 'target' : 'comparing';
        return 'normal';
      }),
      stepTitle: `Checking index ${i}`,
      explanation: `a[${i}] = ${a[i]}. ${found ? `Match! ${a[i]} == ${target}.` : `${a[i]} ≠ ${target}, moving to next index.`}`,
      codeLineIndex: 1,
      comparisons,
    });
    if (found) {
      frames.push({
        array: [...a],
        states: a.map((_, idx) => (idx === i ? 'sorted' : 'eliminated')),
        stepTitle: `Found ${target} at index ${i}!`,
        explanation: `Target ${target} found at index ${i} after checking ${comparisons} element(s).`,
        codeLineIndex: 2,
        comparisons,
      });
      return frames;
    }
  }

  frames.push({
    array: [...a],
    states: a.map(() => 'eliminated'),
    stepTitle: `${target} not found`,
    explanation: `Checked all ${a.length} elements. Target ${target} is not in the array.`,
    codeLineIndex: 3,
    comparisons,
  });
  return frames;
}

export interface LinearDSFrame {
  items: number[];
  states: ElementState[];
  pointers: { label: string; index: number }[];
  stepTitle: string;
  explanation: string;
  codeLineIndex: number;
  operation: string;
}

export function generateStackFrames(arr: number[]): LinearDSFrame[] {
  const frames: LinearDSFrame[] = [];
  const stack: number[] = [];

  frames.push({
    items: [],
    states: [],
    pointers: [],
    stepTitle: 'Empty Stack',
    explanation: 'Starting with an empty stack. We will push each value, then pop them all off in LIFO order.',
    codeLineIndex: 0,
    operation: 'init',
  });

  for (const val of arr) {
    stack.push(val);
    frames.push({
      items: [...stack],
      states: stack.map((_, i) => (i === stack.length - 1 ? 'active' : 'normal')),
      pointers: [{ label: 'top', index: stack.length - 1 }],
      stepTitle: `Push ${val}`,
      explanation: `Pushed ${val} onto the stack. Top is now at index ${stack.length - 1}.`,
      codeLineIndex: 0,
      operation: 'push',
    });
  }

  while (stack.length > 0) {
    const top = stack[stack.length - 1];
    frames.push({
      items: [...stack],
      states: stack.map((_, i) => (i === stack.length - 1 ? 'comparing' : 'normal')),
      pointers: [{ label: 'top', index: stack.length - 1 }],
      stepTitle: `Pop ${top}`,
      explanation: `Popping the top element, ${top}, off the stack.`,
      codeLineIndex: 1,
      operation: 'pop',
    });
    stack.pop();
    frames.push({
      items: [...stack],
      states: stack.map((_, i) => (i === stack.length - 1 ? 'active' : 'normal')),
      pointers: stack.length ? [{ label: 'top', index: stack.length - 1 }] : [],
      stepTitle: `Popped ${top}`,
      explanation: `${top} removed. ${stack.length ? `New top is ${stack[stack.length - 1]}.` : 'Stack is now empty.'}`,
      codeLineIndex: 1,
      operation: 'pop',
    });
  }

  frames.push({
    items: [],
    states: [],
    pointers: [],
    stepTitle: 'Stack Empty',
    explanation: 'All elements have been popped. Stack is empty.',
    codeLineIndex: 2,
    operation: 'done',
  });

  return frames;
}

export function generateQueueFrames(arr: number[]): LinearDSFrame[] {
  const frames: LinearDSFrame[] = [];
  const queue: number[] = [];

  frames.push({
    items: [],
    states: [],
    pointers: [],
    stepTitle: 'Empty Queue',
    explanation: 'Starting with an empty queue. We will enqueue each value, then dequeue them all in FIFO order.',
    codeLineIndex: 0,
    operation: 'init',
  });

  for (const val of arr) {
    queue.push(val);
    frames.push({
      items: [...queue],
      states: queue.map((_, i) => (i === queue.length - 1 ? 'active' : 'normal')),
      pointers: [
        { label: 'front', index: 0 },
        { label: 'rear', index: queue.length - 1 },
      ],
      stepTitle: `Enqueue ${val}`,
      explanation: `Enqueued ${val} at the rear (index ${queue.length - 1}).`,
      codeLineIndex: 0,
      operation: 'enqueue',
    });
  }

  while (queue.length > 0) {
    const front = queue[0];
    frames.push({
      items: [...queue],
      states: queue.map((_, i) => (i === 0 ? 'comparing' : 'normal')),
      pointers: [
        { label: 'front', index: 0 },
        { label: 'rear', index: queue.length - 1 },
      ],
      stepTitle: `Dequeue ${front}`,
      explanation: `Dequeuing the front element, ${front}.`,
      codeLineIndex: 1,
      operation: 'dequeue',
    });
    queue.shift();
    frames.push({
      items: [...queue],
      states: queue.map((_, i) => (i === 0 ? 'active' : 'normal')),
      pointers: queue.length
        ? [{ label: 'front', index: 0 }, { label: 'rear', index: queue.length - 1 }]
        : [],
      stepTitle: `Dequeued ${front}`,
      explanation: `${front} removed. ${queue.length ? `New front is ${queue[0]}.` : 'Queue is now empty.'}`,
      codeLineIndex: 1,
      operation: 'dequeue',
    });
  }

  frames.push({
    items: [],
    states: [],
    pointers: [],
    stepTitle: 'Queue Empty',
    explanation: 'All elements have been dequeued. Queue is empty.',
    codeLineIndex: 2,
    operation: 'done',
  });

  return frames;
}

export interface LinkedListFrame {
  nodes: { value: number; state: ElementState }[];
  headIndex: number;
  stepTitle: string;
  explanation: string;
  codeLineIndex: number;
}

export function generateLinkedListFrames(arr: number[]): LinkedListFrame[] {
  const frames: LinkedListFrame[] = [];
  const list: number[] = [];

  frames.push({
    nodes: [],
    headIndex: -1,
    stepTitle: 'Empty List',
    explanation: 'Starting with an empty linked list. We will insert each value at the front (head), then delete one.',
    codeLineIndex: 0,
  });

  for (const val of arr) {
    list.unshift(val);
    frames.push({
      nodes: list.map((v, i) => ({ value: v, state: (i === 0 ? 'active' : 'normal') as ElementState })),
      headIndex: 0,
      stepTitle: `Insert ${val} at front`,
      explanation: `Created new node ${val}, pointed its next to the old head, and set head to the new node.`,
      codeLineIndex: 0,
    });
  }

  if (list.length > 0) {
    const target = list[list.length - 1];
    for (let i = 0; i < list.length; i++) {
      frames.push({
        nodes: list.map((v, idx) => ({
          value: v,
          state: (idx < i ? 'eliminated' : idx === i ? 'comparing' : 'normal') as ElementState,
        })),
        headIndex: 0,
        stepTitle: `Searching for ${target}`,
        explanation: `Traversing from head: checking node ${list[i]}. ${list[i] === target ? 'Match found!' : 'Not a match, continue to next node.'}`,
        codeLineIndex: 1,
      });
      if (list[i] === target) break;
    }
    list.pop();
    frames.push({
      nodes: list.map((v) => ({ value: v, state: 'normal' as ElementState })),
      headIndex: list.length ? 0 : -1,
      stepTitle: `Deleted ${target}`,
      explanation: `Found ${target}, updated the previous node's next pointer to skip over it, removing it from the list.`,
      codeLineIndex: 1,
    });
  }

  return frames;
}

// ---------------------------------------------------------------------------
// Binary Search Tree
// ---------------------------------------------------------------------------

export interface TreeNodeView {
  value: number;
  left: number; // index into `nodes`, -1 when empty
  right: number;
  state: ElementState;
}

export interface TreeFrame {
  nodes: TreeNodeView[];
  root: number; // index into `nodes`, -1 when the tree is empty
  stepTitle: string;
  explanation: string;
  codeLineIndex: number;
  operation: string;
  output?: number[];
  comparisons?: number;
}

/** Trees get hard to read past this many nodes, so extra input values are ignored. */
export const MAX_TREE_NODES = 15;

export function generateBSTFrames(arr: number[], target: number): TreeFrame[] {
  const values = arr.slice(0, MAX_TREE_NODES);
  const frames: TreeFrame[] = [];
  const nodes: { value: number; left: number; right: number }[] = [];
  let root = -1;
  let comparisons = 0;

  const snap = (
    over: Record<number, ElementState>,
    stepTitle: string,
    explanation: string,
    codeLineIndex: number,
    operation: string,
    output?: number[]
  ) => {
    frames.push({
      nodes: nodes.map((n, idx) => ({ ...n, state: over[idx] ?? 'normal' })),
      root,
      stepTitle,
      explanation,
      codeLineIndex,
      operation,
      output: output ? [...output] : undefined,
      comparisons,
    });
  };

  const pathStates = (path: number[]) => {
    const over: Record<number, ElementState> = {};
    path.forEach((p) => {
      over[p] = 'visited';
    });
    return over;
  };

  snap(
    {},
    'Empty tree',
    `We will insert [${values.join(', ')}] one at a time, search for ${target}, then walk the tree in order.${
      arr.length > MAX_TREE_NODES ? ` (Only the first ${MAX_TREE_NODES} values are used to keep the tree readable.)` : ''
    }`,
    0,
    'init'
  );

  // ---- insert phase ----
  for (const v of values) {
    if (root === -1) {
      nodes.push({ value: v, left: -1, right: -1 });
      root = 0;
      snap({ 0: 'sorted' }, `Insert ${v}`, `The tree is empty, so ${v} becomes the root.`, 0, 'insert');
      continue;
    }

    const path: number[] = [];
    let cur = root;
    for (;;) {
      comparisons++;
      const node = nodes[cur];
      const over = pathStates(path);
      over[cur] = 'comparing';

      if (v === node.value) {
        snap(
          over,
          `${v} already exists`,
          `${v} equals ${node.value}. This tree keeps unique keys, so the duplicate is skipped.`,
          0,
          'insert'
        );
        break;
      }

      const goLeft = v < node.value;
      snap(
        over,
        `Insert ${v}: compare with ${node.value}`,
        `${v} ${goLeft ? '<' : '>'} ${node.value}, so go ${goLeft ? 'left' : 'right'}.`,
        goLeft ? 0 : 1,
        'insert'
      );
      path.push(cur);

      const next = goLeft ? node.left : node.right;
      if (next === -1) {
        const idx = nodes.length;
        nodes.push({ value: v, left: -1, right: -1 });
        if (goLeft) node.left = idx;
        else node.right = idx;
        snap(
          { ...pathStates(path), [idx]: 'sorted' },
          `Inserted ${v}`,
          `The ${goLeft ? 'left' : 'right'} slot under ${node.value} is empty, so ${v} becomes a new leaf there.`,
          goLeft ? 0 : 1,
          'insert'
        );
        break;
      }
      cur = next;
    }
  }

  // ---- search phase ----
  if (nodes.length > 0) {
    snap({}, `Search for ${target}`, `Now we look for ${target}, starting at the root.`, 2, 'search');
    const path: number[] = [];
    let cur = root;
    for (;;) {
      if (cur === -1) {
        snap(
          pathStates(path),
          `${target} not found`,
          `We ran off the bottom of the tree, so ${target} is not in it.`,
          4,
          'search'
        );
        break;
      }
      comparisons++;
      const node = nodes[cur];
      const over = pathStates(path);
      if (node.value === target) {
        over[cur] = 'target';
        snap(over, `Found ${target}!`, `${node.value} equals ${target}. Found it after ${path.length + 1} comparison(s).`, 2, 'search');
        break;
      }
      over[cur] = 'comparing';
      const goLeft = target < node.value;
      snap(
        over,
        `Search ${target}: at ${node.value}`,
        `${target} ${goLeft ? '<' : '>'} ${node.value}, so search the ${goLeft ? 'left' : 'right'} subtree.`,
        goLeft ? 3 : 4,
        'search'
      );
      path.push(cur);
      cur = goLeft ? node.left : node.right;
    }
  }

  // ---- in-order traversal ----
  const output: number[] = [];
  const seen = new Set<number>();
  if (nodes.length > 0) {
    snap(
      {},
      'In-order traversal',
      'Visit the left subtree, then the node itself, then the right subtree. In a BST that produces the keys in sorted order.',
      5,
      'traverse',
      output
    );
    const visit = (idx: number) => {
      if (idx === -1) return;
      visit(nodes[idx].left);
      output.push(nodes[idx].value);
      seen.add(idx);
      const over: Record<number, ElementState> = {};
      seen.forEach((s) => {
        over[s] = 'sorted';
      });
      over[idx] = 'comparing';
      snap(
        over,
        `Visit ${nodes[idx].value}`,
        `Everything smaller has been visited, so output ${nodes[idx].value}. Output so far: [${output.join(', ')}].`,
        5,
        'traverse',
        output
      );
      visit(nodes[idx].right);
    };
    visit(root);

    const all: Record<number, ElementState> = {};
    nodes.forEach((_, idx) => {
      all[idx] = 'sorted';
    });
    snap(
      all,
      'Traversal complete',
      `In-order output [${output.join(', ')}] is sorted. That is the BST property at work.`,
      5,
      'done',
      output
    );
  }

  return frames;
}

// ---------------------------------------------------------------------------
// Graphs: BFS and DFS
// ---------------------------------------------------------------------------

export interface GraphData {
  n: number;
  edges: [number, number][];
}

export type EdgeState = 'normal' | 'examining' | 'tree';

export interface GraphFrame {
  n: number;
  edges: [number, number][];
  states: ElementState[];
  edgeStates: EdgeState[];
  structure: number[]; // queue (BFS) or call stack (DFS)
  structureLabel: string;
  order: number[]; // visit order so far
  stepTitle: string;
  explanation: string;
  codeLineIndex: number;
}

export const nodeLabel = (i: number) => String.fromCharCode(65 + i);

/** A random connected undirected graph with `n` nodes. */
export function randomGraph(n = 8): GraphData {
  const seen = new Set<string>();
  const edges: [number, number][] = [];
  const add = (a: number, b: number) => {
    if (a === b) return false;
    const [u, v] = a < b ? [a, b] : [b, a];
    const key = `${u}-${v}`;
    if (seen.has(key)) return false;
    seen.add(key);
    edges.push([u, v]);
    return true;
  };

  const order = Array.from({ length: n }, (_, i) => i).sort(() => Math.random() - 0.5);
  for (let i = 1; i < n; i++) add(order[i], order[Math.floor(Math.random() * i)]); // spanning tree keeps it connected

  let extra = Math.max(2, Math.floor(n / 2));
  for (let attempts = 0; extra > 0 && attempts < 60; attempts++) {
    if (add(Math.floor(Math.random() * n), Math.floor(Math.random() * n))) extra--;
  }
  return { n, edges };
}

function graphHelpers(g: GraphData) {
  const adj: number[][] = Array.from({ length: g.n }, () => []);
  const edgeAt = new Map<string, number>();
  g.edges.forEach(([u, v], e) => {
    adj[u].push(v);
    adj[v].push(u);
    edgeAt.set(`${u}-${v}`, e);
    edgeAt.set(`${v}-${u}`, e);
  });
  adj.forEach((list) => list.sort((x, y) => x - y));
  return { adj, edgeIndex: (u: number, v: number) => edgeAt.get(`${u}-${v}`) ?? -1 };
}

export function generateBFSFrames(g: GraphData, startNode: number): GraphFrame[] {
  const start = Math.min(Math.max(0, Math.floor(startNode) || 0), g.n - 1);
  const { adj, edgeIndex } = graphHelpers(g);
  const frames: GraphFrame[] = [];
  const visited = new Set<number>();
  const done = new Set<number>();
  const treeEdges = new Set<number>();
  const order: number[] = [];
  const queue: number[] = [];
  const L = nodeLabel;

  const push = (
    current: number,
    over: Record<number, ElementState>,
    examining: number,
    stepTitle: string,
    explanation: string,
    codeLineIndex: number
  ) => {
    frames.push({
      n: g.n,
      edges: g.edges,
      states: Array.from({ length: g.n }, (_, v): ElementState => {
        if (over[v]) return over[v];
        if (v === current) return 'current';
        if (done.has(v)) return 'sorted';
        return queue.includes(v) ? 'visited' : 'normal';
      }),
      edgeStates: g.edges.map((_, e): EdgeState => (e === examining ? 'examining' : treeEdges.has(e) ? 'tree' : 'normal')),
      structure: [...queue],
      structureLabel: 'Queue (front → back)',
      order: [...order],
      stepTitle,
      explanation,
      codeLineIndex,
    });
  };

  visited.add(start);
  queue.push(start);
  push(-1, {}, -1, `Start at ${L(start)}`, `Put ${L(start)} in the queue and mark it visited.`, 1);

  while (queue.length > 0) {
    const node = queue.shift()!;
    order.push(node);
    push(
      node,
      {},
      -1,
      `Dequeue ${L(node)}`,
      `Take ${L(node)} from the front of the queue.${
        adj[node].length ? ` Its neighbours are ${adj[node].map(L).join(', ')}.` : ' It has no neighbours.'
      }`,
      3
    );

    for (const nb of adj[node]) {
      const e = edgeIndex(node, nb);
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push(nb);
        treeEdges.add(e);
        push(
          node,
          { [nb]: 'target' },
          -1,
          `Discover ${L(nb)}`,
          `${L(nb)} has not been visited. Mark it and add it to the back of the queue.`,
          5
        );
      } else {
        push(node, {}, e, `${L(nb)} already visited`, `${L(nb)} was discovered earlier, so we skip it.`, 5);
      }
    }
    done.add(node);
  }

  push(-1, {}, -1, 'BFS complete', `Visit order: ${order.map(L).join(' → ')}. Nodes are reached in order of distance from ${L(start)}.`, 0);
  return frames;
}

export function generateDFSFrames(g: GraphData, startNode: number): GraphFrame[] {
  const start = Math.min(Math.max(0, Math.floor(startNode) || 0), g.n - 1);
  const { adj, edgeIndex } = graphHelpers(g);
  const frames: GraphFrame[] = [];
  const visited = new Set<number>();
  const done = new Set<number>();
  const treeEdges = new Set<number>();
  const order: number[] = [];
  const stack: number[] = [];
  const L = nodeLabel;

  const push = (
    current: number,
    over: Record<number, ElementState>,
    examining: number,
    stepTitle: string,
    explanation: string,
    codeLineIndex: number
  ) => {
    frames.push({
      n: g.n,
      edges: g.edges,
      states: Array.from({ length: g.n }, (_, v): ElementState => {
        if (over[v]) return over[v];
        if (v === current) return 'current';
        if (done.has(v)) return 'sorted';
        return stack.includes(v) ? 'visited' : 'normal';
      }),
      edgeStates: g.edges.map((_, e): EdgeState => (e === examining ? 'examining' : treeEdges.has(e) ? 'tree' : 'normal')),
      structure: [...stack],
      structureLabel: 'Call stack (bottom → top)',
      order: [...order],
      stepTitle,
      explanation,
      codeLineIndex,
    });
  };

  function dfs(node: number) {
    visited.add(node);
    order.push(node);
    stack.push(node);
    push(node, {}, -1, `Visit ${L(node)}`, `Mark ${L(node)} as visited. It sits on top of the call stack while we explore from it.`, 1);

    for (const nb of adj[node]) {
      const e = edgeIndex(node, nb);
      if (!visited.has(nb)) {
        push(node, { [nb]: 'target' }, e, `Check ${L(nb)}`, `${L(nb)} has not been visited, so recurse into it.`, 3);
        treeEdges.add(e);
        dfs(nb);
      } else {
        push(node, {}, e, `${L(nb)} already visited`, `${L(nb)} was visited earlier, so we skip it.`, 3);
      }
    }

    stack.pop();
    done.add(node);
    const parent = stack[stack.length - 1];
    if (parent === undefined) {
      push(-1, {}, -1, 'DFS complete', `Visit order: ${order.map(L).join(' → ')}. DFS dives as deep as it can before backtracking.`, 0);
    } else {
      push(parent, {}, -1, `Backtrack from ${L(node)}`, `Every neighbour of ${L(node)} is explored. Pop it and return to ${L(parent)}.`, 2);
    }
  }

  dfs(start);
  return frames;
}

// ---------------------------------------------------------------------------
// Dynamic programming: Fibonacci and Longest Common Subsequence
// ---------------------------------------------------------------------------

export interface DPFrame {
  table: (number | null)[][];
  rowLabels: string[];
  colLabels: string[];
  cellStates: ElementState[][];
  highlightRow?: number;
  highlightCol?: number;
  result?: string;
  resultLabel?: string;
  stepTitle: string;
  explanation: string;
  codeLineIndex: number;
}

export const MAX_FIB_N = 20;
export const MAX_LCS_LEN = 10;

export function randomString(len = 6, alphabet = 'ABCD'): string {
  return Array.from({ length: len }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

export function generateFibonacciFrames(nInput: number): DPFrame[] {
  const n = Math.max(1, Math.min(MAX_FIB_N, Math.floor(nInput) || 1));
  const dp: (number | null)[] = Array(n + 1).fill(null);
  const colLabels = Array.from({ length: n + 1 }, (_, i) => String(i));
  const frames: DPFrame[] = [];

  const base = (): ElementState[] => dp.map((v) => (v === null ? 'eliminated' : 'normal'));
  const push = (
    states: ElementState[],
    stepTitle: string,
    explanation: string,
    codeLineIndex: number,
    result?: number
  ) => {
    frames.push({
      table: [[...dp]],
      rowLabels: ['dp'],
      colLabels,
      cellStates: [states],
      stepTitle,
      explanation,
      codeLineIndex,
      result: result === undefined ? undefined : String(result),
      resultLabel: result === undefined ? undefined : `fib(${n})`,
    });
  };

  push(base(), 'Empty table', `We want fib(${n}). Make a table dp[0..${n}] so each value is computed once and reused.`, 0);

  dp[0] = 0;
  dp[1] = 1;
  const baseStates = base();
  baseStates[0] = 'active';
  baseStates[1] = 'active';
  push(baseStates, 'Base cases', 'Set dp[0] = 0 and dp[1] = 1. Every other value is built from these two.', 0);

  for (let i = 2; i <= n; i++) {
    const a = dp[i - 1] as number;
    const b = dp[i - 2] as number;
    dp[i] = a + b;
    const states = base();
    states[i - 1] = 'comparing';
    states[i - 2] = 'comparing';
    states[i] = 'active';
    push(states, `dp[${i}] = ${dp[i]}`, `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${a} + ${b} = ${dp[i]}. Both inputs were already in the table, so there is no repeated work.`, 2);
  }

  const finalStates = base();
  finalStates[n] = 'target';
  push(finalStates, `fib(${n}) = ${dp[n]}`, `The answer is dp[${n}] = ${dp[n]}. It took ${Math.max(0, n - 1)} additions, where naive recursion would take exponentially many calls.`, 3, dp[n] as number);
  return frames;
}

export function generateLCSFrames(s1Input: string, s2Input: string): DPFrame[] {
  const clean = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, '').slice(0, MAX_LCS_LEN);
  const s1 = clean(s1Input);
  const s2 = clean(s2Input);
  const m = s1.length;
  const n = s2.length;
  const frames: DPFrame[] = [];

  const rowLabels = ['', ...s1.split('')];
  const colLabels = ['', ...s2.split('')];
  const dp: (number | null)[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null));
  const path = new Set<string>();

  const grid = (over: Record<string, ElementState> = {}): ElementState[][] =>
    dp.map((row, i) =>
      row.map((v, j): ElementState => over[`${i},${j}`] ?? (path.has(`${i},${j}`) ? 'sorted' : v === null ? 'eliminated' : 'normal'))
    );

  const push = (
    over: Record<string, ElementState>,
    stepTitle: string,
    explanation: string,
    codeLineIndex: number,
    extra: Partial<DPFrame> = {}
  ) => {
    frames.push({
      table: dp.map((r) => [...r]),
      rowLabels,
      colLabels,
      cellStates: grid(over),
      stepTitle,
      explanation,
      codeLineIndex,
      ...extra,
    });
  };

  if (m === 0 || n === 0) {
    push({}, 'Need two strings', 'Enter two non-empty strings made of letters to compute their longest common subsequence.', 0);
    return frames;
  }

  for (let i = 0; i <= m; i++) dp[i][0] = 0;
  for (let j = 0; j <= n; j++) dp[0][j] = 0;
  push({}, 'Initialize', `Comparing "${s1}" (rows) with "${s2}" (columns). The first row and column are 0: an empty string has nothing in common with anything.`, 0);

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = s1[i - 1] === s2[j - 1];
      const over: Record<string, ElementState> = {};
      if (match) {
        dp[i][j] = (dp[i - 1][j - 1] as number) + 1;
        over[`${i - 1},${j - 1}`] = 'comparing';
        over[`${i},${j}`] = 'active';
        push(
          over,
          `Match: ${s1[i - 1]}`,
          `s1[${i}] = "${s1[i - 1]}" equals s2[${j}] = "${s2[j - 1]}". Extend the diagonal: dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}.`,
          3,
          { highlightRow: i, highlightCol: j }
        );
      } else {
        const up = dp[i - 1][j] as number;
        const left = dp[i][j - 1] as number;
        dp[i][j] = Math.max(up, left);
        over[`${i - 1},${j}`] = 'comparing';
        over[`${i},${j - 1}`] = 'comparing';
        over[`${i},${j}`] = 'active';
        push(
          over,
          `No match: ${s1[i - 1]} vs ${s2[j - 1]}`,
          `"${s1[i - 1]}" ≠ "${s2[j - 1]}". Take the better of the cell above (${up}) and the cell to the left (${left}): dp[${i}][${j}] = ${dp[i][j]}.`,
          5,
          { highlightRow: i, highlightCol: j }
        );
      }
    }
  }

  // Trace back through the table to recover the actual subsequence.
  let i = m;
  let j = n;
  let built = '';
  path.add(`${i},${j}`);
  push({ [`${i},${j}`]: 'active' }, 'Table complete', `dp[${m}][${n}] = ${dp[m][n]}, so the longest common subsequence has length ${dp[m][n]}. Now trace back from the bottom-right corner to find it.`, 6, {
    highlightRow: m,
    highlightCol: n,
  });

  while (i > 0 && j > 0) {
    if (s1[i - 1] === s2[j - 1]) {
      built = s1[i - 1] + built;
      i--;
      j--;
      path.add(`${i},${j}`);
      push(
        { [`${i},${j}`]: 'active' },
        `Traceback: take ${s1[i]}`,
        `The letters match, so "${s1[i]}" is part of the answer. Move diagonally up-left. Subsequence so far: "${built}".`,
        6,
        { result: built, resultLabel: 'LCS so far' }
      );
    } else if ((dp[i - 1][j] as number) >= (dp[i][j - 1] as number)) {
      i--;
      path.add(`${i},${j}`);
      push({ [`${i},${j}`]: 'active' }, 'Traceback: move up', 'No match here, and the cell above is at least as large as the cell to the left, so move up.', 6, {
        result: built,
        resultLabel: 'LCS so far',
      });
    } else {
      j--;
      path.add(`${i},${j}`);
      push({ [`${i},${j}`]: 'active' }, 'Traceback: move left', 'No match here, and the cell to the left is larger than the cell above, so move left.', 6, {
        result: built,
        resultLabel: 'LCS so far',
      });
    }
  }

  push({}, `LCS = "${built}"`, `The longest common subsequence of "${s1}" and "${s2}" is "${built}" (length ${built.length}). The table filled ${m * n} cells: O(m·n) time and space.`, 6, {
    result: built,
    resultLabel: 'LCS',
  });
  return frames;
}

// ---------------------------------------------------------------------------
// Pattern: Two Pointers — Two Sum (sorted array)
// ---------------------------------------------------------------------------

export function generateTwoSumFrames(arrIn: number[], target: number): ArrayFrame[] {
  const a = [...arrIn].sort((x, y) => x - y);
  const frames: ArrayFrame[] = [];
  let comparisons = 0;
  const push = (states: ElementState[], stepTitle: string, explanation: string, codeLineIndex: number) =>
    frames.push({ array: [...a], states, stepTitle, explanation, codeLineIndex, comparisons });

  push(a.map(() => 'normal'), 'Sorted array', `Two Sum works with two pointers once the array is sorted: [${a.join(', ')}]. Looking for a pair that adds to ${target}.`, 0);

  let lo = 0;
  let hi = a.length - 1;
  while (lo < hi) {
    comparisons++;
    const sum = a[lo] + a[hi];
    const states = a.map((_, i) => (i === lo || i === hi ? 'comparing' : i < lo || i > hi ? 'eliminated' : 'normal'));
    if (sum === target) {
      push(a.map((_, i) => (i === lo || i === hi ? 'target' : 'eliminated')), 'Found it!', `${a[lo]} + ${a[hi]} = ${target}. Pair found at positions ${lo} and ${hi}.`, 4);
      return frames;
    }
    if (sum < target) {
      push(states, `${a[lo]} + ${a[hi]} = ${sum} < ${target}`, `The sum is too small, so move the left pointer right to try a bigger value.`, 5);
      lo++;
    } else {
      push(states, `${a[lo]} + ${a[hi]} = ${sum} > ${target}`, `The sum is too big, so move the right pointer left to try a smaller value.`, 7);
      hi--;
    }
  }
  push(a.map(() => 'eliminated'), 'No pair found', `The pointers crossed without finding a pair that sums to ${target}.`, 0);
  return frames;
}

// ---------------------------------------------------------------------------
// Pattern: Two Pointers — Container With Most Water
// ---------------------------------------------------------------------------

export function generateContainerWaterFrames(heights: number[]): ArrayFrame[] {
  const a = [...heights];
  const frames: ArrayFrame[] = [];
  let comparisons = 0;
  let best = 0;
  let bestPair: [number, number] = [0, a.length - 1];
  const push = (states: ElementState[], stepTitle: string, explanation: string, codeLineIndex: number) =>
    frames.push({ array: [...a], states, stepTitle, explanation, codeLineIndex, comparisons });

  push(a.map(() => 'normal'), 'Initial heights', `Bars: [${a.join(', ')}]. Two pointers start at the ends; the container's area is width × the shorter bar.`, 0);

  let lo = 0;
  let hi = a.length - 1;
  while (lo < hi) {
    comparisons++;
    const width = hi - lo;
    const area = width * Math.min(a[lo], a[hi]);
    if (area > best) {
      best = area;
      bestPair = [lo, hi];
    }
    const states = a.map((_, i) => (i === lo || i === hi ? 'comparing' : i === bestPair[0] || i === bestPair[1] ? 'target' : 'normal'));
    push(states, `Width ${width} × min(${a[lo]}, ${a[hi]}) = ${area}`, `Area is ${area}. Best so far is ${best}. The ${a[lo] < a[hi] ? 'left' : 'right'} bar is shorter, so it can only get worse if kept — move that pointer inward.`, 3);
    if (a[lo] < a[hi]) lo++;
    else hi--;
  }
  push(a.map((_, i) => (i === bestPair[0] || i === bestPair[1] ? 'target' : 'eliminated')), `Best area: ${best}`, `The pointers met. The best container found uses positions ${bestPair[0]} and ${bestPair[1]}, area ${best}.`, 0);
  return frames;
}

// ---------------------------------------------------------------------------
// Pattern: Sliding Window — Minimum Size Subarray Sum ≥ target
// ---------------------------------------------------------------------------

export function generateMinSubarrayFrames(arrIn: number[], target: number): ArrayFrame[] {
  const a = arrIn.map((v) => Math.abs(v) || 1); // window sizing needs positive values
  const frames: ArrayFrame[] = [];
  let comparisons = 0;
  let sum = 0;
  let left = 0;
  let best = Infinity;
  let bestRange: [number, number] | null = null;
  const push = (right: number, states: ElementState[], stepTitle: string, explanation: string, codeLineIndex: number) =>
    frames.push({ array: [...a], states, stepTitle, explanation, codeLineIndex, comparisons });

  const paint = (right: number, extra: Record<number, ElementState> = {}): ElementState[] =>
    a.map((_, i) => extra[i] ?? (i >= left && i <= right ? 'active' : bestRange && i >= bestRange[0] && i <= bestRange[1] ? 'sorted' : 'normal'));

  push(-1, a.map(() => 'normal'), 'Initial array', `Array: [${a.join(', ')}]. Target sum: ${target}. Grow the window from the right; shrink it from the left whenever the sum is enough.`, 0);

  for (let right = 0; right < a.length; right++) {
    sum += a[right];
    comparisons++;
    push(right, paint(right), `Add a[${right}] = ${a[right]}`, `Window is now [${left}..${right}], sum = ${sum}.`, 2);

    while (sum >= target) {
      const len = right - left + 1;
      if (len < best) {
        best = len;
        bestRange = [left, right];
      }
      push(right, paint(right), `Window sum ${sum} ≥ ${target}`, `Length ${len} works. Best so far: ${best === Infinity ? '—' : best}. Shrink from the left to look for something shorter.`, 4);
      sum -= a[left];
      left++;
    }
  }

  push(a.length, a.map((_, i) => (bestRange && i >= bestRange[0] && i <= bestRange[1] ? 'target' : 'eliminated')),
    best === Infinity ? 'No valid window' : `Shortest length: ${best}`,
    best === Infinity ? `No contiguous window sums to at least ${target}.` : `The shortest window with a sum ≥ ${target} has length ${best}, at positions ${bestRange![0]}..${bestRange![1]}.`,
    0);
  return frames;
}

// ---------------------------------------------------------------------------
// Pattern: Kadane's Algorithm — Maximum Subarray
// ---------------------------------------------------------------------------

export function generateKadaneFrames(arrIn: number[]): ArrayFrame[] {
  const a = [...arrIn];
  const frames: ArrayFrame[] = [];
  let comparisons = 0;
  let cur = a[0] ?? 0;
  let curStart = 0;
  let best = cur;
  let bestRange: [number, number] = [0, 0];
  const push = (i: number, states: ElementState[], stepTitle: string, explanation: string, codeLineIndex: number) =>
    frames.push({ array: [...a], states, stepTitle, explanation, codeLineIndex, comparisons });

  push(0, a.map((_, i) => (i === 0 ? 'active' : 'normal')), 'Start at index 0', `Running sum begins at a[0] = ${cur}. Best so far: ${best}.`, 0);

  for (let i = 1; i < a.length; i++) {
    comparisons++;
    const extendWins = cur + a[i] >= a[i];
    if (extendWins) cur = cur + a[i];
    else {
      cur = a[i];
      curStart = i;
    }
    if (cur > best) {
      best = cur;
      bestRange = [curStart, i];
    }
    const states = a.map((_, k) => (k >= curStart && k <= i ? 'active' : k >= bestRange[0] && k <= bestRange[1] ? 'sorted' : 'normal'));
    push(i, states, `a[${i}] = ${a[i]}: running sum ${cur}`, `${extendWins ? `Extending the run was better (${cur - a[i]} + ${a[i]} ≥ ${a[i]})` : `Starting fresh at ${a[i]} beats extending`}. Best so far: ${best}.`, extendWins ? 3 : 5);
  }

  push(a.length - 1, a.map((_, k) => (k >= bestRange[0] && k <= bestRange[1] ? 'target' : 'eliminated')), `Maximum subarray sum: ${best}`, `The best run is positions ${bestRange[0]}..${bestRange[1]}, summing to ${best}.`, 0);
  return frames;
}

// ---------------------------------------------------------------------------
// Pattern: Sort Colors (Dutch National Flag, three-way partition)
// ---------------------------------------------------------------------------

export function generateSortColorsFrames(arrIn: number[]): ArrayFrame[] {
  // Values are bucketed into three groups (low/mid/high) the way 0/1/2 would be, using this array's own range.
  const a = [...arrIn];
  const lo = Math.min(...a, 0);
  const hi = Math.max(...a, 0);
  const third = (hi - lo) / 3 || 1;
  const bucket = (v: number) => (v <= lo + third ? 0 : v <= lo + 2 * third ? 1 : 2);

  const frames: ArrayFrame[] = [];
  let swaps = 0;
  const push = (states: ElementState[], stepTitle: string, explanation: string, codeLineIndex: number) =>
    frames.push({ array: [...a], states, stepTitle, explanation, codeLineIndex, swaps });

  push(a.map(() => 'normal'), 'Three-way partition', `Sort Colors groups values into three buckets in one pass using low/mid/high pointers. Values: [${a.join(', ')}].`, 0);

  let low = 0;
  let mid = 0;
  let high = a.length - 1;
  while (mid <= high) {
    const b = bucket(a[mid]);
    const painted = () => a.map((_, i) => (i === mid ? 'comparing' : i < low ? 'sorted' : i > high ? 'target' : 'normal'));
    if (b === 0) {
      push(painted(), `a[${mid}] = ${a[mid]} is low`, `Swap it to the front (position ${low}) and advance both pointers.`, 3);
      [a[low], a[mid]] = [a[mid], a[low]];
      swaps++;
      low++;
      mid++;
    } else if (b === 2) {
      push(painted(), `a[${mid}] = ${a[mid]} is high`, `Swap it to the back (position ${high}) and shrink the high boundary. mid stays, since the swapped-in value hasn't been checked yet.`, 6);
      [a[mid], a[high]] = [a[high], a[mid]];
      swaps++;
      high--;
    } else {
      push(painted(), `a[${mid}] = ${a[mid]} is mid`, `It's already in the right group, so just move on.`, 5);
      mid++;
    }
  }
  push(a.map(() => 'sorted'), 'Partitioned!', `All three groups are in place: [${a.join(', ')}].`, 0);
  return frames;
}

// ---------------------------------------------------------------------------
// Pattern: Kth Largest Element (Quickselect)
// ---------------------------------------------------------------------------

export function generateKthLargestFrames(arrIn: number[], kIn: number): ArrayFrame[] {
  const a = [...arrIn];
  const k = Math.max(1, Math.min(a.length, Math.round(kIn)));
  const targetIndex = a.length - k; // kth largest = index (n-k) once sorted ascending
  const frames: ArrayFrame[] = [];
  let comparisons = 0;
  const done = new Set<number>();
  const push = (over: Record<number, ElementState>, stepTitle: string, explanation: string, codeLineIndex: number) =>
    frames.push({
      array: [...a],
      states: a.map((_, i) => over[i] ?? (done.has(i) ? 'sorted' : 'normal')),
      stepTitle,
      explanation,
      codeLineIndex,
      comparisons,
    });

  push({}, 'Quickselect', `Looking for the ${k}${k === 1 ? 'st' : k === 2 ? 'nd' : k === 3 ? 'rd' : 'th'} largest value in [${a.join(', ')}] — that's index ${targetIndex} once sorted ascending, found without sorting the whole array.`, 0);

  function partition(low: number, high: number): number {
    const pivot = a[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      comparisons++;
      push({ [high]: 'pivot', [j]: 'comparing' }, `Compare ${a[j]} with pivot ${pivot}`, a[j] <= pivot ? `${a[j]} ≤ ${pivot}, keep it on the left side.` : `${a[j]} > ${pivot}, leave it for the right side.`, 2);
      if (a[j] <= pivot) {
        i++;
        if (i !== j) [a[i], a[j]] = [a[j], a[i]];
      }
    }
    [a[i + 1], a[high]] = [a[high], a[i + 1]];
    push({ [i + 1]: 'swapping' }, `Pivot placed at ${i + 1}`, `${pivot} is now exactly where it belongs.`, 3);
    return i + 1;
  }

  function select(low: number, high: number) {
    if (low > high) return;
    const p = partition(low, high);
    if (p === targetIndex) {
      done.add(p);
      push({ [p]: 'target' }, `Found it: ${a[p]}`, `Position ${p} is exactly the index we needed — ${a[p]} is the ${k}th largest value.`, 4);
    } else if (p < targetIndex) {
      push({ [p]: 'sorted' }, `Target is to the right`, `Index ${targetIndex} is past ${p}, so only the right side needs checking now.`, 5);
      select(p + 1, high);
    } else {
      push({ [p]: 'sorted' }, `Target is to the left`, `Index ${targetIndex} is before ${p}, so only the left side needs checking now.`, 5);
      select(low, p - 1);
    }
  }

  select(0, a.length - 1);
  const ordinal = k === 1 ? 'st' : k === 2 ? 'nd' : k === 3 ? 'rd' : 'th';
  frames.push({ array: [...a], states: a.map((_, i) => (i === targetIndex ? 'target' : 'eliminated')), stepTitle: `The ${k}${ordinal} largest is ${a[targetIndex]}`, explanation: `Done — no full sort needed, only the partitions that mattered.`, codeLineIndex: 0, comparisons });
  return frames;
}

// ---------------------------------------------------------------------------
// Pattern: Product of Array Except Self
// ---------------------------------------------------------------------------

export function generateProductExceptSelfFrames(arrIn: number[]): ArrayFrame[] {
  const a = [...arrIn];
  const n = a.length;
  const result = Array(n).fill(1);
  const frames: ArrayFrame[] = [];
  const push = (states: ElementState[], stepTitle: string, explanation: string, codeLineIndex: number, arrayOverride?: number[]) =>
    frames.push({ array: arrayOverride ?? [...a], states, stepTitle, explanation, codeLineIndex });

  push(a.map(() => 'normal'), 'Prefix and suffix products', `For each index, the answer is the product of every OTHER value. Built with a left-to-right prefix pass, then a right-to-left suffix pass — no division needed.`, 0);

  let prefix = 1;
  for (let i = 0; i < n; i++) {
    result[i] = prefix;
    push(a.map((_, k) => (k === i ? 'active' : k < i ? 'sorted' : 'normal')), `Prefix product before index ${i}: ${prefix}`, `result[${i}] = ${prefix} (the product of everything to its left).`, 3, result);
    prefix *= a[i];
  }

  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= suffix;
    push(a.map((_, k) => (k === i ? 'active' : k > i ? 'sorted' : 'normal')), `Multiply by suffix product: ${suffix}`, `result[${i}] = ${result[i] / suffix} × ${suffix} = ${result[i]} (now also counting everything to its right).`, 7, result);
    suffix *= a[i];
  }

  push(a.map(() => 'sorted'), 'Done', `Final result: [${result.join(', ')}].`, 0, result);
  return frames;
}

// ---------------------------------------------------------------------------
// Pattern: Monotonic Stack — Next Greater Element
// ---------------------------------------------------------------------------

export function generateNextGreaterFrames(arrIn: number[]): LinearDSFrame[] {
  const a = [...arrIn];
  const result = Array(a.length).fill(-1);
  const stack: number[] = []; // indices, values kept decreasing bottom-to-top
  const frames: LinearDSFrame[] = [];

  const push = (highlight: number | null, stepTitle: string, explanation: string, codeLineIndex: number, operation: string) => {
    frames.push({
      items: stack.map((idx) => a[idx]),
      states: stack.map((idx) => (idx === highlight ? 'comparing' : 'normal')),
      pointers: stack.length ? [{ label: 'top', index: stack.length - 1 }] : [],
      stepTitle,
      explanation: `${explanation} Result so far: [${result.join(', ')}].`,
      codeLineIndex,
      operation,
    });
  };

  push(null, 'Empty stack', `Find, for every value, the next value to its right that's bigger. A stack of "waiting" indices makes this O(n) instead of O(n²). Array: [${a.join(', ')}].`, 0, 'init');

  for (let i = 0; i < a.length; i++) {
    while (stack.length && a[stack[stack.length - 1]] < a[i]) {
      const idx = stack[stack.length - 1];
      push(idx, `${a[i]} is the answer for ${a[idx]}`, `a[${i}] = ${a[i]} is bigger than the top of the stack (${a[idx]}), so pop it and record its answer.`, 4, 'pop');
      stack.pop();
      result[idx] = a[i];
    }
    stack.push(i);
    push(i, `Push a[${i}] = ${a[i]}`, `Nothing on the stack is smaller than ${a[i]} (or the stack is empty), so push its index and keep waiting.`, 6, 'push');
  }

  frames.push({
    items: stack.map((idx) => a[idx]),
    states: stack.map(() => 'normal'),
    pointers: stack.length ? [{ label: 'top', index: stack.length - 1 }] : [],
    stepTitle: 'Done',
    explanation: `Every remaining stack entry has no greater value to its right, so it stays -1. Final result: [${result.join(', ')}].`,
    codeLineIndex: 0,
    operation: 'done',
  });
  return frames;
}

// ---------------------------------------------------------------------------
// Pattern: Binary Search on the Answer — Minimum Capacity to Ship in D Days
// ---------------------------------------------------------------------------

export function generateShipCapacityFrames(weightsIn: number[], daysIn: number): BinarySearchFrame[] {
  const weights = weightsIn.map((w) => Math.max(1, Math.round(Math.abs(w))));
  const days = Math.max(1, Math.round(daysIn));

  const daysNeeded = (capacity: number) => {
    let d = 1;
    let load = 0;
    for (const w of weights) {
      if (load + w > capacity) {
        d++;
        load = 0;
      }
      load += w;
    }
    return d;
  };

  let lo = Math.max(...weights);
  let hi = weights.reduce((s, w) => s + w, 0);
  const candidates: number[] = [];
  for (let c = lo; c <= hi; c++) candidates.push(c);

  const frames: BinarySearchFrame[] = [];
  const push = (left: number, right: number, mid: number, found: boolean, stepTitle: string, explanation: string, codeLineIndex: number) =>
    frames.push({
      array: candidates,
      states: candidates.map((_, i) => (i === mid ? 'target' : i < left || i > right ? 'eliminated' : 'normal')),
      left,
      right,
      mid,
      target: -1,
      found,
      stepTitle,
      explanation,
      codeLineIndex,
    });

  push(0, candidates.length - 1, -1, false, 'Search the capacity range', `Any capacity from ${lo} (the heaviest single package) to ${hi} (shipping it all at once) could work. Binary search for the smallest one that still finishes within ${days} days.`, 0);

  let left = 0;
  let right = candidates.length - 1;
  let answer = hi;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const capacity = candidates[mid];
    const needed = daysNeeded(capacity);
    if (needed <= days) {
      answer = capacity;
      push(left, right, mid, false, `Capacity ${capacity} needs ${needed} day${needed === 1 ? '' : 's'}`, `${needed} ≤ ${days}, so this capacity works. Try something smaller.`, 4);
      right = mid - 1;
    } else {
      push(left, right, mid, false, `Capacity ${capacity} needs ${needed} day${needed === 1 ? '' : 's'}`, `${needed} > ${days}, so this capacity is too small. Try something bigger.`, 6);
      left = mid + 1;
    }
  }

  const answerIdx = candidates.indexOf(answer);
  frames.push({ array: candidates, states: candidates.map((_, i) => (i === answerIdx ? 'target' : 'eliminated')), left, right, mid: answerIdx, target: -1, found: true, stepTitle: `Minimum capacity: ${answer}`, explanation: `${answer} is the smallest capacity that ships everything within ${days} days.`, codeLineIndex: 0 });
  return frames;
}

// ---------------------------------------------------------------------------
// Pattern: Topological Sort (Kahn's algorithm, BFS with in-degrees)
// ---------------------------------------------------------------------------

export function generateTopoSortFrames(g: GraphData): GraphFrame[] {
  // Edges are read as directed u -> v (prerequisite -> course), drawn the same as any other graph edge.
  const { n, edges } = g;
  const adj: number[][] = Array.from({ length: n }, () => []);
  const indeg = Array(n).fill(0);
  edges.forEach(([u, v]) => {
    adj[u].push(v);
    indeg[v]++;
  });

  const frames: GraphFrame[] = [];
  const order: number[] = [];
  const done = new Set<number>();
  const queue: number[] = [];
  const treeEdges = new Set<number>();
  const edgeIndex = (u: number, v: number) => edges.findIndex(([a, b]) => a === u && b === v);
  const L = nodeLabel;

  const push = (examining: number, stepTitle: string, explanation: string, codeLineIndex: number) => {
    frames.push({
      n,
      edges,
      states: Array.from({ length: n }, (_, v): ElementState => (done.has(v) ? 'sorted' : queue.includes(v) ? 'visited' : 'normal')),
      edgeStates: edges.map((_, e): 'normal' | 'examining' | 'tree' => (e === examining ? 'examining' : treeEdges.has(e) ? 'tree' : 'normal')),
      structure: [...queue],
      structureLabel: 'Queue (in-degree 0)',
      order: [...order],
      stepTitle,
      explanation,
      codeLineIndex,
    });
  };

  for (let v = 0; v < n; v++) if (indeg[v] === 0) queue.push(v);
  push(-1, 'Start with in-degree 0', `Every node with no unfinished prerequisites (in-degree 0) starts in the queue: ${queue.map(L).join(', ') || 'none'}.`, 1);

  while (queue.length) {
    const node = queue.shift()!;
    order.push(node);
    done.add(node);
    push(-1, `Take ${L(node)}`, `${L(node)} has no prerequisites left, so it can go next.`, 3);
    for (const nb of adj[node]) {
      const e = edgeIndex(node, nb);
      treeEdges.add(e);
      indeg[nb]--;
      push(e, `${L(nb)}'s in-degree drops to ${indeg[nb]}`, `${L(node)} → ${L(nb)}: with ${L(node)} done, ${L(nb)} has one fewer prerequisite.${indeg[nb] === 0 ? ` It now has none left, so it joins the queue.` : ''}`, 5);
      if (indeg[nb] === 0) queue.push(nb);
    }
  }

  const hasCycle = order.length < n;
  push(-1, hasCycle ? 'Cycle detected' : 'Topological order complete',
    hasCycle
      ? `Only ${order.length} of ${n} nodes were ordered. The rest are stuck in a cycle of prerequisites and can never be scheduled.`
      : `Valid order: ${order.map(L).join(' → ')}. Every prerequisite comes before what depends on it.`,
    0);
  return frames;
}

// ---------------------------------------------------------------------------
// Pattern: Union-Find — Number of Connected Components
// ---------------------------------------------------------------------------

export function generateUnionFindFrames(g: GraphData): GraphFrame[] {
  const { n, edges } = g;
  const parent = Array.from({ length: n }, (_, i) => i);
  const componentColor: ElementState[] = ['normal', 'active', 'comparing', 'visited', 'current', 'target', 'sorted', 'eliminated', 'pivot', 'swapping'];
  const L = nodeLabel;

  function find(x: number): number {
    while (parent[x] !== x) x = parent[x];
    return x;
  }

  const frames: GraphFrame[] = [];
  const treeEdges = new Set<number>();
  const rootColor = new Map<number, ElementState>();
  let nextColor = 0;

  const colorFor = (root: number) => {
    if (!rootColor.has(root)) rootColor.set(root, componentColor[nextColor++ % componentColor.length]);
    return rootColor.get(root)!;
  };

  const push = (examining: number, stepTitle: string, explanation: string, codeLineIndex: number) => {
    const roots = new Map<number, ElementState>();
    for (let v = 0; v < n; v++) roots.set(v, colorFor(find(v)));
    frames.push({
      n,
      edges,
      states: Array.from({ length: n }, (_, v) => roots.get(v)!),
      edgeStates: edges.map((_, e): 'normal' | 'examining' | 'tree' => (e === examining ? 'examining' : treeEdges.has(e) ? 'tree' : 'normal')),
      structure: [...new Set(Array.from({ length: n }, (_, v) => find(v)))].map((r) => r),
      structureLabel: 'Distinct roots (one per component)',
      order: [],
      stepTitle,
      explanation,
      codeLineIndex,
    });
  };

  push(-1, 'Every node starts alone', `Each of the ${n} nodes begins as its own component. Union-Find will merge them as edges connect them.`, 0);

  edges.forEach(([u, v], e) => {
    const ru = find(u);
    const rv = find(v);
    if (ru === rv) {
      push(e, `${L(u)} and ${L(v)} already connected`, `Edge ${L(u)}–${L(v)} connects two nodes already in the same component, so nothing changes.`, 3);
    } else {
      parent[ru] = rv;
      treeEdges.add(e);
      push(e, `Union ${L(u)} and ${L(v)}`, `Edge ${L(u)}–${L(v)} joins two separate components into one.`, 5);
    }
  });

  const roots = new Set(Array.from({ length: n }, (_, v) => find(v)));
  push(-1, `${roots.size} connected component${roots.size === 1 ? '' : 's'}`, `Every edge has been processed. Nodes sharing a color are in the same component.`, 0);
  return frames;
}

// ---------------------------------------------------------------------------
// Pattern: Detect Cycle in a Directed Graph (DFS with a recursion-stack)
// ---------------------------------------------------------------------------

export function generateDirectedCycleFrames(g: GraphData): GraphFrame[] {
  const { n, edges } = g;
  const adj: number[][] = Array.from({ length: n }, () => []);
  edges.forEach(([u, v]) => adj[u].push(v));
  const edgeIndex = (u: number, v: number) => edges.findIndex(([a, b]) => a === u && b === v);
  const L = nodeLabel;

  const state = Array(n).fill(0); // 0 unvisited, 1 in progress (on the recursion stack), 2 finished
  const stack: number[] = [];
  const frames: GraphFrame[] = [];
  const treeEdges = new Set<number>();
  let cycleFound = false;

  const push = (examining: number, stepTitle: string, explanation: string, codeLineIndex: number) => {
    frames.push({
      n,
      edges,
      states: Array.from({ length: n }, (_, v): ElementState => (state[v] === 2 ? 'sorted' : state[v] === 1 ? 'current' : 'normal')),
      edgeStates: edges.map((_, e): 'normal' | 'examining' | 'tree' => (e === examining ? 'examining' : treeEdges.has(e) ? 'tree' : 'normal')),
      structure: [...stack],
      structureLabel: 'On the recursion stack',
      order: [],
      stepTitle,
      explanation,
      codeLineIndex,
    });
  };

  push(-1, 'Start DFS', `A directed graph has a cycle exactly when DFS finds an edge back to a node currently on its own recursion stack.`, 0);

  function dfs(u: number): boolean {
    state[u] = 1;
    stack.push(u);
    push(-1, `Visit ${L(u)}`, `${L(u)} is now on the recursion stack.`, 1);
    for (const v of adj[u]) {
      const e = edgeIndex(u, v);
      if (state[v] === 1) {
        push(e, `Cycle found!`, `${L(u)} → ${L(v)}, but ${L(v)} is already on the recursion stack — that's a back edge, so there's a cycle.`, 3);
        cycleFound = true;
        return true;
      }
      if (state[v] === 0) {
        treeEdges.add(e);
        push(e, `Explore ${L(u)} → ${L(v)}`, `${L(v)} hasn't been visited yet, so recurse into it.`, 4);
        if (dfs(v)) return true;
      } else {
        push(e, `${L(v)} already finished`, `${L(v)} was fully explored earlier with no cycle, so this edge is safe.`, 4);
      }
    }
    state[u] = 2;
    stack.pop();
    push(-1, `Finish ${L(u)}`, `${L(u)} and everything reachable from it are cycle-free. Remove it from the recursion stack.`, 5);
    return false;
  }

  for (let v = 0; v < n && !cycleFound; v++) {
    if (state[v] === 0) dfs(v);
  }

  push(-1, cycleFound ? 'Cycle detected' : 'No cycle — a valid DAG', cycleFound ? 'This graph has at least one cycle, so it cannot be topologically sorted.' : 'DFS finished every node without ever revisiting one on the current stack, so this graph is a DAG.', 0);
  return frames;
}

// ---------------------------------------------------------------------------
// Pattern: 0/1 Knapsack
// ---------------------------------------------------------------------------

export function generateKnapsackFrames(weightsIn: number[], valuesIn: number[], capacityIn: number): DPFrame[] {
  const n = Math.min(weightsIn.length, valuesIn.length, 8);
  const weights = weightsIn.slice(0, n).map((w) => Math.max(1, Math.round(Math.abs(w))));
  const values = valuesIn.slice(0, n).map((v) => Math.max(0, Math.round(Math.abs(v))));
  const capacity = Math.max(1, Math.min(30, Math.round(Math.abs(capacityIn))));

  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));
  const frames: DPFrame[] = [];
  const rowLabels = ['none', ...weights.map((w, i) => `+item ${i + 1} (w${w}, v${values[i]})`)];
  const colLabels = Array.from({ length: capacity + 1 }, (_, c) => String(c));

  const push = (i: number, c: number, stepTitle: string, explanation: string, codeLineIndex: number) => {
    frames.push({
      table: dp.map((r) => [...r]),
      rowLabels,
      colLabels,
      cellStates: dp.map((row, ri) => row.map((_, ci) => (ri === i && ci === c ? 'active' : ri <= i ? 'normal' : 'eliminated'))),
      highlightRow: i,
      highlightCol: c,
      stepTitle,
      explanation,
      codeLineIndex,
    });
  };

  push(0, 0, 'Base case', `With no items, the best value for any capacity is 0.`, 0);

  for (let i = 1; i <= n; i++) {
    for (let c = 0; c <= capacity; c++) {
      const w = weights[i - 1];
      const v = values[i - 1];
      if (w > c) {
        dp[i][c] = dp[i - 1][c];
        push(i, c, `Item ${i} doesn't fit (needs ${w}, have ${c})`, `Carry over the best value without this item: ${dp[i][c]}.`, 3);
      } else {
        const withItem = dp[i - 1][c - w] + v;
        const without = dp[i - 1][c];
        dp[i][c] = Math.max(withItem, without);
        push(i, c, `Item ${i} at capacity ${c}: max(${withItem}, ${without})`, `Take it (${dp[i - 1][c - w]} + ${v} = ${withItem}) or skip it (${without}) — keep the better one: ${dp[i][c]}.`, 6);
      }
    }
  }

  push(n, capacity, `Best value: ${dp[n][capacity]}`, `dp[${n}][${capacity}] = ${dp[n][capacity]} is the most value that fits in capacity ${capacity}.`, 0);
  frames[frames.length - 1].result = String(dp[n][capacity]);
  frames[frames.length - 1].resultLabel = 'Max value';
  return frames;
}

// ---------------------------------------------------------------------------
// Pattern: Longest Increasing Subsequence (O(n²) DP)
// ---------------------------------------------------------------------------

export function generateLISFrames(arrIn: number[]): DPFrame[] {
  const a = arrIn.slice(0, 12);
  const n = a.length;
  const dp = Array(n).fill(1);
  const frames: DPFrame[] = [];
  const colLabels = a.map((v) => String(v));

  const push = (i: number, j: number, stepTitle: string, explanation: string, codeLineIndex: number) => {
    frames.push({
      table: [[...dp]],
      rowLabels: ['LIS ending here'],
      colLabels,
      cellStates: [dp.map((_, k) => (k === i ? 'active' : k === j ? 'comparing' : k < i ? 'normal' : 'eliminated'))],
      highlightCol: i,
      stepTitle,
      explanation,
      codeLineIndex,
    });
  };

  if (n === 0) {
    frames.push({ table: [[]], rowLabels: [], colLabels: [], cellStates: [[]], stepTitle: 'Need an array', explanation: 'Enter at least one number.', codeLineIndex: 0 });
    return frames;
  }

  push(0, -1, 'Base case', `Every value is an increasing subsequence of length 1 by itself.`, 0);

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (a[j] < a[i]) {
        const candidate = dp[j] + 1;
        if (candidate > dp[i]) {
          dp[i] = candidate;
          push(i, j, `dp[${i}] = ${dp[i]}`, `a[${j}]=${a[j]} < a[${i}]=${a[i]}, so ${a[i]} can extend that run: dp[${i}] = dp[${j}] + 1 = ${dp[i]}.`, 4);
        } else {
          push(i, j, `a[${j}] < a[${i}], but no improvement`, `${a[j]} could extend to ${a[i]}, but dp[${i}] is already ${dp[i]}, which is at least as good.`, 4);
        }
      } else {
        push(i, j, `a[${j}] ≥ a[${i}]`, `${a[j]} isn't smaller than ${a[i]}, so it can't extend a run ending at ${a[i]}.`, 3);
      }
    }
  }

  const best = Math.max(...dp);
  const bestIdx = dp.indexOf(best);
  frames.push({
    table: [[...dp]],
    rowLabels: ['LIS ending here'],
    colLabels,
    cellStates: [dp.map((_, k) => (k === bestIdx ? 'target' : 'sorted'))],
    stepTitle: `Longest increasing subsequence: ${best}`,
    explanation: `The largest value in the table is ${best}, at index ${bestIdx} (value ${a[bestIdx]}). That's the length of the longest increasing run.`,
    codeLineIndex: 0,
    result: String(best),
    resultLabel: 'LIS length',
  });
  return frames;
}

// ---------------------------------------------------------------------------
// Pattern: House Robber (1D DP)
// ---------------------------------------------------------------------------

export function generateHouseRobberFrames(arrIn: number[]): DPFrame[] {
  const a = arrIn.slice(0, 14);
  const n = a.length;
  const dp = Array(n).fill(0);
  const frames: DPFrame[] = [];
  const colLabels = a.map((v) => String(v));

  const push = (i: number, stepTitle: string, explanation: string, codeLineIndex: number) => {
    frames.push({
      table: [[...dp]],
      rowLabels: ['Best up to here'],
      colLabels,
      cellStates: [dp.map((_, k) => (k === i ? 'active' : k < i ? 'normal' : 'eliminated'))],
      highlightCol: i,
      stepTitle,
      explanation,
      codeLineIndex,
    });
  };

  if (n === 0) {
    frames.push({ table: [[]], rowLabels: [], colLabels: [], cellStates: [[]], stepTitle: 'Need a array', explanation: 'Enter at least one house value.', codeLineIndex: 0 });
    return frames;
  }

  dp[0] = a[0];
  push(0, 'First house', `With only one house, rob it: dp[0] = ${a[0]}. No neighbor rule to worry about yet.`, 0);

  if (n > 1) {
    dp[1] = Math.max(a[0], a[1]);
    push(1, `dp[1] = max(${a[0]}, ${a[1]})`, `With two houses, rob whichever is worth more, since robbing both would trigger the alarm: dp[1] = ${dp[1]}.`, 1);
  }

  for (let i = 2; i < n; i++) {
    const skip = dp[i - 1];
    const take = dp[i - 2] + a[i];
    dp[i] = Math.max(skip, take);
    push(i, `dp[${i}] = max(${skip}, ${take})`, `Either skip house ${i} (keep dp[${i - 1}] = ${skip}) or rob it plus the best from two houses back (dp[${i - 2}] + ${a[i]} = ${take}). Best: ${dp[i]}.`, 3);
  }

  frames.push({
    table: [[...dp]],
    rowLabels: ['Best up to here'],
    colLabels,
    cellStates: [dp.map((_, k) => (k === n - 1 ? 'target' : 'sorted'))],
    stepTitle: `Maximum haul: ${dp[n - 1]}`,
    explanation: `dp[${n - 1}] = ${dp[n - 1]} is the most that can be robbed without ever taking two houses in a row.`,
    codeLineIndex: 0,
    result: String(dp[n - 1]),
    resultLabel: 'Max haul',
  });
  return frames;
}