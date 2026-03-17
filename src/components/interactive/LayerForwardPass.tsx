import { useState, useEffect, useRef } from 'react';

// Each step in the forward pass
const STEPS = [
  {
    id: 'input',
    label: 'Input vector',
    sublabel: 'word embedding for "cat"',
    color: '#8be9fd',
    values: [0.2, 0.8, 0.4, 0.6, 0.1, 0.9, 0.3, 0.7],
    desc: 'Raw embedding — 512 numbers representing "cat". No context yet.',
  },
  {
    id: 'matmul',
    label: '× Weight matrix W',
    sublabel: 'matrix multiplication',
    color: '#bd93f9',
    values: [0.5, 0.3, 0.9, 0.2, 0.7, 0.4, 0.8, 0.1],
    desc: 'W is a learned 512×512 matrix. Each output dimension is a weighted sum of all input dimensions.',
  },
  {
    id: 'bias',
    label: '+ Bias vector b',
    sublabel: 'shift the result',
    color: '#ffb86c',
    values: [0.55, 0.35, 0.95, 0.25, 0.75, 0.45, 0.85, 0.15],
    desc: 'A small learned offset added to each dimension. Gives the layer flexibility to shift its output range.',
  },
  {
    id: 'relu',
    label: 'ReLU activation',
    sublabel: 'max(0, x) — kill negatives',
    color: '#50fa7b',
    values: [0.55, 0.35, 0.95, 0.25, 0.75, 0.0, 0.85, 0.15],
    desc: 'Negative values → 0. Positive values → unchanged. This is the non-linearity that makes stacking layers useful.',
  },
  {
    id: 'output',
    label: 'Output vector',
    sublabel: 'richer representation',
    color: '#ff79c6',
    values: [0.55, 0.35, 0.95, 0.25, 0.75, 0.0, 0.85, 0.15],
    desc: 'Same shape as the input (512 numbers) — but now carrying information from the transformation. Fed into the next layer.',
  },
];

export default function LayerForwardPass() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = () => {
    if (timer.current) clearInterval(timer.current);
    setCurrentStep(-1);
    setPlaying(false);
  };

  const play = () => {
    reset();
    setPlaying(true);
    setCurrentStep(0);
    let s = 0;
    timer.current = setInterval(() => {
      s++;
      if (s >= STEPS.length) {
        clearInterval(timer.current!);
        setPlaying(false);
        setCurrentStep(STEPS.length - 1);
      } else {
        setCurrentStep(s);
      }
    }, 900);
  };

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const activeStep = currentStep >= 0 ? STEPS[currentStep] : null;

  return (
    <div className="layer-fwd">
      <p className="layer-fwd__desc">
        One layer — four operations. A token vector goes in, a transformed vector comes out.
        Watch each operation happen:
      </p>

      {/* Pipeline visualization */}
      <div className="layer-fwd__pipeline">
        {STEPS.map((step, i) => {
          const state = currentStep < 0 ? 'idle'
            : i < currentStep ? 'done'
            : i === currentStep ? 'active'
            : 'pending';

          return (
            <div key={step.id} className="layer-fwd__step-col">
              {/* Step block */}
              <div
                className={`layer-fwd__step layer-fwd__step--${state}`}
                style={state === 'active' ? { borderColor: step.color, boxShadow: `0 0 12px ${step.color}44` } : {}}
                onClick={() => setCurrentStep(i)}
              >
                <div className="layer-fwd__step-label" style={state === 'active' ? { color: step.color } : {}}>
                  {step.label}
                </div>
                <div className="layer-fwd__step-sublabel">{step.sublabel}</div>

                {/* Mini bar chart of values */}
                <div className="layer-fwd__bars">
                  {step.values.map((v, vi) => (
                    <div
                      key={vi}
                      className="layer-fwd__bar"
                      style={{
                        height: `${v * 100}%`,
                        backgroundColor: state === 'active' ? step.color
                          : state === 'done' ? step.color + '88'
                          : 'var(--current-line)',
                        transition: 'height 0.4s ease, background-color 0.3s ease',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Arrow between steps */}
              {i < STEPS.length - 1 && (
                <div className={`layer-fwd__connector ${state === 'done' || state === 'active' ? 'layer-fwd__connector--active' : ''}`}>
                  ↓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Description panel */}
      <div className="layer-fwd__desc-panel">
        {activeStep ? (
          <>
            <span className="layer-fwd__desc-title" style={{ color: activeStep.color }}>
              {activeStep.label}
            </span>
            <span className="layer-fwd__desc-text">{activeStep.desc}</span>
          </>
        ) : (
          <span className="layer-fwd__desc-hint">
            Hit play to watch the forward pass, or click any step to jump to it
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="layer-fwd__controls">
        <button
          onClick={playing ? reset : play}
          className={`layer-fwd__btn ${!playing ? 'layer-fwd__btn--play' : ''}`}
        >
          {playing ? '↺ Reset' : currentStep < 0 ? '▶ Play' : '↺ Replay'}
        </button>

        {/* Step dots */}
        <div className="layer-fwd__dots">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              className={`layer-fwd__dot ${currentStep === i ? 'layer-fwd__dot--active' : currentStep > i ? 'layer-fwd__dot--done' : ''}`}
              style={currentStep === i ? { backgroundColor: s.color } : {}}
              onClick={() => { if (!playing) setCurrentStep(i); }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
