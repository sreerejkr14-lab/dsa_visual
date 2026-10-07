import { useState, useEffect } from 'react';
import { challenges } from '../lib/challengeData';
import { useProgress } from '../lib/useProgress';
import { recordChallengeSolved, totalPoints } from '../lib/Progress';

const diffColor: Record<string, string> = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };

type Feedback = null | 'empty' | 'wrong' | 'correct';

export default function Challenges() {
  const [filter, setFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [active, setActive] = useState<number | null>(null); // which card is expanded
  const [workingId, setWorkingId] = useState<number | null>(null); // which challenge the workspace is running
  const [started, setStarted] = useState<Set<number>>(new Set());
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [attempts, setAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [replay, setReplay] = useState(false); // true when this challenge was already solved before

  // Solved challenges come from saved progress, so they survive a refresh.
  const progress = useProgress();
  const completed = new Set(Object.keys(progress.challenges).map(Number));
  const points = totalPoints(progress);

  // Count seconds while a challenge is in progress.
  useEffect(() => {
    if (!timerActive) return;
    const t = setInterval(() => setTimer((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [timerActive]);

  const filtered = challenges.filter((c) => filter === 'All' || c.difficulty === filter);
  const workingChallenge = challenges.find((c) => c.id === workingId);
  const solvedNow = feedback === 'correct';

  const startChallenge = (id: number) => {
    setWorkingId(id);
    setStarted((s) => new Set(s).add(id));
    setTimer(0);
    setTimerActive(true);
    setAnswer('');
    setFeedback(null);
    setAttempts(0);
    setRevealed(false);
    setReplay(id in progress.challenges);
  };

  const submitChallenge = () => {
    if (!workingChallenge) return;
    if (answer.trim() === '') {
      setFeedback('empty');
      return;
    }
    if (workingChallenge.check(answer)) {
      setTimerActive(false);
      if (!revealed) recordChallengeSolved(workingChallenge.id, workingChallenge.points, timer, attempts + 1); // revealed answers earn no points
      setFeedback('correct');
    } else {
      setAttempts((n) => n + 1);
      setFeedback('wrong');
    }
  };

  const clock = `${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">DSA Challenges</h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Test your understanding with real algorithm problems.</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-xl font-bold mono" style={{ color: 'var(--primary)' }}>{completed.size}/{challenges.length}</div>
            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Solved</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold mono" style={{ color: 'var(--accent)' }}>{points}</div>
            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Points</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(['All', 'Easy', 'Medium', 'Hard'] as const).map(d => (
          <button key={d} onClick={() => setFilter(d)}
            aria-pressed={filter === d}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: filter === d ? (d === 'All' ? 'var(--primary)' : `${diffColor[d]}22`) : 'var(--secondary)',
              color: filter === d ? (d === 'All' ? 'white' : diffColor[d]) : 'var(--muted-foreground)',
              border: filter === d && d !== 'All' ? `1px solid ${diffColor[d]}44` : '1px solid transparent',
            }}>
            {d}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        <div className="flex flex-col gap-3">
          {filtered.map(ch => (
            <div key={ch.id}
              className="p-5 rounded-xl cursor-pointer transition-all"
              style={{
                background: active === ch.id ? 'var(--secondary)' : 'var(--card)',
                border: `1px solid ${active === ch.id ? 'var(--primary)' : 'var(--border)'}`,
              }}
              onClick={() => setActive(ch.id === active ? null : ch.id)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{ch.title}</span>
                    {completed.has(ch.id) && <span className="text-xs" style={{ color: '#10b981' }}>✓ Solved</span>}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{ch.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="px-2 py-0.5 rounded text-xs font-medium mono"
                    style={{ background: `${diffColor[ch.difficulty]}18`, color: diffColor[ch.difficulty] }}>
                    {ch.difficulty}
                  </span>
                  <span className="mono text-xs" style={{ color: 'var(--muted-foreground)' }}>+{ch.points} pts</span>
                </div>
              </div>

              {active === ch.id && (
                <div className="mt-4 pt-4 border-t flex flex-col gap-3" style={{ borderColor: 'var(--border)' }}>
                  <div className="p-3 rounded-lg" style={{ background: 'var(--muted)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Input</p>
                    <code className="text-xs mono" style={{ color: 'var(--accent)' }}>{ch.input}</code>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <span className="font-semibold" style={{ color: 'var(--accent)' }}>Hint: </span>{ch.hint}
                    </p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); startChallenge(ch.id); }}
                    className="self-start px-5 py-2 rounded-lg text-sm font-semibold"
                    style={{ background: 'var(--primary)', color: 'white' }}>
                    {started.has(ch.id) ? 'Restart Challenge' : 'Start Challenge'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Active challenge workspace */}
        {workingChallenge ? (
          <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: 'var(--card)', border: '1px solid var(--border)', alignSelf: 'start' }}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">{workingChallenge.title}</h3>
              <span className="mono text-sm shrink-0" style={{ color: solvedNow ? '#10b981' : 'var(--accent)' }}>
                {solvedNow ? `✓ Solved in ${clock}` : `⏱ ${clock}`}
              </span>
            </div>

            <div className="p-3 rounded-lg" style={{ background: 'var(--secondary)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Input</p>
              <code className="text-xs mono" style={{ color: 'var(--foreground)' }}>{workingChallenge.input}</code>
            </div>

            <div>
              <label htmlFor="challenge-answer" className="text-xs font-semibold mb-2 block" style={{ color: 'var(--muted-foreground)' }}>Your Answer</label>
              <textarea
                id="challenge-answer"
                value={answer}
                onChange={e => { setAnswer(e.target.value); if (feedback !== 'correct') setFeedback(null); }}
                placeholder={workingChallenge.answerFormat}
                rows={4}
                disabled={solvedNow}
                className="w-full p-3 rounded-lg text-sm mono outline-none resize-none"
                style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
              <p className="text-xs mt-1.5" style={{ color: 'var(--muted-foreground)' }}>{workingChallenge.answerFormat}</p>
            </div>

            {solvedNow ? (
              <div className="p-4 rounded-lg" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <p className="text-sm font-semibold" style={{ color: '#10b981' }}>✓ Correct!</p>
                <div className="mt-2 space-y-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {revealed ? (
                    <p>No points this time, since the expected output was revealed.</p>
                  ) : replay ? (
                    <p>You already solved this one earlier, so there are no extra points.</p>
                  ) : (
                    <p>Points earned: <strong style={{ color: '#10b981' }}>+{workingChallenge.points}</strong></p>
                  )}
                  <p>Time: <strong style={{ color: 'var(--foreground)' }}>{clock}</strong> · Attempts: <strong style={{ color: 'var(--foreground)' }}>{attempts + 1}</strong></p>
                </div>
              </div>
            ) : (
              <>
                {feedback === 'empty' && (
                  <p role="alert" className="text-xs" style={{ color: '#f59e0b' }}>Type an answer first.</p>
                )}
                {feedback === 'wrong' && (
                  <div role="alert" className="p-3 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--muted-foreground)' }}>
                    <span className="font-semibold" style={{ color: '#ef4444' }}>Not quite. </span>
                    That isn't the expected result. Re-read the hint and try again.
                  </div>
                )}
                <button onClick={submitChallenge}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold"
                  style={{ background: 'var(--primary)', color: 'white' }}>
                  Submit Answer
                </button>
                {attempts >= 2 && !revealed && (
                  <button onClick={() => setRevealed(true)}
                    className="text-xs underline self-center" style={{ color: 'var(--muted-foreground)' }}>
                    Stuck? Reveal the expected output (no points)
                  </button>
                )}
                {revealed && (
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Expected: <code className="mono" style={{ color: 'var(--accent)' }}>{workingChallenge.expected}</code>
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', alignSelf: 'start' }}>
            <div className="text-4xl">◈</div>
            <p className="text-sm font-semibold">Select a challenge to begin</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Click on any challenge card and press "Start Challenge" to open the workspace.</p>
          </div>
        )}
      </div>
    </div>
  );
}