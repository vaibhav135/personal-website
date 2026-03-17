import { useState } from 'react';

const WORDS = ['I', 'deposited', 'money', 'at', 'the', 'bank'];

// Simulated raw similarity scores for each query word against all keys
// These are hand-crafted to feel realistic
const RAW_SCORES: Record<string, number[]> = {
  'I':         [2.0, 1.5, 1.0, 0.5, 0.5, 1.2],
  'deposited': [1.5, 3.0, 2.5, 0.8, 0.5, 1.8],
  'money':     [1.0, 2.5, 3.0, 0.6, 0.4, 2.2],
  'at':        [0.5, 0.8, 0.6, 2.0, 1.5, 0.9],
  'the':       [0.5, 0.5, 0.4, 1.5, 2.0, 0.8],
  'bank':      [1.2, 2.0, 2.5, 0.8, 0.6, 3.5],
};

const DK = 4; // simplified sqrt(dk) = 2

function softmax(scores: number[]): number[] {
  const scaled = scores.map(s => s / Math.sqrt(DK));
  const maxVal = Math.max(...scaled);
  const exps = scaled.map(s => Math.exp(s - maxVal));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

export default function AttentionWidget() {
  const [query, setQuery] = useState('bank');
  const sentence = 'I deposited money at the bank';

  const rawScores = RAW_SCORES[query];
  const scaledScores = rawScores.map(s => s / Math.sqrt(DK));
  const probs = softmax(rawScores);
  const maxProb = Math.max(...probs);

  return (
    <div className="attention-widget">
      <div className="attention-widget__sentence">
        "{sentence}"
      </div>
      <p className="attention-widget__hint">
        Click a word below to ask: <em>"what should <strong>this word</strong> pay attention to?"</em>
      </p>

      {/* Word selector */}
      <div className="attention-widget__words">
        {WORDS.map(word => (
          <button
            key={word}
            onClick={() => setQuery(word)}
            className={`attention-widget__word ${query === word ? 'attention-widget__word--active' : ''}`}
          >
            {word}
          </button>
        ))}
      </div>

      {/* Four steps side by side */}
      <div className="attention-widget__steps">

        {/* Step 1: Raw scores */}
        <div className="attention-widget__step">
          <div className="attention-widget__step-label">
            Step 1 — Q · Kᵀ<br />
            <span>raw similarity scores</span>
          </div>
          {WORDS.map((word, i) => (
            <div key={word} className="attention-widget__bar-row">
              <span className="attention-widget__bar-word">{word}</span>
              <div className="attention-widget__bar-track">
                <div
                  className="attention-widget__bar"
                  style={{ width: `${(rawScores[i] / 4) * 100}%` }}
                />
              </div>
              <span className="attention-widget__bar-val">{rawScores[i].toFixed(2)}</span>
            </div>
          ))}
          <p className="attention-widget__step-note">dot product of query with each key</p>
        </div>

        {/* Step 2: Scaled */}
        <div className="attention-widget__step">
          <div className="attention-widget__step-label">
            Step 2 — ÷ √dₖ = √{DK} = {Math.sqrt(DK)}<br />
            <span>prevent score explosion</span>
          </div>
          {WORDS.map((word, i) => (
            <div key={word} className="attention-widget__bar-row">
              <span className="attention-widget__bar-word">{word}</span>
              <div className="attention-widget__bar-track">
                <div
                  className="attention-widget__bar attention-widget__bar--scaled"
                  style={{ width: `${(scaledScores[i] / 2) * 100}%` }}
                />
              </div>
              <span className="attention-widget__bar-val">{scaledScores[i].toFixed(2)}</span>
            </div>
          ))}
          <p className="attention-widget__step-note">keeps variance around 1.0</p>
        </div>

        {/* Step 3: Softmax probs */}
        <div className="attention-widget__step">
          <div className="attention-widget__step-label">
            Step 3 — softmax<br />
            <span>probabilities, sum = 1.0</span>
          </div>
          {WORDS.map((word, i) => (
            <div key={word} className="attention-widget__bar-row">
              <span className="attention-widget__bar-word">{word}</span>
              <div className="attention-widget__bar-track">
                <div
                  className={`attention-widget__bar attention-widget__bar--prob ${probs[i] === maxProb ? 'attention-widget__bar--max' : ''}`}
                  style={{ width: `${probs[i] * 100}%` }}
                />
              </div>
              <span className="attention-widget__bar-val">{Math.round(probs[i] * 100)}%</span>
            </div>
          ))}
          <p className="attention-widget__step-note">amplifies the winner, suppresses the rest</p>
        </div>

      </div>

      {/* Step 4: Output */}
      <div className="attention-widget__output">
        <div className="attention-widget__step-label">
          Step 4 — weighted output for <strong>"{query}"</strong>
        </div>
        <div className="attention-widget__output-formula">
          {WORDS.map((word, i) => (
            <span key={word} style={{ opacity: 0.3 + probs[i] * 2.5 }}>
              {probs[i] > 0.01 && (
                <>
                  <span className="attention-widget__coeff">{probs[i].toFixed(2)}</span>
                  <span className="attention-widget__times">×</span>
                  <span className="attention-widget__vword">V["{word}"]</span>
                  {i < WORDS.length - 1 && <span className="attention-widget__plus"> + </span>}
                </>
              )}
            </span>
          ))}
        </div>
        <p className="attention-widget__output-note">
          most attended: <strong>"{WORDS[probs.indexOf(maxProb)]}"</strong> ({Math.round(maxProb * 100)}%) —
          the output vector for "{query}" is pulled strongest toward this word's meaning
        </p>
      </div>
    </div>
  );
}
