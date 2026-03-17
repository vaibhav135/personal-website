import { useState } from 'react';

const WORDS = ['cat', 'bank', 'king', 'run', 'the'];

// Simplified 8-dim embeddings per word (hand-crafted but realistic-looking)
const EMBEDDINGS: Record<string, number[]> = {
  cat:  [ 0.21, -0.54,  0.83,  0.12, -0.67,  0.44,  0.09, -0.31],
  bank: [ 0.67,  0.38, -0.22,  0.81,  0.14, -0.55,  0.73,  0.29],
  king: [ 0.91,  0.12,  0.44, -0.33,  0.78,  0.21, -0.09,  0.55],
  run:  [-0.14,  0.72,  0.31, -0.58,  0.09,  0.83, -0.44,  0.16],
  the:  [ 0.03, -0.07,  0.11,  0.04, -0.02,  0.08,  0.01, -0.05],
};

// Steps of the word → vector journey
const STEPS = ['word', 'tokenize', 'lookup', 'vector'] as const;
type Step = typeof STEPS[number];

const STEP_LABELS: Record<Step, string> = {
  word:     'Start: a raw word',
  tokenize: 'Step 1: tokenize',
  lookup:   'Step 2: lookup table',
  vector:   'Step 3: the embedding vector',
};

const STEP_DESC: Record<Step, string> = {
  word:     'You type a word. The model can\'t understand text directly — it needs numbers.',
  tokenize: 'The tokenizer converts the word to a token ID — a simple integer index into the vocabulary. "cat" might be token #2,847 out of 50,000.',
  lookup:   'The model has an embedding table: 50,000 rows × 512 columns. It looks up row #2,847 and retrieves that row — a list of 512 numbers. This lookup table is learned during training.',
  vector:   'That row of numbers IS the embedding. Every dimension encodes some learned property of the word. This is what gets fed into the transformer.',
};

export default function WordToVector() {
  const [selectedWord, setSelectedWord] = useState('cat');
  const [currentStep, setCurrentStep] = useState<Step>('word');

  const stepIndex = STEPS.indexOf(currentStep);
  const embedding = EMBEDDINGS[selectedWord];

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) setCurrentStep(STEPS[stepIndex + 1]);
  };
  const goPrev = () => {
    if (stepIndex > 0) setCurrentStep(STEPS[stepIndex - 1]);
  };

  return (
    <div className="w2v">
      <p className="w2v__desc">
        How does "cat" become numbers? Walk through the journey step by step:
      </p>

      {/* Word selector */}
      <div className="w2v__word-selector">
        <span className="w2v__selector-label">Try a word:</span>
        {WORDS.map(w => (
          <button
            key={w}
            onClick={() => { setSelectedWord(w); setCurrentStep('word'); }}
            className={`w2v__word-btn ${selectedWord === w ? 'w2v__word-btn--active' : ''}`}
          >
            "{w}"
          </button>
        ))}
      </div>

      {/* Step progress bar */}
      <div className="w2v__steps">
        {STEPS.map((s, i) => (
          <div key={s} className="w2v__step-item">
            <div
              className={`w2v__step-dot ${s === currentStep ? 'w2v__step-dot--active' : i < stepIndex ? 'w2v__step-dot--done' : ''}`}
              onClick={() => setCurrentStep(s)}
            >
              {i + 1}
            </div>
            <div className={`w2v__step-label ${s === currentStep ? 'w2v__step-label--active' : ''}`}>
              {STEP_LABELS[s]}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w2v__step-line ${i < stepIndex ? 'w2v__step-line--done' : ''}`} />
            )}
          </div>
        ))}
      </div>

      {/* Main visual area */}
      <div className="w2v__stage">

        {currentStep === 'word' && (
          <div className="w2v__stage-word">
            <div className="w2v__big-word">"{selectedWord}"</div>
            <p className="w2v__stage-note">
              Raw text. The model sees this as a string — meaningless until it's converted to numbers.
            </p>
          </div>
        )}

        {currentStep === 'tokenize' && (
          <div className="w2v__stage-tokenize">
            <div className="w2v__token-flow">
              <div className="w2v__token-word">"{selectedWord}"</div>
              <div className="w2v__token-arrow">→ tokenizer →</div>
              <div className="w2v__token-id">
                token #{(selectedWord.charCodeAt(0) * 17 + selectedWord.length * 113) % 50000 + 1000}
              </div>
            </div>
            <p className="w2v__stage-note">
              Every word in the vocabulary has a unique integer ID. The tokenizer is just a lookup dictionary: word → integer. Common words like "the" have low IDs (seen most often). Rare words get split into subword pieces.
            </p>
          </div>
        )}

        {currentStep === 'lookup' && (
          <div className="w2v__stage-lookup">
            <div className="w2v__table">
              <div className="w2v__table-header">
                <span className="w2v__table-col-label">token ID</span>
                <span className="w2v__table-col-label">embedding (512 numbers) →</span>
              </div>
              {/* Show a few rows around the selected word */}
              {['...', '2844', '2845', '2846',
                String((selectedWord.charCodeAt(0) * 17 + selectedWord.length * 113) % 50000 + 1000),
                '2848', '2849', '2850', '...'].map((id, i) => {
                const isTarget = id === String((selectedWord.charCodeAt(0) * 17 + selectedWord.length * 113) % 50000 + 1000);
                return (
                  <div
                    key={id + i}
                    className={`w2v__table-row ${isTarget ? 'w2v__table-row--target' : ''} ${id === '...' ? 'w2v__table-row--ellipsis' : ''}`}
                  >
                    <span className="w2v__table-id">
                      {isTarget ? `→ ${id} ("{selectedWord}")` : id}
                    </span>
                    <span className="w2v__table-values">
                      {id === '...' ? '...' : isTarget
                        ? embedding.slice(0, 5).map(v => v.toFixed(2)).join(', ') + ', ...'
                        : Array.from({ length: 5 }, (_, j) =>
                            ((Math.sin(i * 7.3 + j * 3.1) * 0.5)).toFixed(2)
                          ).join(', ') + ', ...'
                      }
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="w2v__stage-note">
              This entire table — 50,000 rows × 512 columns = 25.6 million numbers — is learned during training. The model adjusts every single number until similar words end up with similar rows.
            </p>
          </div>
        )}

        {currentStep === 'vector' && (
          <div className="w2v__stage-vector">
            <div className="w2v__vector-header">
              "{selectedWord}" = <span className="w2v__vector-shape">[512 numbers]</span>
              <span className="w2v__vector-note">showing 8 of 512</span>
            </div>
            <div className="w2v__vector-bars">
              {embedding.map((val, i) => (
                <div key={i} className="w2v__vector-dim">
                  <span className="w2v__vector-dim-label">d{i}</span>
                  <div className="w2v__vector-bar-track">
                    {/* Negative bar — grows left */}
                    <div className="w2v__vector-bar-neg-track">
                      {val < 0 && (
                        <div
                          className="w2v__vector-bar w2v__vector-bar--neg"
                          style={{ width: `${Math.abs(val) * 100}%` }}
                        />
                      )}
                    </div>
                    {/* Zero center line */}
                    <div className="w2v__vector-bar-center" />
                    {/* Positive bar — grows right */}
                    <div className="w2v__vector-bar-pos-track">
                      {val >= 0 && (
                        <div
                          className="w2v__vector-bar w2v__vector-bar--pos"
                          style={{ width: `${val * 100}%` }}
                        />
                      )}
                    </div>
                  </div>
                  <span className="w2v__vector-val">{val.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <p className="w2v__stage-note">
              These 512 numbers are now the word's identity inside the model. This is what flows into the attention mechanism. Note: at this point it's still a <strong>static</strong> embedding — the same for "bank" regardless of context. Attention is what makes it contextual.
            </p>
          </div>
        )}

      </div>

      {/* Description */}
      <div className="w2v__desc-panel">
        <span className="w2v__desc-step-label">{STEP_LABELS[currentStep]}</span>
        <span className="w2v__desc-text">{STEP_DESC[currentStep]}</span>
      </div>

      {/* Controls */}
      <div className="w2v__controls">
        <button
          className="w2v__btn w2v__btn--nav"
          disabled={stepIndex === 0}
          onClick={goPrev}
        >
          ← prev
        </button>
        <button
          className="w2v__btn w2v__btn--nav w2v__btn--next"
          disabled={stepIndex === STEPS.length - 1}
          onClick={goNext}
        >
          next →
        </button>
        <span className="w2v__step-count">
          step {stepIndex + 1} / {STEPS.length}
        </span>
      </div>
    </div>
  );
}
