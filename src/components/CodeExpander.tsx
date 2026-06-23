import { useState } from 'react';

interface Props {
  /** Pre-highlighted code HTML (a Shiki <pre>…</pre> string). */
  html: string;
  /** Collapsed height in px — the size of the "glimpse". */
  previewHeight?: number;
  /** Optional label for the expand button. */
  label?: string;
}

/**
 * Shows a clipped glimpse of a code block with a fade-out at the bottom and an
 * Expand button overlaid inside the viewer. Clicking expands it in place to the
 * full source; clicking again collapses back.
 *
 * The code is highlighted at build time (see CodeViewer.astro) and handed in as
 * an HTML string, so this island stays tiny — it only owns the open/closed state.
 */
export default function CodeExpander({ html, previewHeight = 180, label = 'Expand full source' }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`code-expander ${open ? 'code-expander--open' : ''}`}>
      <div
        className="code-expander__viewport"
        style={open ? undefined : { maxHeight: `${previewHeight}px` }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {!open && <div className="code-expander__fade" aria-hidden="true" />}

      <button
        type="button"
        className="code-expander__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="code-expander__chevron">▸</span>
        {open ? 'Collapse' : label}
      </button>
    </div>
  );
}
