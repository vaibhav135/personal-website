import { useState } from 'react';

const WORDS = ['king', 'queen', 'man', 'woman', 'cat', 'dog'];

// Simplified 6-dimensional embeddings (normally 512d)
// Dimensions: [royalty, gender_female, human, animal, size, domestic]
const EMBEDDINGS: Record<string, number[]> = {
  king:  [0.95, 0.10, 0.90, 0.05, 0.60, 0.20],
  queen: [0.95, 0.90, 0.90, 0.05, 0.55, 0.20],
  man:   [0.10, 0.10, 0.95, 0.05, 0.60, 0.30],
  woman: [0.10, 0.90, 0.95, 0.05, 0.50, 0.30],
  cat:   [0.05, 0.50, 0.05, 0.95, 0.20, 0.90],
  dog:   [0.05, 0.50, 0.05, 0.95, 0.40, 0.90],
};

const DIMS = ['royalty', 'feminine', 'human', 'animal', 'size', 'domestic'];
const DIM_COLORS = ['#bd93f9', '#ff79c6', '#8be9fd', '#50fa7b', '#ffb86c', '#f1fa8c'];

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (magA * magB);
}

export default function EmbeddingExplainer() {
  const [selected, setSelected] = useState('king');

  const embedding = EMBEDDINGS[selected];

  // Compute similarity to all other words
  const similarities = WORDS.map(w => ({
    word: w,
    sim: cosineSimilarity(embedding, EMBEDDINGS[w]),
  })).sort((a, b) => b.sim - a.sim);

  return (
    <div className="embedding-explainer">
      <p className="embedding-explainer__desc">
        Each word is a list of numbers — a point in space. Similar words end up close together.
        Click a word to see its embedding and how similar it is to the others:
      </p>

      {/* Word selector */}
      <div className="embedding-explainer__words">
        {WORDS.map(word => (
          <button
            key={word}
            onClick={() => setSelected(word)}
            className={`embedding-explainer__word ${selected === word ? 'embedding-explainer__word--active' : ''}`}
          >
            {word}
          </button>
        ))}
      </div>

      <div className="embedding-explainer__body">
        {/* Left: the embedding vector */}
        <div className="embedding-explainer__vector">
          <div className="embedding-explainer__col-label">
            "{selected}" as a vector <span>(6 dimensions, simplified)</span>
          </div>
          {DIMS.map((dim, i) => (
            <div key={dim} className="embedding-explainer__dim-row">
              <span className="embedding-explainer__dim-name" style={{ color: DIM_COLORS[i] }}>
                {dim}
              </span>
              <div className="embedding-explainer__bar-track">
                <div
                  className="embedding-explainer__bar"
                  style={{
                    width: `${embedding[i] * 100}%`,
                    backgroundColor: DIM_COLORS[i],
                    opacity: 0.3 + embedding[i] * 0.7,
                  }}
                />
              </div>
              <span className="embedding-explainer__bar-val">{embedding[i].toFixed(2)}</span>
            </div>
          ))}
          <p className="embedding-explainer__note">
            Real embeddings are 512–4096 dimensions and learned by the model — not hand-crafted like these.
            The model discovers which dimensions are meaningful on its own.
          </p>
        </div>

        {/* Right: similarity to other words */}
        <div className="embedding-explainer__similarity">
          <div className="embedding-explainer__col-label">
            Cosine similarity to other words
          </div>
          {similarities.map(({ word, sim }) => (
            <div key={word} className="embedding-explainer__sim-row">
              <span className={`embedding-explainer__sim-word ${word === selected ? 'embedding-explainer__sim-word--self' : ''}`}>
                {word}
              </span>
              <div className="embedding-explainer__bar-track">
                <div
                  className="embedding-explainer__bar embedding-explainer__bar--sim"
                  style={{ width: `${sim * 100}%` }}
                />
              </div>
              <span className="embedding-explainer__bar-val">{sim.toFixed(2)}</span>
            </div>
          ))}
          <p className="embedding-explainer__note">
            Cosine similarity measures how much two vectors "point in the same direction" — 1.0 = identical, 0.0 = nothing in common.
          </p>
        </div>
      </div>
    </div>
  );
}
