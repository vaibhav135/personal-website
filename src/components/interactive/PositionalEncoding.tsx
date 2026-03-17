import { useState } from 'react';

const SENTENCE = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
const NUM_DIMS = 8; // show 8 of the 512 dims for clarity

function getPositionalEncoding(pos: number, dim: number, dModel = 512): number {
  if (dim % 2 === 0) {
    return Math.sin(pos / Math.pow(10000, dim / dModel));
  } else {
    return Math.cos(pos / Math.pow(10000, (dim - 1) / dModel));
  }
}

// Color based on value: negative = red, positive = green
function valueToColor(val: number): string {
  if (val >= 0) {
    const intensity = Math.round(val * 200);
    return `rgb(${80 - intensity * 0.3}, ${Math.min(250, 80 + intensity * 2)}, ${80 + intensity})`;
  } else {
    const intensity = Math.round(Math.abs(val) * 200);
    return `rgb(${Math.min(255, 80 + intensity * 2)}, ${80 - intensity * 0.3}, ${80 - intensity * 0.3})`;
  }
}

export default function PositionalEncoding() {
  const [hoveredPos, setHoveredPos] = useState<number | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ pos: number; dim: number; val: number } | null>(null);
  const [showCombined, setShowCombined] = useState(false);

  return (
    <div className="posenc-viz">
      <p className="posenc-viz__desc">
        Each position gets a unique "fingerprint" made of sine/cosine values across dimensions.
        No two positions have the same pattern — that's how the model knows word order:
      </p>

      <div className="posenc-viz__toggle">
        <button
          onClick={() => setShowCombined(false)}
          className={`posenc-viz__btn ${!showCombined ? 'posenc-viz__btn--active' : ''}`}
        >
          Show position fingerprints
        </button>
        <button
          onClick={() => setShowCombined(true)}
          className={`posenc-viz__btn ${showCombined ? 'posenc-viz__btn--active' : ''}`}
        >
          Show word + position combined
        </button>
      </div>

      {!showCombined ? (
        <>
          {/* Heatmap: rows = positions, cols = dims */}
          <div className="posenc-viz__heatmap">
            <div className="posenc-viz__heatmap-header">
              <span className="posenc-viz__axis-label">position →</span>
              <div className="posenc-viz__dim-labels">
                {Array.from({ length: NUM_DIMS }, (_, i) => (
                  <span key={i} className="posenc-viz__dim-label">d{i}</span>
                ))}
              </div>
            </div>

            {SENTENCE.map((word, pos) => (
              <div
                key={word + pos}
                className={`posenc-viz__row ${hoveredPos === pos ? 'posenc-viz__row--hovered' : ''}`}
                onMouseEnter={() => setHoveredPos(pos)}
                onMouseLeave={() => { setHoveredPos(null); setHoveredCell(null); }}
              >
                <span className="posenc-viz__word-label">
                  <span className="posenc-viz__pos-num">{pos}</span>
                  {word}
                </span>
                <div className="posenc-viz__cells">
                  {Array.from({ length: NUM_DIMS }, (_, dim) => {
                    const val = getPositionalEncoding(pos, dim);
                    return (
                      <div
                        key={dim}
                        className="posenc-viz__cell"
                        style={{ backgroundColor: valueToColor(val) }}
                        onMouseEnter={() => setHoveredCell({ pos, dim, val })}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Info bar — shows value on hover, legend otherwise */}
          <div className="posenc-viz__infobar">
            {hoveredCell ? (
              <span>
                <span className="posenc-viz__infobar-label">pos</span>
                <span className="posenc-viz__infobar-val">{hoveredCell.pos}</span>
                <span className="posenc-viz__infobar-label">dim</span>
                <span className="posenc-viz__infobar-val">{hoveredCell.dim}</span>
                <span className="posenc-viz__infobar-label">value</span>
                <span className="posenc-viz__infobar-val">{hoveredCell.val.toFixed(3)}</span>
                <span className="posenc-viz__infobar-fn">
                  ({hoveredCell.dim % 2 === 0 ? 'sin' : 'cos'})
                </span>
              </span>
            ) : (
              <span className="posenc-viz__infobar-hint">
                <span className="posenc-viz__legend-item posenc-viz__legend-neg">■</span> negative (−1)
                <span className="posenc-viz__legend-item posenc-viz__legend-zero">■</span> zero
                <span className="posenc-viz__legend-item posenc-viz__legend-pos">■</span> positive (+1)
                &nbsp;— hover any cell to see its exact value
              </span>
            )}
          </div>

          <p className="posenc-viz__note">
            Hover a row to highlight it. Notice every row has a unique color pattern —
            that's the position fingerprint. Even "the" at position 0 and "the" at position 4
            get completely different encodings.
          </p>
        </>
      ) : (
        <div className="posenc-viz__combined">
          <p className="posenc-viz__combined-desc">
            The position encoding is <strong>added</strong> to the word embedding before the model sees it.
            Same word at different positions → different input to the model:
          </p>
          <div className="posenc-viz__combined-rows">
            {SENTENCE.map((word, pos) => (
              <div key={word + pos} className="posenc-viz__combined-row">
                <span className="posenc-viz__combined-word">{word}</span>
                <span className="posenc-viz__combined-eq">
                  = embed(<span style={{ color: '#50fa7b' }}>{word}</span>)
                  + PE(<span style={{ color: '#bd93f9' }}>{pos}</span>)
                </span>
                {word === 'the' && pos > 0 && (
                  <span className="posenc-viz__combined-note">
                    ← same word, different position = different input
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
