import { useState } from 'react';

const LAYERS = ['Output', 'Layer 6', 'Layer 5', 'Layer 4', 'Layer 3', 'Layer 2', 'Layer 1'];

function getGradientStrength(layerIndex: number, scaled: boolean): number {
  // With scaling: gradient stays healthy throughout
  // Without scaling: gradient decays rapidly (vanishes)
  if (scaled) {
    return Math.max(0.85 - layerIndex * 0.03, 0.6);
  } else {
    return Math.max(1.0 - layerIndex * layerIndex * 0.06, 0.02);
  }
}

export default function GradientVanishing() {
  const [scaled, setScaled] = useState(true);

  return (
    <div className="gradient-viz">
      <p className="gradient-viz__desc">
        Gradient signal flowing backwards through layers during training.
        Toggle scaling to see what happens without √dₖ:
      </p>

      <div className="gradient-viz__toggle">
        <button
          onClick={() => setScaled(true)}
          className={`gradient-viz__btn ${scaled ? 'gradient-viz__btn--active' : ''}`}
        >
          With √dₖ scaling
        </button>
        <button
          onClick={() => setScaled(false)}
          className={`gradient-viz__btn ${!scaled ? 'gradient-viz__btn--active gradient-viz__btn--bad' : ''}`}
        >
          Without √dₖ scaling
        </button>
      </div>

      <div className="gradient-viz__layers">
        {LAYERS.map((layer, i) => {
          const strength = getGradientStrength(i, scaled);
          const pct = Math.round(strength * 100);
          return (
            <div key={layer} className="gradient-viz__layer">
              <span className="gradient-viz__layer-name">{layer}</span>
              <div className="gradient-viz__bar-track">
                <div
                  className={`gradient-viz__bar ${scaled ? 'gradient-viz__bar--healthy' : 'gradient-viz__bar--dying'}`}
                  style={{
                    width: `${pct}%`,
                    transition: 'width 0.4s ease, background-color 0.4s ease',
                  }}
                />
              </div>
              <span className={`gradient-viz__pct ${pct < 20 ? 'gradient-viz__pct--dead' : ''}`}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>

      <div className={`gradient-viz__verdict ${scaled ? 'gradient-viz__verdict--good' : 'gradient-viz__verdict--bad'}`}>
        {scaled
          ? 'Gradient flows through all layers — every layer can learn'
          : 'Gradient vanishes by layer 3 — early layers are stuck, permanently useless'}
      </div>
    </div>
  );
}
