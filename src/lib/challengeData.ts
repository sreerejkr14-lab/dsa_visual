export interface Challenge {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  input: string;
  expected: string;
  answerFormat: string;
  hint: string;
  points: number;
  /** Returns true when the typed answer is correct. */
  check: (answer: string) => boolean;
}

/** Pull every integer out of a free-form answer, e.g. "[[3],[9,20]]" -> ['3', '9', '20'] */
const numbersIn = (text: string) => text.match(/-?\d+/g) ?? [];
const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i]);
const saysYes = (text: string) => /^\s*(true|yes)\b/i.test(text);

export const challenges: Challenge[] = [
  {
    id: 1, title: 'Sort with Fewest Swaps', difficulty: 'Easy', category: 'Sorting',
    description: 'Given an array of integers, sort it using the fewest number of swaps possible.',
    input: '[64, 25, 12, 22, 11]', expected: '[11, 12, 22, 25, 64]',
    answerFormat: 'Type the sorted array, e.g. [1, 2, 3]',
    hint: 'Think about which algorithm minimizes the number of swap operations.',
    points: 100,
    check: (a) => sameList(numbersIn(a), ['11', '12', '22', '25', '64']),
  },
  {
    id: 2, title: 'Find in Rotated Array', difficulty: 'Medium', category: 'Searching',
    description: 'Search for a target value in a sorted array that has been rotated at some pivot.',
    input: 'arr = [4, 5, 6, 7, 0, 1, 2], target = 0', expected: 'index 4',
    answerFormat: 'Type the index where the target is found, e.g. 3',
    hint: 'A modified binary search can solve this in O(log n).',
    points: 250,
    check: (a) => sameList(numbersIn(a), ['4']),
  },
  {
    id: 3, title: 'Balanced Parentheses', difficulty: 'Easy', category: 'Stack',
    description: 'Use a stack to determine if a string of parentheses, brackets, and braces is balanced.',
    input: '"([{}])"', expected: 'true',
    answerFormat: 'Type true or false',
    hint: 'Push opening brackets; pop and check for matching closing brackets.',
    points: 150,
    check: saysYes,
  },
  {
    id: 4, title: 'Level Order Traversal', difficulty: 'Medium', category: 'Trees',
    description: 'Return the level-order (BFS) traversal of a binary tree as a list of lists.',
    input: 'root = [3,9,20,null,null,15,7]', expected: '[[3],[9,20],[15,7]]',
    answerFormat: 'Type the levels as a list of lists, e.g. [[1],[2,3]]',
    hint: 'Use a queue. Process nodes level by level.',
    points: 300,
    check: (a) => sameList(numbersIn(a), ['3', '9', '20', '15', '7']) && (a.match(/\[/g) ?? []).length >= 4,
  },
  {
    id: 5, title: 'Coin Change', difficulty: 'Hard', category: 'Dynamic Programming',
    description: 'Given coin denominations and an amount, find the minimum number of coins to make the amount.',
    input: 'coins = [1,5,11], amount = 15', expected: '3 coins (5+5+5)',
    answerFormat: 'Type the minimum number of coins, e.g. 4',
    hint: 'Bottom-up DP: dp[i] = min coins to make amount i.',
    points: 500,
    check: (a) => {
      const n = numbersIn(a);
      return sameList(n, ['3']) || sameList(n, ['3', '5', '5', '5']) || sameList(n, ['5', '5', '5']);
    },
  },
  {
    id: 6, title: 'Detect Cycle in Graph', difficulty: 'Hard', category: 'Graphs',
    description: 'Given a directed graph, determine if it contains a cycle using DFS.',
    input: 'edges = [[0,1],[1,2],[2,0]]', expected: 'true (cycle exists)',
    answerFormat: 'Type true or false',
    hint: 'Track nodes in the current DFS path with a "recursion stack".',
    points: 450,
    check: saysYes,
  },
];