import { useState } from 'react';

// Simulated loss curve — deterministic, no random() to avoid SSR hydration mismatch
function generateLoss(steps: number): number[] {
  const points: number[] = [];
  // Use a seeded pseudo-noise based on index instead of Math.random()
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const base = 4.5 * Math.exp(-5 * t) + 0.3;
    // Deterministic "noise" using sine
    const noise = Math.sin(i * 7.3) * 0.06 * Math.exp(-3 * t);
    points.push(Math.max(0.25, base + noise));
  }
  return points;
}

const TOTAL_STEPS = 80;
const LOSS_DATA = generateLoss(TOTAL_STEPS);

const MILESTONES = [
  { step: 0,  label: 'Random weights — outputs gibberish', loss: LOSS_DATA[0] },
  { step: 10, label: 'Learning basic word patterns', loss: LOSS_DATA[10] },
  { step: 25, label: 'Grammar starting to form', loss: LOSS_DATA[25] },
  { step: 45, label: 'Meaning and context emerging', loss: LOSS_DATA[45] },
  { step: 70, label: 'Converged — model "knows" things', loss: LOSS_DATA[70] },
];

export default function TrainingLoss() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);

  const currentLoss = LOSS_DATA[step];
  const milestone = [...MILESTONES].reverse().find(m => step >= m.step);

  const play = () => {
    if (step >= TOTAL_STEPS - 1) setStep(0);
    setIsPlaying(true);
    const id = setInterval(() => {
      setStep(prev => {
        if (prev >= TOTAL_STEPS - 1) {
          clearInterval(id);
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 60);
    setIntervalId(id);
  };

  const pause = () => {
    if (intervalId) clearInterval(intervalId);
    setIsPlaying(false);
  };

  const reset = () => {
    if (intervalId) clearInterval(intervalId);
    setIsPlaying(false);
    setStep(0);
  };

  // Chart dimensions
  const W = 500, H = 160;
  const PAD = { top: 10, right: 20, bottom: 30, left: 45 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxLoss = 5.0;
  const minLoss = 0.0;

  const toX = (i: number) => PAD.left + (i / (TOTAL_STEPS - 1)) * chartW;
  const toY = (loss: number) => PAD.top + (1 - (loss - minLoss) / (maxLoss - minLoss)) * chartH;

  // Build path up to current step
  const pathD = LOSS_DATA.slice(0, step + 1)
    .map((loss, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(loss)}`)
    .join(' ');

  return (
    <div className="training-loss">
      <p className="training-loss__desc">
        During training, loss starts high (model is wrong) and drops as weights get nudged billions of times.
        Hit play to watch it happen:
      </p>

      {/* SVG Chart */}
      <div className="training-loss__chart-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} className="training-loss__svg">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4, 5].map(v => (
            <g key={v}>
              <line
                x1={PAD.left} y1={toY(v)}
                x2={W - PAD.right} y2={toY(v)}
                stroke="#44475a" strokeWidth="1" strokeDasharray="3,3"
              />
              <text x={PAD.left - 6} y={toY(v) + 4} fill="#6272a4" fontSize="9" textAnchor="end">
                {v.toFixed(0)}
              </text>
            </g>
          ))}

          {/* Axes */}
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H - PAD.bottom} stroke="#6272a4" strokeWidth="1" />
          <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#6272a4" strokeWidth="1" />

          {/* Axis labels */}
          <text x={W / 2} y={H - 4} fill="#6272a4" fontSize="9" textAnchor="middle">Training steps (billions in real models)</text>
          <text x={12} y={H / 2} fill="#6272a4" fontSize="9" textAnchor="middle" transform={`rotate(-90, 12, ${H / 2})`}>Loss</text>

          {/* Milestone markers */}
          {MILESTONES.map(m => (
            <line
              key={m.step}
              x1={toX(m.step)} y1={PAD.top}
              x2={toX(m.step)} y2={H - PAD.bottom}
              stroke="#44475a" strokeWidth="1" strokeDasharray="2,2"
            />
          ))}

          {/* Loss path */}
          {pathD && (
            <path d={pathD} fill="none" stroke="#50fa7b" strokeWidth="2" strokeLinejoin="round" />
          )}

          {/* Current point */}
          {step > 0 && (
            <circle
              cx={toX(step)}
              cy={toY(currentLoss)}
              r="4"
              fill="#ff79c6"
              stroke="#282a36"
              strokeWidth="1.5"
            />
          )}
        </svg>
      </div>

      {/* Controls */}
      <div className="training-loss__controls">
        <button
          onClick={isPlaying ? pause : play}
          className="training-loss__btn training-loss__btn--play"
        >
          {isPlaying ? '⏸ Pause' : step >= TOTAL_STEPS - 1 ? '↺ Replay' : '▶ Play'}
        </button>
        <button onClick={reset} className="training-loss__btn">
          Reset
        </button>
        <input
          type="range"
          min={0}
          max={TOTAL_STEPS - 1}
          value={step}
          onChange={e => { pause(); setStep(Number(e.target.value)); }}
          className="training-loss__slider"
        />
      </div>

      {/* Current state */}
      <div className="training-loss__state">
        <span className="training-loss__loss-val">
          Loss: <strong>{currentLoss.toFixed(2)}</strong>
        </span>
        {milestone && (
          <span className="training-loss__milestone">
            {milestone.label}
          </span>
        )}
      </div>
    </div>
  );
}
