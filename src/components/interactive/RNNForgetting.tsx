import { useState, useEffect, useRef } from 'react';

const SENTENCE = ['The', 'cat', 'which', 'had', 'been', 'sitting', 'quietly', 'by', 'the', 'window', 'for', 'most', 'of', 'the', 'afternoon', 'was', 'tired'];

// How much "cat" signal survives at each position
// Starts at 1.0 at position 1 (cat), decays with each update
function getCatSignal(pos: number): number {
  if (pos < 1) return 0;
  if (pos === 1) return 1.0;
  // Each hidden state update dilutes the signal
  return Math.max(0.02, Math.pow(0.78, pos - 1));
}

// Color: green (strong) → yellow → red (weak)
function signalToColor(strength: number): string {
  if (strength > 0.6) {
    const t = (strength - 0.6) / 0.4;
    const g = Math.round(80 + t * 170);
    return `rgb(50, ${g}, 80)`;
  } else if (strength > 0.25) {
    const t = (strength - 0.25) / 0.35;
    const r = Math.round(255 - t * 60);
    const g = Math.round(100 + t * 130);
    return `rgb(${r}, ${g}, 30)`;
  } else {
    const t = strength / 0.25;
    return `rgb(${Math.round(180 + t * 50)}, ${Math.round(t * 60)}, ${Math.round(t * 50)})`;
  }
}

export default function RNNForgetting() {
  const [currentPos, setCurrentPos] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = () => {
    if (timer.current) clearInterval(timer.current);
    setCurrentPos(-1);
    setPlaying(false);
  };

  const play = () => {
    reset();
    setPlaying(true);
    setCurrentPos(0);
    let pos = 0;
    timer.current = setInterval(() => {
      pos++;
      if (pos >= SENTENCE.length) {
        clearInterval(timer.current!);
        setPlaying(false);
        setCurrentPos(SENTENCE.length - 1);
      } else {
        setCurrentPos(pos);
      }
    }, 500);
  };

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const catSignalNow = currentPos >= 1 ? getCatSignal(currentPos) : null;
  const wasPos = SENTENCE.indexOf('was');
  const catPos = SENTENCE.indexOf('cat');

  return (
    <div className="rnn-forget">
      <p className="rnn-forget__desc">
        Watch the "cat" signal (green) get diluted as the RNN processes each word.
        By the time it reaches "was", almost nothing remains:
      </p>

      {/* Sentence with hidden states */}
      <div className="rnn-forget__sentence">
        {SENTENCE.map((word, i) => {
          const signal = getCatSignal(i);
          const isActive = i === currentPos;
          const isPast = i < currentPos;
          const isCat = i === catPos;
          const isWas = i === wasPos;
          const visible = currentPos >= 0 && i <= currentPos;

          return (
            <div key={word + i} className="rnn-forget__word-col">
              {/* Word token */}
              <div
                className={`rnn-forget__word ${isActive ? 'rnn-forget__word--active' : ''} ${isCat ? 'rnn-forget__word--cat' : ''} ${isWas ? 'rnn-forget__word--was' : ''}`}
              >
                {word}
              </div>

              {/* Hidden state box */}
              {visible && (
                <div
                  className="rnn-forget__hidden"
                  style={{
                    backgroundColor: isCat ? '#50fa7b22' : signalToColor(signal) + '33',
                    borderColor: isCat ? '#50fa7b' : signalToColor(signal),
                    opacity: isPast || isActive ? 1 : 0.3,
                  }}
                  title={`"cat" signal: ${Math.round(signal * 100)}%`}
                >
                  <div
                    className="rnn-forget__signal-bar"
                    style={{
                      height: `${Math.max(signal * 100, 3)}%`,
                      backgroundColor: isCat ? '#50fa7b' : signalToColor(signal),
                    }}
                  />
                </div>
              )}

              {/* Signal % label — only show for key positions */}
              {visible && (isCat || isWas || i === currentPos) && (
                <div
                  className="rnn-forget__pct"
                  style={{ color: isCat ? '#50fa7b' : signalToColor(signal) }}
                >
                  {Math.round(signal * 100)}%
                </div>
              )}

              {/* Arrow connecting to next */}
              {i < SENTENCE.length - 1 && visible && (
                <div className="rnn-forget__arrow">→</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current signal strength readout */}
      <div className="rnn-forget__readout">
        {currentPos < 0 ? (
          <span className="rnn-forget__readout-hint">Hit play to watch the signal decay in real time</span>
        ) : currentPos === catPos ? (
          <span style={{ color: '#50fa7b' }}>
            ✓ "cat" enters the hidden state — signal strength: <strong>100%</strong>
          </span>
        ) : currentPos < wasPos ? (
          <span style={{ color: signalToColor(catSignalNow ?? 0) }}>
            "cat" signal after {currentPos - catPos} word{currentPos - catPos !== 1 ? 's' : ''}: <strong>{Math.round((catSignalNow ?? 0) * 100)}%</strong>
            {(catSignalNow ?? 0) < 0.4 && ' — already mostly gone'}
          </span>
        ) : currentPos === wasPos ? (
          <span style={{ color: '#ff5555' }}>
            ✗ "was" needs to agree with "cat" — but "cat" signal is only <strong>{Math.round((catSignalNow ?? 0) * 100)}%</strong>. The model has effectively forgotten.
          </span>
        ) : (
          <span style={{ color: '#ff5555' }}>
            Signal at end: <strong>{Math.round((catSignalNow ?? 0) * 100)}%</strong> — 14 words later, "cat" is essentially gone from working memory.
          </span>
        )}
      </div>

      {/* Signal legend */}
      {currentPos >= catPos && (
        <div className="rnn-forget__legend">
          <div className="rnn-forget__legend-item">
            <div className="rnn-forget__legend-swatch" style={{ backgroundColor: '#50fa7b' }} />
            <span>Strong signal (cat just entered)</span>
          </div>
          <div className="rnn-forget__legend-item">
            <div className="rnn-forget__legend-swatch" style={{ backgroundColor: '#f1c40f' }} />
            <span>Weakening (being overwritten)</span>
          </div>
          <div className="rnn-forget__legend-item">
            <div className="rnn-forget__legend-swatch" style={{ backgroundColor: '#ff5555' }} />
            <span>Nearly gone (forgotten)</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="rnn-forget__controls">
        <button
          onClick={playing ? reset : play}
          className={`rnn-forget__btn ${!playing ? 'rnn-forget__btn--play' : ''}`}
        >
          {playing ? '↺ Reset' : currentPos < 0 ? '▶ Play' : '↺ Replay'}
        </button>

        <button
          className="rnn-forget__btn rnn-forget__btn--nav"
          disabled={playing || currentPos <= 0}
          onClick={() => { if (!playing && currentPos > 0) setCurrentPos(p => p - 1); }}
        >
          ←
        </button>
        <button
          className="rnn-forget__btn rnn-forget__btn--nav"
          disabled={playing || currentPos >= SENTENCE.length - 1}
          onClick={() => { if (!playing) setCurrentPos(p => Math.min(p + 1, SENTENCE.length - 1)); }}
        >
          →
        </button>

        {currentPos >= 0 && (
          <span className="rnn-forget__pos">
            word {currentPos + 1} / {SENTENCE.length}
          </span>
        )}
      </div>
    </div>
  );
}
