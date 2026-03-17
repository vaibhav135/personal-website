import { useState } from 'react';

type FnName = 'relu' | 'sigmoid' | 'tanh' | 'softmax';

const FNS: { id: FnName; label: string; color: string; desc: string }[] = [
  {
    id: 'relu',
    label: 'ReLU',
    color: '#50fa7b',
    desc: 'max(0, x) — kills negatives, passes positives unchanged. Fast, simple, default choice for hidden layers.',
  },
  {
    id: 'sigmoid',
    label: 'Sigmoid',
    color: '#ffb86c',
    desc: '1/(1+e⁻ˣ) — squishes any number into 0–1. Used for binary yes/no decisions. Saturates at extremes (gradient vanishing risk).',
  },
  {
    id: 'tanh',
    label: 'Tanh',
    color: '#8be9fd',
    desc: 'Like sigmoid but outputs -1 to +1. Zero-centered, which helps gradients. Still saturates at extremes.',
  },
  {
    id: 'softmax',
    label: 'Softmax',
    color: '#bd93f9',
    desc: 'eˣⁱ / Σeˣʲ — converts a list of scores into probabilities that sum to 1.0. Used at the output layer to pick the next token.',
  },
];

function computeY(fn: FnName, x: number): number {
  switch (fn) {
    case 'relu':    return Math.max(0, x);
    case 'sigmoid': return 1 / (1 + Math.exp(-x));
    case 'tanh':    return Math.tanh(x);
    case 'softmax': return 1 / (1 + Math.exp(-x)); // simplified for single-variable display
  }
}

// SVG chart dimensions
const W = 400, H = 200;
const PAD = { top: 15, right: 20, bottom: 30, left: 40 };
const CW = W - PAD.left - PAD.right;
const CH = H - PAD.top - PAD.bottom;

const X_RANGE = [-4, 4];
const Y_RANGE = [-1.5, 1.5];

function toSvgX(x: number) {
  return PAD.left + ((x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0])) * CW;
}
function toSvgY(y: number) {
  return PAD.top + (1 - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0])) * CH;
}

function buildPath(fn: FnName): string {
  const points: string[] = [];
  for (let i = 0; i <= 200; i++) {
    const x = X_RANGE[0] + (i / 200) * (X_RANGE[1] - X_RANGE[0]);
    const y = computeY(fn, x);
    const clampedY = Math.max(Y_RANGE[0], Math.min(Y_RANGE[1], y));
    points.push(`${i === 0 ? 'M' : 'L'}${toSvgX(x).toFixed(1)},${toSvgY(clampedY).toFixed(1)}`);
  }
  return points.join(' ');
}

export default function ActivationCurves() {
  const [active, setActive] = useState<FnName>('relu');
  const [hoverX, setHoverX] = useState<number | null>(null);

  const activeFn = FNS.find(f => f.id === active)!;
  const hoverY = hoverX !== null ? computeY(active, hoverX) : null;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    // Convert px to data x
    const svgX = (px / rect.width) * W;
    const dataX = X_RANGE[0] + ((svgX - PAD.left) / CW) * (X_RANGE[1] - X_RANGE[0]);
    if (dataX >= X_RANGE[0] && dataX <= X_RANGE[1]) {
      setHoverX(Math.round(dataX * 10) / 10);
    }
  };

  return (
    <div className="act-curves">
      <p className="act-curves__desc">
        Activation functions are applied after each matrix multiplication.
        Their shape determines what the layer can learn. Select one to see its curve:
      </p>

      {/* Function selector */}
      <div className="act-curves__fns">
        {FNS.map(fn => (
          <button
            key={fn.id}
            onClick={() => setActive(fn.id)}
            className={`act-curves__fn-btn ${active === fn.id ? 'act-curves__fn-btn--active' : ''}`}
            style={active === fn.id ? { borderColor: fn.color, color: fn.color, background: fn.color + '22' } : {}}
          >
            {fn.label}
          </button>
        ))}
      </div>

      {/* SVG chart */}
      <div className="act-curves__chart-wrap">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="act-curves__svg"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverX(null)}
        >
          {/* Grid lines */}
          {[-1, 0, 1].map(y => (
            <line key={y}
              x1={PAD.left} y1={toSvgY(y)}
              x2={W - PAD.right} y2={toSvgY(y)}
              stroke={y === 0 ? '#6272a4' : '#44475a'}
              strokeWidth={y === 0 ? 1.5 : 1}
              strokeDasharray={y === 0 ? 'none' : '3,3'}
            />
          ))}
          {[-4, -2, 0, 2, 4].map(x => (
            <line key={x}
              x1={toSvgX(x)} y1={PAD.top}
              x2={toSvgX(x)} y2={H - PAD.bottom}
              stroke={x === 0 ? '#6272a4' : '#44475a'}
              strokeWidth={x === 0 ? 1.5 : 1}
              strokeDasharray={x === 0 ? 'none' : '3,3'}
            />
          ))}

          {/* Axis labels */}
          {[-4, -2, 0, 2, 4].map(x => (
            <text key={x} x={toSvgX(x)} y={H - PAD.bottom + 12}
              fill="#6272a4" fontSize="9" textAnchor="middle">{x}</text>
          ))}
          {[-1, 0, 1].map(y => (
            <text key={y} x={PAD.left - 5} y={toSvgY(y) + 3}
              fill="#6272a4" fontSize="9" textAnchor="end">{y}</text>
          ))}

          {/* All inactive curves (faint) */}
          {FNS.filter(f => f.id !== active).map(fn => (
            <path key={fn.id}
              d={buildPath(fn.id)}
              fill="none"
              stroke={fn.color}
              strokeWidth="1"
              opacity="0.15"
            />
          ))}

          {/* Active curve */}
          <path
            d={buildPath(active)}
            fill="none"
            stroke={activeFn.color}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Hover indicator */}
          {hoverX !== null && hoverY !== null && (
            <>
              <line
                x1={toSvgX(hoverX)} y1={PAD.top}
                x2={toSvgX(hoverX)} y2={H - PAD.bottom}
                stroke={activeFn.color} strokeWidth="1" strokeDasharray="3,3" opacity="0.6"
              />
              <circle
                cx={toSvgX(hoverX)}
                cy={toSvgY(Math.max(Y_RANGE[0], Math.min(Y_RANGE[1], hoverY)))}
                r="4"
                fill={activeFn.color}
                stroke="#282a36"
                strokeWidth="1.5"
              />
              <rect
                x={toSvgX(hoverX) + 6}
                y={toSvgY(Math.max(Y_RANGE[0], Math.min(Y_RANGE[1], hoverY))) - 16}
                width="72" height="18" rx="3"
                fill="#282a36" stroke={activeFn.color} strokeWidth="1"
              />
              <text
                x={toSvgX(hoverX) + 42}
                y={toSvgY(Math.max(Y_RANGE[0], Math.min(Y_RANGE[1], hoverY))) - 4}
                fill={activeFn.color} fontSize="9" textAnchor="middle"
              >
                f({hoverX}) = {hoverY.toFixed(3)}
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Description */}
      <div className="act-curves__info" style={{ borderColor: activeFn.color + '66' }}>
        <span className="act-curves__info-name" style={{ color: activeFn.color }}>
          {activeFn.label}
        </span>
        <span className="act-curves__info-desc">{activeFn.desc}</span>
      </div>

      <p className="act-curves__hover-hint">Hover over the chart to see exact input → output values</p>
    </div>
  );
}
