import { useState, useEffect, useRef } from 'react';

const WORDS = ['I', 'deposited', 'money', 'at', 'the', 'bank'];
const WEIGHTS = [0.02, 0.65, 0.20, 0.03, 0.04, 0.06];
const COLORS = ['#6272a4', '#ffb86c', '#50fa7b', '#6272a4', '#6272a4', '#bd93f9'];

export default function WeightedSumAnimation() {
  const [step, setStep] = useState(-1); // -1 = idle, 0..5 = word flowing in, 6 = output
  const [playing, setPlaying] = useState(false);
  const [outputBuilt, setOutputBuilt] = useState<number[]>([]); // which words have contributed
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = () => {
    if (timer.current) clearInterval(timer.current);
    setStep(-1);
    setPlaying(false);
    setOutputBuilt([]);
  };

  const play = () => {
    reset();
    setPlaying(true);
    let s = 0;
    setStep(0);
    setOutputBuilt([]);

    timer.current = setInterval(() => {
      s++;
      setStep(s);
      setOutputBuilt(prev => [...prev, s - 1]);
      if (s >= WORDS.length) {
        clearInterval(timer.current!);
        setPlaying(false);
      }
    }, 700);
  };

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const isDone = outputBuilt.length === WORDS.length;

  return (
    <div className="weighted-sum-anim">
      <p className="weighted-sum-anim__desc">
        The output for <strong>"bank"</strong> is built by adding every word's contribution — proportional to its attention weight.
        Watch each word flow in:
      </p>

      <div className="weighted-sum-anim__stage">
        {/* Left: words with weights */}
        <div className="weighted-sum-anim__inputs">
          {WORDS.map((word, i) => {
            const isActive = step === i;
            const isDone = outputBuilt.includes(i);
            const opacity = step < 0 ? 0.35 : isDone ? 0.5 : isActive ? 1 : 0.25;
            return (
              <div
                key={word}
                className={`weighted-sum-anim__input ${isActive ? 'weighted-sum-anim__input--active' : ''}`}
                style={{ opacity }}
              >
                <div
                  className="weighted-sum-anim__word-box"
                  style={{ borderColor: isActive ? COLORS[i] : 'var(--current-line)' }}
                >
                  <span className="weighted-sum-anim__word-text">{word}</span>
                  <span className="weighted-sum-anim__weight" style={{ color: COLORS[i] }}>
                    ×{WEIGHTS[i].toFixed(2)}
                  </span>
                </div>

                {/* Flow bar */}
                <div className="weighted-sum-anim__flow-track">
                  <div
                    className="weighted-sum-anim__flow-bar"
                    style={{
                      width: isActive || isDone ? `${WEIGHTS[i] * 100}%` : '0%',
                      backgroundColor: COLORS[i],
                      transition: isActive ? 'width 0.5s ease' : isDone ? 'none' : 'width 0.2s ease',
                      minWidth: isDone ? '3px' : undefined,
                    }}
                  />
                </div>

                {/* Arrow */}
                <div
                  className="weighted-sum-anim__arrow"
                  style={{ color: isActive ? COLORS[i] : 'var(--comment)', opacity: isActive ? 1 : 0.3 }}
                >
                  →
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: output vector building up */}
        <div className="weighted-sum-anim__output">
          <div className="weighted-sum-anim__output-label">output vector for "bank"</div>
          <div className="weighted-sum-anim__output-box">
            {WORDS.map((word, i) => (
              outputBuilt.includes(i) && (
                <div
                  key={word}
                  className="weighted-sum-anim__output-slice"
                  style={{
                    height: `${Math.max(WEIGHTS[i] * 100, 4)}%`,
                    backgroundColor: COLORS[i],
                    opacity: 0.4 + WEIGHTS[i] * 1.5,
                  }}
                  title={`${word}: ${(WEIGHTS[i] * 100).toFixed(0)}%`}
                />
              )
            ))}
            {step < 0 && (
              <div className="weighted-sum-anim__output-empty">empty</div>
            )}
          </div>
          {outputBuilt.map(i => (
            <div key={i} className="weighted-sum-anim__output-entry" style={{ color: COLORS[i] }}>
              +{WEIGHTS[i].toFixed(2)}×V["{WORDS[i]}"]
            </div>
          ))}
          {isDone && (
            <div className="weighted-sum-anim__output-done">
              = contextual "bank" vector<br />
              <span>pulled toward "deposited" + "money"</span>
            </div>
          )}
        </div>
      </div>

      <div className="weighted-sum-anim__controls">
        <button
          onClick={playing ? reset : play}
          className={`weighted-sum-anim__btn ${!playing ? 'weighted-sum-anim__btn--play' : ''}`}
        >
          {playing ? '↺ Reset' : step < 0 ? '▶ Play' : '↺ Replay'}
        </button>
      </div>
    </div>
  );
}
