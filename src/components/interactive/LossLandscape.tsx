import { useState, useEffect, useRef } from 'react';

// Simple 1D loss landscape: L(w) = (w - 2)² + 0.5*sin(3w)
function loss(w: number): number {
  return Math.pow(w - 2, 2) + 0.3 * Math.sin(3 * w) + 0.1;
}

function lossGradient(w: number): number {
  return 2 * (w - 2) + 0.9 * Math.cos(3 * w);
}

const W_RANGE = [-1, 5];
const L_RANGE = [0, 8];
const W = 440, H = 200;
const PAD = { top: 15, right: 20, bottom: 30, left: 45 };
const CW = W - PAD.left - PAD.right;
const CH = H - PAD.top - PAD.bottom;

function toSvgX(w: number) {
  return PAD.left + ((w - W_RANGE[0]) / (W_RANGE[1] - W_RANGE[0])) * CW;
}
function toSvgY(l: number) {
  return PAD.top + (1 - (l - L_RANGE[0]) / (L_RANGE[1] - L_RANGE[0])) * CH;
}

// Build loss curve path
function buildLossCurve(): string {
  const pts: string[] = [];
  for (let i = 0; i <= 300; i++) {
    const w = W_RANGE[0] + (i / 300) * (W_RANGE[1] - W_RANGE[0]);
    const l = Math.max(L_RANGE[0], Math.min(L_RANGE[1], loss(w)));
    pts.push(`${i === 0 ? 'M' : 'L'}${toSvgX(w).toFixed(1)},${toSvgY(l).toFixed(1)}`);
  }
  return pts.join(' ');
}

const LOSS_CURVE = buildLossCurve();
const LR = 0.12;

export default function LossLandscape() {
  const [weight, setWeight] = useState(-0.5);
  const [playing, setPlaying] = useState(false);
  const [history, setHistory] = useState<number[]>([-0.5]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = () => {
    if (timer.current) clearInterval(timer.current);
    setWeight(-0.5);
    setHistory([-0.5]);
    setPlaying(false);
  };

  const play = () => {
    reset();
    setPlaying(true);
    let w = -0.5;
    const hist = [w];

    timer.current = setInterval(() => {
      const grad = lossGradient(w);
      w = w - LR * grad;
      w = Math.max(W_RANGE[0] + 0.1, Math.min(W_RANGE[1] - 0.1, w));
      hist.push(w);
      setWeight(w);
      setHistory([...hist]);

      // Stop when converged
      if (Math.abs(grad) < 0.05 || hist.length > 60) {
        clearInterval(timer.current!);
        setPlaying(false);
      }
    }, 120);
  };

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const currentLoss = loss(weight);
  const converged = !playing && history.length > 5 && Math.abs(lossGradient(weight)) < 0.05;

  return (
    <div className="loss-landscape">
      <p className="loss-landscape__desc">
        The loss function creates a landscape of "how wrong the model is" for every possible weight value.
        Training = rolling a ball downhill to find the lowest point (minimum loss):
      </p>

      <div className="loss-landscape__chart-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} className="loss-landscape__svg">
          {/* Grid */}
          {[0, 2, 4, 6, 8].map(l => (
            <line key={l}
              x1={PAD.left} y1={toSvgY(l)}
              x2={W - PAD.right} y2={toSvgY(l)}
              stroke="#44475a" strokeWidth="1" strokeDasharray="3,3"
            />
          ))}
          {[-1, 0, 1, 2, 3, 4, 5].map(w => (
            <line key={w}
              x1={toSvgX(w)} y1={PAD.top}
              x2={toSvgX(w)} y2={H - PAD.bottom}
              stroke="#44475a" strokeWidth="1" strokeDasharray="3,3"
            />
          ))}

          {/* Axis labels */}
          {[0, 2, 4, 6].map(l => (
            <text key={l} x={PAD.left - 6} y={toSvgY(l) + 3}
              fill="#6272a4" fontSize="9" textAnchor="end">{l}</text>
          ))}
          <text x={PAD.left - 6} y={toSvgY(8) + 3} fill="#6272a4" fontSize="9" textAnchor="end">loss</text>
          <text x={W / 2} y={H - 4} fill="#6272a4" fontSize="9" textAnchor="middle">weight value →</text>

          {/* Loss curve */}
          <path d={LOSS_CURVE} fill="none" stroke="#6272a4" strokeWidth="2" strokeLinejoin="round" />

          {/* Trail of past positions */}
          {history.slice(0, -1).map((w, i) => (
            <circle key={i}
              cx={toSvgX(w)} cy={toSvgY(loss(w))}
              r="2"
              fill="#bd93f9"
              opacity={0.2 + (i / history.length) * 0.4}
            />
          ))}

          {/* Gradient arrow */}
          {!playing && history.length > 1 && !converged && (() => {
            const grad = lossGradient(weight);
            const arrowLen = Math.min(30, Math.abs(grad) * 15);
            const dir = grad > 0 ? -1 : 1;
            return (
              <line
                x1={toSvgX(weight)}
                y1={toSvgY(currentLoss)}
                x2={toSvgX(weight) + dir * arrowLen}
                y2={toSvgY(currentLoss)}
                stroke="#ff79c6"
                strokeWidth="2"
                markerEnd="url(#arrow)"
              />
            );
          })()}

          {/* Arrow marker */}
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#ff79c6" />
            </marker>
          </defs>

          {/* Current position */}
          <circle
            cx={toSvgX(weight)}
            cy={toSvgY(currentLoss)}
            r="6"
            fill={converged ? '#50fa7b' : '#ff79c6'}
            stroke="#282a36"
            strokeWidth="2"
          />

          {/* Minimum marker */}
          <line x1={toSvgX(2)} y1={PAD.top} x2={toSvgX(2)} y2={H - PAD.bottom}
            stroke="#50fa7b" strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
          <text x={toSvgX(2) + 4} y={PAD.top + 10} fill="#50fa7b" fontSize="8">minimum</text>
        </svg>
      </div>

      {/* Readout */}
      <div className="loss-landscape__readout">
        <span className="loss-landscape__stat">
          weight: <strong>{weight.toFixed(3)}</strong>
        </span>
        <span className="loss-landscape__stat">
          loss: <strong style={{ color: currentLoss > 3 ? '#ff5555' : currentLoss > 1 ? '#ffb86c' : '#50fa7b' }}>
            {currentLoss.toFixed(3)}
          </strong>
        </span>
        <span className="loss-landscape__stat">
          gradient: <strong>{lossGradient(weight).toFixed(3)}</strong>
        </span>
        {converged && (
          <span className="loss-landscape__converged">✓ converged — minimum found</span>
        )}
      </div>

      {/* Manual slider */}
      <div className="loss-landscape__manual">
        <span className="loss-landscape__manual-label">drag manually:</span>
        <input
          type="range"
          min={W_RANGE[0]}
          max={W_RANGE[1]}
          step="0.05"
          value={weight}
          onChange={e => {
            if (!playing) {
              const w = parseFloat(e.target.value);
              setWeight(w);
              setHistory([w]);
            }
          }}
          className="loss-landscape__slider"
        />
      </div>

      <div className="loss-landscape__controls">
        <button
          onClick={playing ? reset : play}
          className={`loss-landscape__btn ${!playing ? 'loss-landscape__btn--play' : ''}`}
        >
          {playing ? '↺ Reset' : history.length > 1 ? '↺ Replay' : '▶ Run gradient descent'}
        </button>
      </div>

      <p className="loss-landscape__note">
        The pink dot is the current weight. The pink arrow shows the gradient direction.
        Training moves the weight opposite the gradient (downhill) on every step.
        In a real model, this happens for billions of weights simultaneously.
      </p>
    </div>
  );
}
