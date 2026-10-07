Design a modern, interactive web application called **“DSA Visualizer”** for students and developers to visually learn Data Structures and Algorithms.

The website should feel like a professional developer/education product rather than a basic student project. Use a clean dark developer-focused interface with strong visual hierarchy, smooth animations, rounded cards, subtle borders, and readable typography.

## 1. Main Dashboard

Create a responsive dashboard with:

* Top navigation bar

  * DSA Visualizer logo
  * Home
  * Algorithms
  * Data Structures
  * Challenges
  * About
  * Search icon
  * Theme toggle
  * User/profile icon

* Hero section:

  * Heading: “Understand DSA. Don’t Just Memorize It.”
  * Short description explaining that algorithms can be learned through interactive visualization.
  * Primary CTA: “Start Visualizing”
  * Secondary CTA: “Explore Algorithms”
  * Decorative visualization showing animated array elements, nodes, and graph connections.

* Algorithm categories section:

  * Sorting
  * Searching
  * Linked Lists
  * Stack & Queue
  * Trees
  * Graphs
  * Dynamic Programming

* Featured algorithms displayed as cards.

Each algorithm card should contain:

* Algorithm name
* Short description
* Difficulty
* Time complexity
* Space complexity
* Small visual preview
* “Visualize” button

## 2. Algorithms Page

Create an algorithms explorer page.

Left sidebar:

* All Algorithms
* Sorting
* Searching
* Linked List
* Stack
* Queue
* Trees
* Graphs
* Dynamic Programming

Add:

* Search algorithms input
* Difficulty filter
* Category filter

Main area should display algorithm cards.

Include these algorithms:

### Sorting

* Bubble Sort
* Selection Sort
* Insertion Sort
* Merge Sort
* Quick Sort

### Searching

* Linear Search
* Binary Search

### Data Structures

* Stack
* Queue
* Linked List
* Binary Tree
* Binary Search Tree
* Heap
* Hash Table

### Graphs

* BFS
* DFS
* Dijkstra
* Topological Sort

### Dynamic Programming

* Fibonacci
* Climbing Stairs
* Unique Paths
* 0/1 Knapsack
* Longest Common Subsequence

## 3. Algorithm Visualization Page

This is the most important screen.

Create a dedicated visualization workspace.

Top:

* Algorithm name
* Short explanation
* Difficulty badge
* Time complexity
* Space complexity

Example:

“Bubble Sort”

Time: O(n²)
Space: O(1)

Main visualization area:

Display an array as vertical bars.

Example:

[ 5 ] [ 2 ] [ 8 ] [ 1 ] [ 3 ] [ 7 ]

The visualization should have clearly distinguishable states:

* Normal element
* Currently selected element
* Element being compared
* Element being swapped
* Sorted element

Use subtle animation indicators and arrows to show comparisons and swaps.

Below the visualization:

Controls:

* Restart
* Previous Step
* Play
* Pause
* Next Step
* Speed control
* Randomize Input

Also provide an input field:

“Enter array values…”

with buttons:

* Generate Random Array
* Apply

## 4. Step Explanation Panel

Add a panel beside or below the visualization.

Title:

“Current Step”

Example:

Step 4 / 18

“Compare 5 and 2”

Explanation:

“Since 5 is greater than 2, the two elements need to be swapped.”

Show the current algorithm state.

Add:

Previous Step
Current Step
Next Step

The explanation should update as the visualization progresses.

## 5. Pseudocode Panel

Create a collapsible “Pseudocode” panel.

Display algorithm pseudocode with syntax highlighting.

Highlight the current pseudocode line corresponding to the current visualization step.

Example:

for i in range(n):
for j in range(n-i-1):
if arr[j] > arr[j+1]:
swap(arr[j], arr[j+1])

The currently executing line should have a clear highlighted background.

## 6. Complexity Panel

Create a compact complexity card.

Display:

Time Complexity
Best: O(n)
Average: O(n²)
Worst: O(n²)

Space Complexity
O(1)

Also include:

Stable: Yes

Use simple visual indicators rather than overwhelming charts.

## 7. Searching Visualization

Design a visualization specifically for Binary Search.

Show:

[ 2 ] [ 5 ] [ 8 ] [ 12 ] [ 16 ] [ 23 ] [ 31 ] [ 42 ] [ 50 ]

Display:

Left pointer
Middle pointer
Right pointer
Target

Example:

Target = 31

Clearly show the eliminated portion of the array.

Step explanation:

“Middle element is 16.”
“16 < 31, so search the right half.”

Include:

* Previous
* Play
* Pause
* Next
* Restart

## 8. Linked List Visualization

Create a linked-list visualizer.

Display:

HEAD
↓
[10] → [20] → [30] → [40] → NULL

Each node should visually contain:

* Value
* Next pointer

Allow operations:

* Insert at Beginning
* Insert at End
* Insert at Position
* Delete
* Search
* Reverse

Show pointer movement and node changes through animation.

## 9. Stack and Queue Visualization

Stack:

TOP
↓
┌────┐
│ 30 │
├────┤
│ 20 │
├────┤
│ 10 │
└────┘

Controls:

* Push
* Pop
* Peek
* Clear

Queue:

FRONT → [10] [20] [30] ← REAR

Controls:

* Enqueue
* Dequeue
* Peek
* Clear

## 10. Tree Visualization

Create a Binary Search Tree visualizer.

Example:

```
      50
    /    \
  30      70
 /  \    /  \
```

20   40  60   80

Nodes should be connected with clean lines.

Operations:

* Insert
* Delete
* Search

Traversal controls:

* Preorder
* Inorder
* Postorder
* Level Order

When traversal runs, highlight each visited node sequentially.

Show a step explanation:

“Visiting node 30”
“30 < 50, move to the left subtree.”

## 11. Graph Visualization

Create an interactive graph workspace.

Example:

```
  A
 / \
B   C
|   |
D---E
```

Nodes should be circular and edges should be clearly visible.

Controls:

* Add Node
* Add Edge
* Remove Node
* Remove Edge
* Clear Graph

Algorithms:

* BFS
* DFS
* Dijkstra
* Topological Sort

During execution:

* Highlight current node
* Highlight visited nodes
* Highlight active edge
* Show traversal order

Example:

Traversal:
A → B → C → D → E

## 12. Dynamic Programming Visualization

Create a DP visualization section.

Support:

* Fibonacci
* Climbing Stairs
* Unique Paths
* 0/1 Knapsack
* Longest Common Subsequence

For grid-based DP such as Unique Paths, show a grid with values inside each cell.

Example:

┌───┬───┬───┬───┐
│ 1 │ 1 │ 1 │ 1 │
├───┼───┼───┼───┤
│ 1 │ 2 │ 3 │ 4 │
├───┼───┼───┼───┤
│ 1 │ 3 │ 6 │10 │
└───┴───┴───┴───┘

Highlight the current cell and show which previous cells contributed to its value.

Display an explanation such as:

“Current cell = top + left”

Also show the recurrence/formula.

## 13. Challenge Mode

Create a “DSA Challenges” page.

Users can select:

* Easy
* Medium
* Hard

Example challenge:

“Sort the array using the fewest swaps.”

Show:

* Problem description
* Input
* Expected output
* Start Challenge button
* Timer
* Score
* Attempts

After completion show:

* Number of steps
* Time taken
* Complexity
* Solution explanation

## 14. Progress Dashboard

Create a learning progress section.

Show:

Algorithms Completed: 18 / 30

Categories:

Sorting       ████████░░
Searching     ██████░░░░
Trees         █████░░░░░
Graphs        ███░░░░░░░
DP            ████░░░░░░

Also show:

* Recently visualized algorithms
* Favorite algorithms
* Challenge history
* Learning streak

## 15. Responsive Design

Design all screens for:

* Desktop
* Tablet
* Mobile

On mobile:

* Convert sidebar into a menu
* Stack visualization and explanation panels vertically
* Keep visualization controls easily accessible
* Make array/tree/graph visualizations horizontally scrollable when necessary

## 16. Visual Style

Use a professional dark developer UI.

Design characteristics:

* Dark background
* Slightly lighter cards/panels
* Subtle borders
* Rounded corners
* Modern sans-serif typography
* Strong contrast
* Minimal gradients
* Clean icons
* Plenty of whitespace
* Developer-tool aesthetic
* Smooth micro-interactions

Avoid:

* Excessive gradients
* Excessive glowing effects
* Cartoonish educational graphics
* Overly complicated dashboards
* Too many colors

Use a restrained accent color system to distinguish algorithm states.

Important visualization states should be visually obvious:

* Current
* Comparing
* Swapping
* Visited
* Sorted
* Target
* Eliminated

## 17. Overall User Flow

Design the experience around this flow:

Dashboard
↓
Choose Algorithm
↓
Algorithm Information
↓
Visualization Workspace
↓
Run / Pause / Step Through Algorithm
↓
Read Current Step Explanation
↓
View Pseudocode
↓
View Complexity
↓
Try Another Algorithm

The interface should make the algorithm execution feel like a debugger: the user should always understand **what is happening, why it is happening, and which line/operation is currently being executed.**

Create a polished, production-quality UI suitable for an internship portfolio project.
