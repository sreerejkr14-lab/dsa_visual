import { Link } from 'react-router';
import { algorithms, categories } from '../lib/algorithmData';

// One tile per category, driven by the same list the Algorithms page filters on.
const categoryIcons: Record<string, string> = {
  Sorting: '⇅',
  Searching: '⌕',
  'Data Structures': '⊞',
  Trees: '⌥',
  Graphs: '⬡',
  'Dynamic Programming': '◈',
  Patterns: '✦',
};

const realCategories = categories.filter(c => c !== 'All');

const diffColor = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };

const AnimBar = ({ delay, height }: { delay: number; height: number }) => (
  <div
    className="w-5 rounded-sm transition-all"
    style={{
      height: `${height}px`,
      background: `var(--primary)`,
      opacity: 0.7 + delay * 0.05,
      animation: `barpulse ${1.5 + delay * 0.3}s ease-in-out ${delay * 0.2}s infinite alternate`,
    }}
  />
);

export default function Home() {
  const featured = algorithms.filter(a => ['bubble-sort', 'binary-search', 'merge-sort', 'bst', 'bfs', 'fibonacci'].includes(a.id));

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mono mb-6"
              style={{ background: 'rgba(124,58,237,0.12)', color: 'var(--primary)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Interactive Learning Platform
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4" style={{ letterSpacing: '-0.02em' }}>
              Understand DSA.{' '}
              <span style={{ color: 'var(--primary)' }}>Don't Just</span>{' '}
              Memorize It.
            </h1>
            <p className="text-lg mb-8" style={{ color: 'var(--muted-foreground)', lineHeight: 1.7 }}>
              Algorithms are easier to learn when you can see them in action. Step through every operation, understand each decision, and build intuition that sticks.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/visualizer/bubble-sort"
                className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
                style={{ background: 'var(--primary)', color: 'white' }}>
                Start Visualizing →
              </Link>
              <Link to="/algorithms"
                className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
                style={{ background: 'var(--secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                Explore Algorithms
              </Link>
            </div>
            <div className="flex gap-6 mt-10">
              {[[String(algorithms.length), 'Algorithms'], [String(realCategories.length), 'Categories'], ['100%', 'Interactive']].map(([val, label]) => (
                <div key={label}>
                  <div className="text-2xl font-bold mono" style={{ color: 'var(--primary)' }}>{val}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:flex relative items-end justify-center gap-2 h-52 p-6 rounded-xl"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <style>{`@keyframes barpulse { from { opacity: 0.5; transform: scaleY(0.85); } to { opacity: 1; transform: scaleY(1); } }`}</style>
            {[64, 112, 80, 144, 96, 48, 128, 72, 160, 56].map((h, i) => (
              <AnimBar key={i} delay={i} height={h} />
            ))}
            <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'var(--border)' }} />
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 50% at 80% 50%, rgba(124,58,237,0.06) 0%, transparent 70%)'
        }} />
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Algorithm Categories</h2>
          <Link to="/algorithms" className="text-sm" style={{ color: 'var(--primary)' }}>View all →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {realCategories.map(cat => {
            const count = algorithms.filter(a => a.category === cat).length;
            return (
              <Link key={cat} to={`/algorithms?cat=${encodeURIComponent(cat)}`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all hover:scale-105"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <span className="text-2xl">{categoryIcons[cat] ?? '◈'}</span>
                <span className="text-xs font-medium leading-tight">{cat}</span>
                <span className="text-xs mono" style={{ color: 'var(--muted-foreground)' }}>{count} {count === 1 ? 'algorithm' : 'algorithms'}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured algorithms */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Featured Algorithms</h2>
          <Link to="/algorithms" className="text-sm" style={{ color: 'var(--primary)' }}>See all →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map(algo => (
            <div key={algo.id} className="p-5 rounded-xl flex flex-col gap-3 transition-all hover:translate-y-[-2px]"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-sm">{algo.name}</h3>
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{algo.category}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-medium mono shrink-0"
                  style={{ background: `${diffColor[algo.difficulty]}18`, color: diffColor[algo.difficulty] }}>
                  {algo.difficulty}
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{algo.description}</p>
              <div className="flex gap-3 text-xs mono" style={{ color: 'var(--muted-foreground)' }}>
                <span>Time: <span style={{ color: 'var(--accent)' }}>{algo.timeComplexity.average}</span></span>
                <span>Space: <span style={{ color: 'var(--accent)' }}>{algo.spaceComplexity}</span></span>
              </div>
              <Link to={`/visualizer/${algo.id}`}
                className="mt-auto text-center py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: 'rgba(124,58,237,0.12)', color: 'var(--primary)', border: '1px solid rgba(124,58,237,0.2)' }}>
                Visualize →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}