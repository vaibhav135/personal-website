import { useState, useEffect, useRef } from 'react';

const WORDS = ['The', 'cat', 'sat', 'on', 'mat'];

export default function RNNvsTransformer() {
  const [playing, setPlaying] = useState(false);
  const [rnnStep, setRnnStep] = useState(-1);       // which word RNN is currently processing
  const [tfDone, setTfDone] = useState(false);       // transformer finished
  const [tfFlash, setTfFlash] = useState(false);     // flash all tf words at once
  const rnnTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const tfTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = () => {
    if (rnnTimer.current) clearInterval(rnnTimer.current);
    if (tfTimer.current) clearTimeout(tfTimer.current);
    setRnnStep(-1);
    setTfDone(false);
    setTfFlash(false);
    setPlaying(false);
  };

  const play = () => {
    reset();
    setPlaying(true);
    setRnnStep(0);

    // RNN: process one word every 600ms
    let step = 0;
    rnnTimer.current = setInterval(() => {
      step++;
      if (step >= WORDS.length) {
        clearInterval(rnnTimer.current!);
      }
      setRnnStep(step);
    }, 600);

    // Transformer: flash ALL at once after 300ms
    tfTimer.current = setTimeout(() => {
      setTfFlash(true);
      setTimeout(() => {
        setTfFlash(false);
        setTfDone(true);
      }, 400);
    }, 300);
  };

  useEffect(() => () => {
    if (rnnTimer.current) clearInterval(rnnTimer.current);
    if (tfTimer.current) clearTimeout(tfTimer.current);
  }, []);

  const rnnFinished = rnnStep >= WORDS.length;
  const totalRnnTime = WORDS.length * 600;

  return (
    <div className="rnn-vs-tf">
      <p className="rnn-vs-tf__desc">
        RNN processes one word at a time — each must wait for the previous.
        Transformer processes all words simultaneously. Hit play to see the difference:
      </p>

      <div className="rnn-vs-tf__panels">
        {/* RNN Panel */}
        <div className="rnn-vs-tf__panel">
          <div className="rnn-vs-tf__panel-title rnn-vs-tf__panel-title--rnn">
            RNN <span>sequential</span>
          </div>

          <div className="rnn-vs-tf__words">
            {WORDS.map((word, i) => {
              const state = rnnStep < 0 ? 'idle'
                : i < rnnStep ? 'done'
                : i === rnnStep ? 'active'
                : 'waiting';
              return (
                <div key={word} className="rnn-vs-tf__word-col">
                  <div className={`rnn-vs-tf__word rnn-vs-tf__word--${state}`}>
                    {word}
                  </div>
                  {/* Arrow between words */}
                  {i < WORDS.length - 1 && (
                    <div className={`rnn-vs-tf__arrow ${state === 'done' ? 'rnn-vs-tf__arrow--done' : ''}`}>
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="rnn-vs-tf__hidden-states">
            {WORDS.map((_, i) => {
              const active = rnnStep > i;
              return (
                <div
                  key={i}
                  className={`rnn-vs-tf__hidden ${active ? 'rnn-vs-tf__hidden--active' : ''}`}
                  title={`h${i + 1}`}
                >
                  h{i + 1}
                </div>
              );
            })}
          </div>

          <div className="rnn-vs-tf__time">
            {rnnFinished
              ? <span className="rnn-vs-tf__time--done">✓ done ({totalRnnTime}ms)</span>
              : rnnStep >= 0
              ? <span className="rnn-vs-tf__time--running">processing word {rnnStep + 1}/{WORDS.length}…</span>
              : <span className="rnn-vs-tf__time--idle">waiting…</span>
            }
          </div>
        </div>

        {/* Transformer Panel */}
        <div className="rnn-vs-tf__panel">
          <div className="rnn-vs-tf__panel-title rnn-vs-tf__panel-title--tf">
            Transformer <span>parallel</span>
          </div>

          <div className="rnn-vs-tf__words rnn-vs-tf__words--tf">
            {WORDS.map((word) => (
              <div key={word} className="rnn-vs-tf__word-col">
                <div className={`rnn-vs-tf__word ${
                  tfFlash ? 'rnn-vs-tf__word--flash'
                  : tfDone ? 'rnn-vs-tf__word--done'
                  : 'rnn-vs-tf__word--idle'
                }`}>
                  {word}
                </div>
              </div>
            ))}
          </div>

          {/* Attention lines — all words connect to all others */}
          <div className="rnn-vs-tf__attention-grid">
            {WORDS.map((w1, i) => (
              <div key={w1} className="rnn-vs-tf__attn-row">
                {WORDS.map((w2, j) => (
                  <div
                    key={w2}
                    className={`rnn-vs-tf__attn-cell ${tfDone ? 'rnn-vs-tf__attn-cell--active' : ''} ${i === j ? 'rnn-vs-tf__attn-cell--self' : ''}`}
                    title={`${w1} → ${w2}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <p className="rnn-vs-tf__attn-label">attention matrix (all-to-all)</p>

          <div className="rnn-vs-tf__time">
            {tfDone
              ? <span className="rnn-vs-tf__time--done">✓ done (300ms)</span>
              : tfFlash
              ? <span className="rnn-vs-tf__time--running">processing all at once…</span>
              : <span className="rnn-vs-tf__time--idle">waiting…</span>
            }
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="rnn-vs-tf__controls">
        <button
          onClick={playing ? reset : play}
          className={`rnn-vs-tf__btn ${playing ? '' : 'rnn-vs-tf__btn--play'}`}
        >
          {playing ? '↺ Reset' : '▶ Play'}
        </button>
        {(rnnFinished || tfDone) && !playing && (
          <span className="rnn-vs-tf__result">
            Transformer was <strong style={{ color: 'var(--green)' }}>{Math.round(totalRnnTime / 300)}×</strong> faster
          </span>
        )}
      </div>
    </div>
  );
}
