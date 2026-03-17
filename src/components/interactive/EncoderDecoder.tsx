import { useState, useEffect, useRef } from 'react';

// Steps of the encoder-decoder flow
const STEPS = [
  {
    id: 'input',
    phase: 'encoder',
    label: 'Input tokens',
    desc: 'Source sentence is tokenized and converted to embeddings + positional encoding.',
    tokens: ['The', 'cat', 'sat'],
    highlight: 'input',
  },
  {
    id: 'enc1',
    phase: 'encoder',
    label: 'Encoder layer 1',
    desc: 'Self-attention: every token looks at every other token. "cat" starts absorbing context from "sat".',
    tokens: ['The', 'cat', 'sat'],
    highlight: 'enc',
  },
  {
    id: 'enc2',
    phase: 'encoder',
    label: 'Encoder layers 2–6',
    desc: 'Repeated refinement. Each pass builds richer contextual representations. After 6 layers, each vector encodes the full sentence context.',
    tokens: ['The', 'cat', 'sat'],
    highlight: 'enc',
  },
  {
    id: 'memory',
    phase: 'bridge',
    label: 'Encoder output (memory)',
    desc: 'Final encoder output — a rich contextual vector for each input token. This is the "memory" the decoder will read from via cross-attention.',
    tokens: ['The', 'cat', 'sat'],
    highlight: 'memory',
  },
  {
    id: 'dec1',
    phase: 'decoder',
    label: 'Decoder: generate token 1',
    desc: 'Starts with <start> token. Masked self-attention (can\'t see future). Cross-attention reads encoder memory. Generates first output token.',
    tokens: ['<start>'],
    output: ['Le'],
    highlight: 'dec',
  },
  {
    id: 'dec2',
    phase: 'decoder',
    label: 'Decoder: generate token 2',
    desc: 'Now has "Le" as context. Cross-attention again reads full encoder memory. Generates next token.',
    tokens: ['<start>', 'Le'],
    output: ['Le', 'chat'],
    highlight: 'dec',
  },
  {
    id: 'dec3',
    phase: 'decoder',
    label: 'Decoder: generate token 3',
    desc: 'Has "Le chat" as context. Same process — masked self-attention + cross-attention + feed-forward.',
    tokens: ['<start>', 'Le', 'chat'],
    output: ['Le', 'chat', 's\'est'],
    highlight: 'dec',
  },
  {
    id: 'done',
    phase: 'decoder',
    label: 'Complete translation',
    desc: 'Decoder generates <end> token. Full translation produced token by token, each one attending to the entire source sentence via the encoder memory.',
    tokens: ['<start>', 'Le', 'chat', 's\'est'],
    output: ['Le', 'chat', 's\'est', 'assis'],
    highlight: 'done',
  },
];

const PHASE_COLORS = {
  encoder: '#8be9fd',
  bridge:  '#bd93f9',
  decoder: '#50fa7b',
};

export default function EncoderDecoder() {
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = () => {
    if (timer.current) clearInterval(timer.current);
    setStep(-1);
    setPlaying(false);
  };

  const play = () => {
    reset();
    setPlaying(true);
    setStep(0);
    let s = 0;
    timer.current = setInterval(() => {
      s++;
      if (s >= STEPS.length) {
        clearInterval(timer.current!);
        setPlaying(false);
        setStep(STEPS.length - 1);
      } else {
        setStep(s);
      }
    }, 1200);
  };

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const current = step >= 0 ? STEPS[step] : null;

  return (
    <div className="enc-dec">
      <p className="enc-dec__desc">
        The encoder reads the full input simultaneously. The decoder generates output one token at a time,
        attending back to the encoder at every step via cross-attention:
      </p>

      {/* Architecture diagram */}
      <div className="enc-dec__diagram">

        {/* Encoder side */}
        <div className="enc-dec__side">
          <div className="enc-dec__side-label" style={{ color: PHASE_COLORS.encoder }}>
            ENCODER
          </div>

          {/* Input tokens */}
          <div className={`enc-dec__block enc-dec__block--input ${current?.highlight === 'input' ? 'enc-dec__block--active' : ''}`}
            style={current?.highlight === 'input' ? { borderColor: PHASE_COLORS.encoder, boxShadow: `0 0 10px ${PHASE_COLORS.encoder}44` } : {}}>
            <div className="enc-dec__block-label">Input embeddings + PE</div>
            <div className="enc-dec__tokens">
              {['The', 'cat', 'sat'].map(t => (
                <span key={t} className={`enc-dec__token ${current?.highlight === 'input' ? 'enc-dec__token--active' : ''}`}
                  style={current?.highlight === 'input' ? { borderColor: PHASE_COLORS.encoder, color: PHASE_COLORS.encoder } : {}}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="enc-dec__arrow-down">↓</div>

          {/* Encoder blocks */}
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i}
              className={`enc-dec__layer ${current?.highlight === 'enc' && step >= 1 ? 'enc-dec__layer--active' : ''}`}
              style={current?.highlight === 'enc' ? { borderColor: PHASE_COLORS.encoder, backgroundColor: `${PHASE_COLORS.encoder}11` } : {}}>
              <span style={current?.highlight === 'enc' ? { color: PHASE_COLORS.encoder } : {}}>
                Encoder {i}
              </span>
              <span className="enc-dec__layer-sub">self-attn → FFN</span>
            </div>
          ))}

          <div className="enc-dec__arrow-down">↓</div>

          {/* Memory */}
          <div className={`enc-dec__block enc-dec__block--memory ${current?.highlight === 'memory' || (step >= 4) ? 'enc-dec__block--memory-filled' : ''}`}
            style={(current?.highlight === 'memory' || step >= 4) ? { borderColor: PHASE_COLORS.bridge, boxShadow: `0 0 10px ${PHASE_COLORS.bridge}44` } : {}}>
            <div className="enc-dec__block-label" style={(current?.highlight === 'memory' || step >= 4) ? { color: PHASE_COLORS.bridge } : {}}>
              Encoder output (K, V)
            </div>
            <div className="enc-dec__memory-note">
              {step >= 3 ? (
                <span style={{ color: PHASE_COLORS.bridge }}>ready — decoder reads this</span>
              ) : (
                <span className="enc-dec__memory-empty">not ready yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Cross-attention bridge */}
        <div className="enc-dec__bridge">
          {step >= 4 && (
            <div className="enc-dec__cross-arrows">
              {(current?.output || []).map((_, i) => (
                <div key={i} className="enc-dec__cross-arrow" style={{ animationDelay: `${i * 0.1}s` }}>
                  ←→
                </div>
              ))}
              <div className="enc-dec__bridge-label">cross-attention</div>
            </div>
          )}
        </div>

        {/* Decoder side */}
        <div className="enc-dec__side">
          <div className="enc-dec__side-label" style={{ color: PHASE_COLORS.decoder }}>
            DECODER
          </div>

          {/* Decoder blocks */}
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i}
              className={`enc-dec__layer ${current?.highlight === 'dec' || current?.highlight === 'done' ? 'enc-dec__layer--active' : ''}`}
              style={current?.highlight === 'dec' || current?.highlight === 'done' ? { borderColor: PHASE_COLORS.decoder, backgroundColor: `${PHASE_COLORS.decoder}11` } : {}}>
              <span style={current?.highlight === 'dec' || current?.highlight === 'done' ? { color: PHASE_COLORS.decoder } : {}}>
                Decoder {i}
              </span>
              <span className="enc-dec__layer-sub">masked-attn → cross-attn → FFN</span>
            </div>
          ))}

          <div className="enc-dec__arrow-down">↓</div>

          {/* Output tokens */}
          <div className={`enc-dec__block enc-dec__block--output ${step >= 4 ? 'enc-dec__block--active' : ''}`}
            style={step >= 4 ? { borderColor: PHASE_COLORS.decoder, boxShadow: `0 0 10px ${PHASE_COLORS.decoder}44` } : {}}>
            <div className="enc-dec__block-label" style={step >= 4 ? { color: PHASE_COLORS.decoder } : {}}>
              Output tokens
            </div>
            <div className="enc-dec__tokens">
              {step >= 4 ? (
                (current?.output || []).map((t, i) => (
                  <span key={t + i}
                    className="enc-dec__token enc-dec__token--output"
                    style={{ borderColor: PHASE_COLORS.decoder, color: PHASE_COLORS.decoder, animationDelay: `${i * 0.05}s` }}>
                    {t}
                  </span>
                ))
              ) : (
                <span className="enc-dec__token-empty">waiting…</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Step description panel */}
      <div className="enc-dec__desc-panel">
        {current ? (
          <>
            <span
              className="enc-dec__desc-phase"
              style={{ color: PHASE_COLORS[current.phase as keyof typeof PHASE_COLORS] || PHASE_COLORS.bridge }}
            >
              {current.label}
            </span>
            <span className="enc-dec__desc-text">{current.desc}</span>
          </>
        ) : (
          <span className="enc-dec__desc-hint">Hit play to walk through the encoder-decoder flow step by step</span>
        )}
      </div>

      {/* Controls */}
      <div className="enc-dec__controls">
        <button
          onClick={playing ? reset : play}
          className={`enc-dec__btn ${!playing ? 'enc-dec__btn--play' : ''}`}
        >
          {playing ? '↺ Reset' : step < 0 ? '▶ Play' : '↺ Replay'}
        </button>

        {/* Prev / Next */}
        <button
          className="enc-dec__btn enc-dec__btn--nav"
          disabled={playing || step <= 0}
          onClick={() => { if (!playing && step > 0) setStep(s => s - 1); }}
        >
          ←
        </button>
        <button
          className="enc-dec__btn enc-dec__btn--nav"
          disabled={playing || step >= STEPS.length - 1}
          onClick={() => { if (!playing) setStep(s => Math.min(s + 1, STEPS.length - 1)); }}
        >
          →
        </button>

        {/* Step dots */}
        <div className="enc-dec__dots">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              className={`enc-dec__dot ${step === i ? 'enc-dec__dot--active' : step > i ? 'enc-dec__dot--done' : ''}`}
              style={step === i ? { backgroundColor: PHASE_COLORS[s.phase as keyof typeof PHASE_COLORS] || PHASE_COLORS.bridge } : {}}
              onClick={() => { if (!playing) setStep(i); }}
              title={s.label}
            />
          ))}
        </div>

        <span className="enc-dec__step-count">
          {step >= 0 ? `${step + 1} / ${STEPS.length}` : ''}
        </span>
      </div>
    </div>
  );
}
