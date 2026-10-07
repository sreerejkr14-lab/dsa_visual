import { Link } from 'react-router';
import { algorithms, categories } from '../lib/algorithmData';
import { challenges } from '../lib/challengeData';
import { useProgress } from '../lib/useProgress';
import { useAuth } from '../lib/AuthContext';
import { useSyncStatus } from '../lib/useSyncStatus';
import {
  categoryProgress,
  dayKey,
  lastNDays,
  recentVisits,
  resetProgress,
  streakInfo,
  timeAgo,
  toggleFavorite,
  totalPoints,
} from '../lib/Progress';

const categoryColor: Record<string, string> = {
  Sorting: '#7c3aed',
  Searching: '#06b6d4',
  'Data Structures': '#f59e0b',
  Trees: '#10b981',
  Graphs: '#ef4444',
  'Dynamic Programming': '#a855f7',
};

const card = { background: 'var(--card)', border: '1px solid var(--border)' } as const;

export default function Progress() {
  const progress = useProgress();
  const { user, configured } = useAuth();
  const sync = useSyncStatus();
  const now = new Date();
  const today = dayKey(now);

  const cats = categoryProgress(progress, algorithms, categories.filter((c) => c !== 'All'));
  const totalDone = algorithms.filter((a) => progress.completed[a.id]).length;
  const totalAll = algorithms.length;
  const overallPct = totalAll ? Math.round((totalDone / totalAll) * 100) : 0;

  const solved = challenges.filter((c) => progress.challenges[String(c.id)]).length;
  const streak = streakInfo(progress.activity, today);
  const days = lastNDays(progress.activity, 28, today);
  const activeDays = days.filter((d) => d.count > 0).length;

  const recent = recentVisits(progress, 5)
    .map((r) => ({ ...r, algo: algorithms.find((a) => a.id === r.id) }))
    .filter((r) => r.algo);
  const favorites = progress.favorites
    .map((id) => algorithms.find((a) => a.id === id))
    .filter((a): a is (typeof algorithms)[number] => !!a);
  const nextUp = algorithms.find((a) => !progress.completed[a.id]);

  const stats = [
    { label: 'Algorithms Completed', value: `${totalDone}/${totalAll}`, color: 'var(--primary)', note: 'played to the last step' },
    { label: 'Challenges Solved', value: `${solved}/${challenges.length}`, color: 'var(--accent)', note: '' },
    { label: 'Learning Streak', value: `${streak.current} ${streak.current === 1 ? 'day' : 'days'}`, color: '#f59e0b', note: `best: ${streak.longest}` },
    { label: 'Total Points', value: String(totalPoints(progress)), color: '#10b981', note: '' },
  ];

  const onReset = () => {
    const where = user ? 'your account' : 'this browser';
    if (window.confirm(`Reset all progress saved in ${where}? This cannot be undone.`)) resetProgress();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Learning Progress</h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Track your journey through data structures and algorithms.{' '}
            {user ? (
              <span role="status" style={{ color: sync === 'error' ? '#f59e0b' : undefined }}>
                {sync === 'synced' && '✓ Saved to your account.'}
                {sync === 'syncing' && 'Saving to your account…'}
                {sync === 'error' && "Couldn't reach the server. Your progress is safe here and will sync when it reconnects."}
                {sync === 'guest' && 'Saved to your account.'}
              </span>
            ) : configured ? (
              <span>
                Saved in this browser only.{' '}
                <Link to="/login" style={{ color: 'var(--primary)' }}>Log in</Link> to keep it in your account.
              </span>
            ) : (
              <span>Saved in this browser.</span>
            )}
          </p>
        </div>
        {nextUp && (
          <Link to={`/visualizer/${nextUp.id}`}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--primary)', color: 'white' }}>
            {totalDone === 0 ? 'Start with' : 'Up next:'} {nextUp.name} →
          </Link>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, color, note }) => (
          <div key={label} className="p-4 rounded-xl" style={card}>
            <div className="text-2xl font-bold mono mb-1" style={{ color }}>{value}</div>
            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
            {note && <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>{note}</div>}
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="p-5 rounded-xl" style={card}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Overall Progress</h2>
          <span className="mono text-sm" style={{ color: 'var(--primary)' }}>{overallPct}%</span>
        </div>
        <div className="progress-bar mb-6" style={{ height: 8 }} role="progressbar" aria-valuenow={overallPct} aria-valuemin={0} aria-valuemax={100} aria-label="Overall progress">
          <div className="progress-fill" style={{ width: `${overallPct}%`, background: 'var(--primary)' }} />
        </div>

        <div className="space-y-4">
          {cats.map((cat) => (
            <div key={cat.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm">{cat.name}</span>
                <span className="mono text-xs" style={{ color: 'var(--muted-foreground)' }}>{cat.done}/{cat.total}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${cat.total ? (cat.done / cat.total) * 100 : 0}%`, background: categoryColor[cat.name] ?? 'var(--primary)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Recently visualized */}
        <div className="p-5 rounded-xl" style={card}>
          <h2 className="font-semibold mb-4">Recently Visualized</h2>
          <div className="space-y-2">
            {recent.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Nothing yet. Open an algorithm and it will show up here.
              </p>
            )}
            {recent.map((r) => (
              <Link key={r.id} to={`/visualizer/${r.id}`}
                className="flex items-center justify-between p-3 rounded-lg transition-colors hover:opacity-80"
                style={{ background: 'var(--secondary)' }}>
                <div>
                  <p className="text-sm font-medium">{r.algo!.name}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{r.algo!.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{timeAgo(r.last, now)}</span>
                  {progress.completed[r.id] && <span style={{ color: '#10b981' }} title="Played to the last step">✓</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Favorites */}
        <div className="p-5 rounded-xl" style={card}>
          <h2 className="font-semibold mb-4">Favorite Algorithms</h2>
          <div className="space-y-2">
            {favorites.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--secondary)' }}>
                <Link to={`/visualizer/${f.id}`} className="flex-1 transition-colors hover:opacity-80">
                  <p className="text-sm font-medium">{f.name}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{f.category}</p>
                </Link>
                <button onClick={() => toggleFavorite(f.id)} aria-label={`Remove ${f.name} from favorites`}
                  className="text-lg px-1" style={{ color: '#f59e0b', background: 'transparent' }}>★</button>
              </div>
            ))}
            <Link to="/algorithms"
              className="flex items-center justify-center p-3 rounded-lg text-sm transition-colors"
              style={{ background: 'transparent', border: '1px dashed var(--border)', color: 'var(--muted-foreground)' }}>
              {favorites.length === 0 ? 'Star an algorithm to add it here' : '+ Add favorite'}
            </Link>
          </div>
        </div>
      </div>

      {/* Activity calendar */}
      <div className="p-5 rounded-xl" style={card}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Activity — Last 28 Days</h2>
          <span className="text-xs mono" style={{ color: 'var(--muted-foreground)' }}>{activeDays} active {activeDays === 1 ? 'day' : 'days'}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {days.map((d) => (
            <div key={d.date} className="w-7 h-7 rounded-sm"
              title={`${d.date}: ${d.count} ${d.count === 1 ? 'action' : 'actions'}`}
              style={{
                background: d.count >= 3 ? 'var(--primary)' : d.count > 0 ? 'rgba(124,58,237,0.35)' : 'var(--secondary)',
                outline: d.date === today ? '1px solid var(--accent)' : 'none',
              }} />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--secondary)' }} />
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>No activity</span>
          <div className="w-3 h-3 rounded-sm ml-2" style={{ background: 'rgba(124,58,237,0.35)' }} />
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>1–2 actions</span>
          <div className="w-3 h-3 rounded-sm ml-2" style={{ background: 'var(--primary)' }} />
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>3+ actions</span>
          <span className="text-xs ml-2" style={{ color: 'var(--muted-foreground)' }}>· Opening an algorithm, finishing one, or solving a challenge each count as an action. Today is outlined.</span>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onReset} className="text-xs underline" style={{ color: 'var(--muted-foreground)', background: 'transparent' }}>
          Reset progress
        </button>
      </div>
    </div>
  );
}