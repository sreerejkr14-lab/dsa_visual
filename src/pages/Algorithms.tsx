import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { algorithms, categories } from '../lib/algorithmData';
import { useProgress } from '../lib/useProgress';
import { toggleFavorite } from '../lib/Progress';

const diffColor = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };

export default function Algorithms() {
  const [params, setParams] = useSearchParams();
  const progress = useProgress();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(params.get('cat') || 'All');
  const [selectedDiff, setSelectedDiff] = useState('All');

  // Keep the selected category in sync with the URL (e.g. arriving from a Home tile, or pressing Back).
  useEffect(() => {
    setSelectedCat(params.get('cat') || 'All');
  }, [params]);

  const selectCat = (cat: string) => {
    setSelectedCat(cat);
    setParams(cat !== 'All' ? { cat } : {});
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedDiff('All');
    selectCat('All');
  };

  const filtered = algorithms.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === 'All' || a.category === selectedCat;
    const matchDiff = selectedDiff === 'All' || a.difficulty === selectedDiff;
    return matchSearch && matchCat && matchDiff;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex gap-6">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col gap-1 w-48 shrink-0">
        <p className="text-xs font-semibold mb-2 px-3" style={{ color: 'var(--muted-foreground)' }}>CATEGORIES</p>
        {categories.map(cat => (
          <button key={cat} onClick={() => selectCat(cat)} aria-pressed={selectedCat === cat}
            className="text-left px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              background: selectedCat === cat ? 'var(--secondary)' : 'transparent',
              color: selectedCat === cat ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontWeight: selectedCat === cat ? 600 : 400,
            }}>
            {cat}
          </button>
        ))}
        <div className="my-3 h-px" style={{ background: 'var(--border)' }} />
        <p className="text-xs font-semibold mb-2 px-3" style={{ color: 'var(--muted-foreground)' }}>DIFFICULTY</p>
        {['All', 'Easy', 'Medium', 'Hard'].map(d => (
          <button key={d} onClick={() => setSelectedDiff(d)} aria-pressed={selectedDiff === d}
            className="text-left px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              background: selectedDiff === d ? 'var(--secondary)' : 'transparent',
              color: selectedDiff === d ? 'var(--foreground)' : 'var(--muted-foreground)',
            }}>
            {d}
          </button>
        ))}
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search algorithms…"
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>
        </div>

        {/* Mobile filters: every category plus difficulty (the sidebar is hidden below lg) */}
        <div className="lg:hidden flex flex-col gap-2 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button key={cat} onClick={() => selectCat(cat)} aria-pressed={selectedCat === cat}
                className="px-3 py-1.5 rounded-lg text-xs font-medium shrink-0"
                style={{
                  background: selectedCat === cat ? 'var(--primary)' : 'var(--secondary)',
                  color: selectedCat === cat ? 'white' : 'var(--muted-foreground)',
                }}>
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['All', 'Easy', 'Medium', 'Hard'].map(d => (
              <button key={d} onClick={() => setSelectedDiff(d)} aria-pressed={selectedDiff === d}
                className="px-3 py-1.5 rounded-lg text-xs font-medium shrink-0"
                style={{
                  background: selectedDiff === d ? 'var(--secondary)' : 'transparent',
                  color: selectedDiff === d ? 'var(--foreground)' : 'var(--muted-foreground)',
                  border: '1px solid var(--border)',
                }}>
                {d === 'All' ? 'Any difficulty' : d}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {filtered.length} algorithm{filtered.length !== 1 ? 's' : ''}
            {selectedCat !== 'All' && <span> in <strong style={{ color: 'var(--foreground)' }}>{selectedCat}</strong></span>}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(algo => (
            <div key={algo.id} className="p-5 rounded-xl flex flex-col gap-3 transition-all hover:translate-y-[-2px]"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-sm">
                    {algo.name}
                    {progress.completed[algo.id] && <span className="ml-1.5 text-xs" style={{ color: '#10b981' }} title="Completed">✓</span>}
                  </h3>
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{algo.category}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleFavorite(algo.id)}
                    aria-pressed={progress.favorites.includes(algo.id)}
                    aria-label={progress.favorites.includes(algo.id) ? `Remove ${algo.name} from favorites` : `Add ${algo.name} to favorites`}
                    className="text-base leading-none px-1"
                    style={{ color: progress.favorites.includes(algo.id) ? '#f59e0b' : 'var(--muted-foreground)', background: 'transparent' }}>
                    {progress.favorites.includes(algo.id) ? '★' : '☆'}
                  </button>
                  <span className="px-2 py-0.5 rounded text-xs font-medium mono"
                    style={{ background: `${diffColor[algo.difficulty]}18`, color: diffColor[algo.difficulty] }}>
                    {algo.difficulty}
                  </span>
                </div>
              </div>
              <p className="text-xs leading-relaxed flex-1" style={{ color: 'var(--muted-foreground)' }}>{algo.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  ['Time (avg)', algo.timeComplexity.average],
                  ['Space', algo.spaceComplexity],
                ].map(([label, val]) => (
                  <div key={label} className="px-2 py-1.5 rounded-md" style={{ background: 'var(--secondary)' }}>
                    <div style={{ color: 'var(--muted-foreground)' }}>{label}</div>
                    <div className="mono font-semibold" style={{ color: 'var(--accent)' }}>{val}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {algo.tags.map(t => (
                  <span key={t} className="px-1.5 py-0.5 rounded text-xs mono"
                    style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>{t}</span>
                ))}
              </div>
              <Link to={`/visualizer/${algo.id}`}
                className="text-center py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: 'rgba(124,58,237,0.12)', color: 'var(--primary)', border: '1px solid rgba(124,58,237,0.2)' }}>
                Visualize →
              </Link>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--muted-foreground)' }}>
            <div className="text-4xl mb-3">◈</div>
            <p className="text-sm mb-3">No algorithms match your filters.</p>
            <button onClick={clearFilters} className="px-4 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'var(--secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}