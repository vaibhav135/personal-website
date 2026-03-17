import { useState } from 'react';

const HEADS = [
  {
    id: 1,
    name: 'Head 1',
    specialty: 'Syntax',
    color: '#bd93f9',
    description: 'Tracks grammatical relationships — subject/verb/object structure',
    // Which words "bank" attends to most in this head
    attention: { I: 0.45, deposited: 0.10, money: 0.08, at: 0.12, the: 0.10, bank: 0.15 },
  },
  {
    id: 2,
    name: 'Head 2',
    specialty: 'Semantics',
    color: '#50fa7b',
    description: 'Tracks meaning relationships — "bank" connects to financial words',
    attention: { I: 0.04, deposited: 0.32, money: 0.35, at: 0.05, the: 0.04, bank: 0.20 },
  },
  {
    id: 3,
    name: 'Head 3',
    specialty: 'Coreference',
    color: '#ff79c6',
    description: 'Tracks what refers to what — pronoun resolution, entity tracking',
    attention: { I: 0.50, deposited: 0.15, money: 0.10, at: 0.08, the: 0.07, bank: 0.10 },
  },
  {
    id: 4,
    name: 'Head 4',
    specialty: 'Position',
    color: '#ffb86c',
    description: 'Tracks relative position — words nearby vs far away',
    attention: { I: 0.08, deposited: 0.12, money: 0.10, at: 0.20, the: 0.28, bank: 0.22 },
  },
  {
    id: 5,
    name: 'Head 5',
    specialty: 'Context',
    color: '#8be9fd',
    description: 'Broad context — attends to many words to build general sentence meaning',
    attention: { I: 0.15, deposited: 0.20, money: 0.18, at: 0.14, the: 0.13, bank: 0.20 },
  },
  {
    id: 6,
    name: 'Head 6',
    specialty: 'Local',
    color: '#f1fa8c',
    description: 'Adjacent words — strong attention to immediately neighboring tokens',
    attention: { I: 0.05, deposited: 0.08, money: 0.10, at: 0.22, the: 0.38, bank: 0.17 },
  },
  {
    id: 7,
    name: 'Head 7',
    specialty: 'Rare patterns',
    color: '#ff5555',
    description: 'Catches unusual or rare linguistic constructions',
    attention: { I: 0.12, deposited: 0.25, money: 0.20, at: 0.10, the: 0.08, bank: 0.25 },
  },
  {
    id: 8,
    name: 'Head 8',
    specialty: 'Entity',
    color: '#6272a4',
    description: 'Entity recognition — tracks named entities, proper nouns, key nouns',
    attention: { I: 0.10, deposited: 0.15, money: 0.25, at: 0.08, the: 0.07, bank: 0.35 },
  },
];

const WORDS = ['I', 'deposited', 'money', 'at', 'the', 'bank'];

export default function MultiHeadAttention() {
  const [activeHead, setActiveHead] = useState<number | null>(null);

  const displayHeads = activeHead !== null ? HEADS.filter(h => h.id === activeHead) : HEADS;

  return (
    <div className="multihead-viz">
      <p className="multihead-viz__desc">
        For the query word <strong>"bank"</strong> — each head attends to different words.
        Click a head to zoom in, or view all 8 at once:
      </p>

      {/* Head selector */}
      <div className="multihead-viz__heads">
        <button
          onClick={() => setActiveHead(null)}
          className={`multihead-viz__head-btn ${activeHead === null ? 'multihead-viz__head-btn--all' : ''}`}
        >
          All 8 heads
        </button>
        {HEADS.map(h => (
          <button
            key={h.id}
            onClick={() => setActiveHead(activeHead === h.id ? null : h.id)}
            className={`multihead-viz__head-btn ${activeHead === h.id ? 'multihead-viz__head-btn--active' : ''}`}
            style={activeHead === h.id ? { borderColor: h.color, color: h.color } : {}}
          >
            {h.name}
            <span className="multihead-viz__specialty" style={{ color: h.color }}>
              {h.specialty}
            </span>
          </button>
        ))}
      </div>

      {/* Head grids */}
      <div className={`multihead-viz__grid ${activeHead !== null ? 'multihead-viz__grid--single' : ''}`}>
        {displayHeads.map(head => (
          <div
            key={head.id}
            className="multihead-viz__card"
            style={{ borderColor: head.color + '44' }}
          >
            <div className="multihead-viz__card-header" style={{ color: head.color }}>
              {head.name} — {head.specialty}
            </div>
            {activeHead !== null && (
              <p className="multihead-viz__card-desc">{head.description}</p>
            )}
            <div className="multihead-viz__bars">
              {WORDS.map(word => {
                const val = head.attention[word as keyof typeof head.attention];
                const isMax = val === Math.max(...Object.values(head.attention));
                return (
                  <div key={word} className="multihead-viz__bar-row">
                    <span className="multihead-viz__bar-word">{word}</span>
                    <div className="multihead-viz__bar-track">
                      <div
                        className="multihead-viz__bar"
                        style={{
                          width: `${val * 100}%`,
                          backgroundColor: isMax ? head.color : head.color + '66',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                    <span className="multihead-viz__bar-val">{Math.round(val * 100)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="multihead-viz__footer">
        Nobody programs these specializations. They emerge from training — the model discovers
        that splitting attention into multiple perspectives is more useful than one big pass.
      </p>
    </div>
  );
}
