import { useState } from 'react';

// Raw string state so users can fully clear and retype
const DEFAULT_MATRIX_STR = [['1', '0'], ['0', '2']];
const DEFAULT_INPUT_STR = ['2', '3'];

function toNum(s: string): number {
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

export default function MatrixMultiply() {
  const [matrixStr, setMatrixStr] = useState(DEFAULT_MATRIX_STR);
  const [inputStr, setInputStr] = useState(DEFAULT_INPUT_STR);
  const [highlightRow, setHighlightRow] = useState<number | null>(null);

  const matrix = matrixStr.map(row => row.map(toNum));
  const input = inputStr.map(toNum);

  const output = matrix.map(row =>
    row.reduce((sum, w, j) => sum + w * input[j], 0)
  );

  const updateMatrix = (row: number, col: number, val: string) => {
    setMatrixStr(m => m.map((r, i) => r.map((c, j) => i === row && j === col ? val : c)));
  };

  const updateInput = (idx: number, val: string) => {
    setInputStr(v => v.map((x, i) => i === idx ? val : x));
  };

  const reset = () => {
    setMatrixStr(DEFAULT_MATRIX_STR);
    setInputStr(DEFAULT_INPUT_STR);
  };

  return (
    <div className="mat-mul">
      <p className="mat-mul__desc">
        Every output is a weighted sum of all inputs — the same operation billions of times in a transformer.
        Edit any value to see the output update live:
      </p>

      {/* Main equation */}
      <div className="mat-mul__equation">

        {/* Weight matrix */}
        <div className="mat-mul__block">
          <div className="mat-mul__label" style={{ color: 'var(--orange)' }}>Weight matrix W</div>
          <div className="mat-mul__matrix">
            <div className="mat-mul__brace mat-mul__brace--left" />
            <div className="mat-mul__matrix-rows">
              {matrixStr.map((row, i) => (
                <div
                  key={i}
                  className={`mat-mul__row ${highlightRow === i ? 'mat-mul__row--highlight-orange' : ''}`}
                  onMouseEnter={() => setHighlightRow(i)}
                  onMouseLeave={() => setHighlightRow(null)}
                >
                  {row.map((val, j) => (
                    <input
                      key={j}
                      type="text"
                      inputMode="decimal"
                      value={val}
                      onChange={e => updateMatrix(i, j, e.target.value)}
                      className="mat-mul__cell mat-mul__cell--weight"
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="mat-mul__brace mat-mul__brace--right" />
          </div>
          <div className="mat-mul__shape">(2 × 2)</div>
        </div>

        <div className="mat-mul__op">×</div>

        {/* Input vector */}
        <div className="mat-mul__block">
          <div className="mat-mul__label" style={{ color: 'var(--yellow)' }}>Input vector</div>
          <div className="mat-mul__matrix">
            <div className="mat-mul__brace mat-mul__brace--left" />
            <div className="mat-mul__matrix-rows">
              {inputStr.map((val, i) => (
                <div
                  key={i}
                  className={`mat-mul__row ${highlightRow !== null ? 'mat-mul__row--dim' : ''}`}
                >
                  <input
                    type="text"
                    inputMode="decimal"
                    value={val}
                    onChange={e => updateInput(i, e.target.value)}
                    className="mat-mul__cell mat-mul__cell--input"
                  />
                </div>
              ))}
            </div>
            <div className="mat-mul__brace mat-mul__brace--right" />
          </div>
          <div className="mat-mul__shape">(2 × 1)</div>
        </div>

        <div className="mat-mul__op">=</div>

        {/* Output vector */}
        <div className="mat-mul__block">
          <div className="mat-mul__label" style={{ color: 'var(--green)' }}>Output vector</div>
          <div className="mat-mul__matrix">
            <div className="mat-mul__brace mat-mul__brace--left" />
            <div className="mat-mul__matrix-rows">
              {output.map((val, i) => (
                <div
                  key={i}
                  className={`mat-mul__row mat-mul__row--output ${highlightRow === i ? 'mat-mul__row--highlight-green' : ''}`}
                  onMouseEnter={() => setHighlightRow(i)}
                  onMouseLeave={() => setHighlightRow(null)}
                >
                  <span className="mat-mul__result">{val.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mat-mul__brace mat-mul__brace--right" />
          </div>
          <div className="mat-mul__shape">(2 × 1)</div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="mat-mul__breakdown">
        <div className="mat-mul__breakdown-header">
          <span className="mat-mul__breakdown-label">Step by step — how each output is computed:</span>
          <button className="mat-mul__reset" onClick={reset}>reset</button>
        </div>
        {output.map((val, i) => (
          <div
            key={i}
            className={`mat-mul__step ${highlightRow === i ? 'mat-mul__step--highlight' : ''}`}
            onMouseEnter={() => setHighlightRow(i)}
            onMouseLeave={() => setHighlightRow(null)}
          >
            <span className="mat-mul__step-label">row {i}:</span>
            <span className="mat-mul__step-out">output[{i}]</span>
            <span className="mat-mul__step-eq">=</span>
            {matrix[i].map((w, j) => (
              <span key={j} className="mat-mul__step-term">
                <span className="mat-mul__step-paren">(</span>
                <span className="mat-mul__step-w">{w}</span>
                <span className="mat-mul__step-times">×</span>
                <span className="mat-mul__step-x">{input[j]}</span>
                <span className="mat-mul__step-paren">)</span>
                {j < matrix[i].length - 1 && (
                  <span className="mat-mul__step-plus">+</span>
                )}
              </span>
            ))}
            <span className="mat-mul__step-eq">=</span>
            <span className="mat-mul__step-result">{val.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <p className="mat-mul__note">
        Hover a row to highlight which weights combine to produce that output.
        Real transformer matrices are 512×512 — same operation, 512 dimensions instead of 2.
      </p>
    </div>
  );
}
