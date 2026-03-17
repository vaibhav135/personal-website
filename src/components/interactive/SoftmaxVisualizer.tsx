import { useState } from 'react';

function softmax(scores: number[]): number[] {
  const maxVal = Math.max(...scores);
  const exps = scores.map(s => Math.exp(s - maxVal));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

const PRESETS = [
  { label: 'Scaled (÷ √dₖ)', scores: [1.0, 2.0, 3.0, 0.0], description: 'Healthy range — model learns nuanced blending' },
  { label: 'Unscaled (×4)', scores: [4.0, 8.0, 12.0, 0.0], description: 'Starting to collapse — winner dominates heavily' },
  { label: 'Extreme (×8)', scores: [8.0, 16.0, 24.0, 0.0], description: 'Fully collapsed — model picks one word, ignores everything else' },
];

const WORDS = ['word1', 'word2', 'word3', 'word4'];

export default function SoftmaxVisualizer() {
  const [preset, setPreset] = useState(0);
  const scores = PRESETS[preset].scores;
  const probs = softmax(scores);
  const maxProb = Math.max(...probs);

  return (
    <div className="softmax-viz">
      <p className="softmax-viz__desc">
        Same relative scores — three different scales. Watch how softmax collapses as numbers grow:
      </p>

      <div className="softmax-viz__presets">
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => setPreset(i)}
            className={`softmax-viz__preset ${preset === i ? 'softmax-viz__preset--active' : ''}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="softmax-viz__columns">
        {/* Input scores */}
        <div className="softmax-viz__col">
          <div className="softmax-viz__col-label">Raw scores</div>
          {WORDS.map((word, i) => (
            <div key={word} className="softmax-viz__bar-row">
              <span className="softmax-viz__word">{word}</span>
              <div className="softmax-viz__bar-track">
                <div
                  className="softmax-viz__bar softmax-viz__bar--input"
                  style={{ width: `${(scores[i] / 24) * 100}%` }}
                />
              </div>
              <span className="softmax-viz__val">{scores[i].toFixed(1)}</span>
            </div>
          ))}
        </div>

        <div className="softmax-viz__arrow">→</div>

        {/* Output probs */}
        <div className="softmax-viz__col">
          <div className="softmax-viz__col-label">After softmax</div>
          {WORDS.map((word, i) => (
            <div key={word} className="softmax-viz__bar-row">
              <span className="softmax-viz__word">{word}</span>
              <div className="softmax-viz__bar-track">
                <div
                  className={`softmax-viz__bar ${probs[i] === maxProb ? 'softmax-viz__bar--max' : 'softmax-viz__bar--prob'}`}
                  style={{ width: `${probs[i] * 100}%` }}
                />
              </div>
              <span className="softmax-viz__val">{(probs[i] * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`softmax-viz__verdict softmax-viz__verdict--${preset === 0 ? 'good' : preset === 1 ? 'warn' : 'bad'}`}>
        {PRESETS[preset].description}
      </div>
    </div>
  );
}
