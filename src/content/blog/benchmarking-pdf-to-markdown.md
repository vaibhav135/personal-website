---
title: "Benchmarking PDF-to-Markdown: PaddleOCR-VL vs Marker vs PP-StructureV3 on Cloud GPUs"
description: "Real-world benchmarks comparing three PDF-to-Markdown tools on Modal's serverless GPUs. Speed, quality, cost, and setup complexity — tested on the same 15-page paper across T4, A10G, and L4."
pubDate: 2026-02-22
tags: ["ocr", "pdf", "markdown", "modal", "benchmark", "paddleocr", "marker", "machine-learning"]
---

I spent a day benchmarking every PDF-to-Markdown tool I could get running on [Modal's](https://modal.com) serverless GPUs. I ran them all on the same document — the *"Attention Is All You Need"* paper (15 pages, math-heavy, tables, figures, multi-column layout) — and measured speed, output quality, cost, and setup pain.

Here are the real numbers.

## The Tools

I tested three approaches, all from the open-source ecosystem:

- **PaddleOCR-VL 1.5** — A 0.9B vision-language model that processes each detected element through autoregressive generation. The "smart" approach.
- **PP-StructureV3** — A traditional multi-model pipeline from the same PaddleOCR project. Runs specialized models in parallel: layout detection, OCR, table recognition, and formula recognition.
- **Marker** ([datalab-to/marker](https://github.com/datalab-to/marker)) — A PyTorch-based tool built on Surya OCR. The most popular open-source option with 31k+ GitHub stars.

I also tested PP-StructureV3 with a **lightweight configuration** — swapping the default server-grade models for mobile-optimized ones. More on that later.

## Speed: The Numbers

All benchmarks on the same 15-page PDF, measured on warm containers (model already loaded):

| Tool | T4 | A10G | L4 |
|---|---|---|---|
| PaddleOCR-VL 1.5 | 7 min | 5.3 min | — |
| PP-StructureV3 (default) | — | 51.3s | — |
| **PP-StructureV3 (lightweight)** | — | **26.2s** | **31.7s** |
| **Marker** | 3.2 min | **54.0s** | ~70s |

PP-StructureV3 lightweight clocks in at **1.7 seconds per page** on an A10G. Marker is roughly 2x slower but still very capable. PaddleOCR-VL is in a different (worse) league entirely.

The journey from 7 minutes to 26 seconds involved four optimizations stacked together: upgrading from T4 to A10G, switching from the VLM approach to the traditional pipeline, applying the lightweight model configuration, and using Modal's `@modal.cls()` pattern to keep models loaded between calls.

## Quality: Where It Actually Matters

Speed means nothing if the output is garbage. I compared the three tools across five dimensions.

### Math and LaTeX

This is where the tools diverge the most.

**StructureV3** wraps everything in proper LaTeX delimiters. Even inline math like `W_i^Q ∈ R^{d_model × d_k}` comes out as valid LaTeX. There's a cosmetic issue with letter-spacing inside `\operatorname{}` blocks, but it renders correctly.

**Marker** handles block equations reasonably well, but inline math frequently degrades to plain text. The projection matrix definition — a critical piece of the paper — came out as `W Q i ∈ R dmodel×dk`. Unreadable.

### Tables

**Marker** produces clean markdown pipe tables that are easy to read in raw form and render well everywhere. **StructureV3** outputs HTML `<table>` tags — they work, but they're harder to read and edit. For complex tables like the model variations comparison (Table 3 in the paper), Marker handled the structure noticeably better.

### Reading Order

This is the dealbreaker.

**StructureV3** jumbles the page order. In my test, the reference list and appendix figures appeared on pages 3–4 of the output — *before* the main body content of the paper. If you're feeding this into an LLM or building a RAG pipeline, this destroys the context.

**Marker** gets the reading order perfect throughout. Every section, figure reference, and citation appears exactly where it should.

### Completeness

**Marker** captures content that both StructureV3 configurations miss entirely: footnotes, author contribution notes, equation numbers, and clickable cross-references with anchor IDs. These details matter for faithful document reproduction.

### A Surprising Finding

The lightweight StructureV3 config produced **better** OCR accuracy than the default config. The default had errors like *"English-to-Grman"*, *"self-atention"*, and misidentified Figure 4 (an attention visualization) as a garbled HTML table. The lightweight config had none of these issues.

Heavier model ≠ better output. Sometimes the bigger models overfit to patterns that don't apply to your document.

## What It Costs

Here's the actual cost per run on Modal:

| Configuration | Warm Time | GPU Rate | Cost per Run |
|---|---|---|---|
| SV3 Lightweight + L4 | 31.7s | $0.73/hr | **$0.006** |
| SV3 Lightweight + A10G | 26.2s | $1.10/hr | $0.008 |
| Marker + A10G | 54.0s | $1.10/hr | $0.016 |
| PaddleOCR-VL + A10G | 5.3 min | $1.10/hr | $0.097 |

For comparison, [Datalab's hosted API](https://www.datalab.to) (the commercial version of Marker) charges $4 per 1,000 pages and gives you $25 in free credit every month. That's 6,250 pages for free. At low volumes, the API is the obvious choice.

Self-hosting only makes economic sense above roughly 50,000 pages per month, or when you need data to stay on your own infrastructure.

## The Setup Experience

This matters more than most benchmarks acknowledge.

### PaddleOCR (both VL and StructureV3)

PaddlePaddle is not on PyPI in any usable form for GPU workloads. You have to install it from a special mirror:

```bash
pip install paddlepaddle-gpu==3.2.1 -i https://www.paddlepaddle.org.cn/packages/stable/cu118/
```

From there, it was a cascade of issues:

- `paddlepaddle-gpu` segfaults when run on CPU — which happens during container image builds where no GPU is available. I had to use Modal's `Image.run_function(fn, gpu="L4")` to attach a GPU to the build step.
- `numpy>=2.0` breaks inference with a cryptic *"only 0-dimensional arrays can be converted to Python scalars"* error. Fix: pin `numpy<2.0`.
- `safetensors` version conflicts required manual upgrades.
- Errors in container lifecycle hooks (`@modal.enter()`) are silent on the client side — they only appear in Modal's dashboard logs. I spent 6 minutes watching a hanging terminal before checking the dashboard.

### Marker

```bash
pip install marker-pdf torch
```

That's it. Standard PyTorch, standard pip, no special index URLs, no numpy version hacks. It worked on the first try.

## Lessons from Running ML Models on Modal

A few things I learned the hard way that aren't obvious from the docs:

**Keep models loaded between calls.** Modal's `@modal.cls()` with `@modal.enter()` loads your model once when the container starts and reuses it across all subsequent requests. Without this, every invocation pays the full model loading cost — 30–60 seconds for a 1GB+ model.

```python
@app.cls(image=image, gpu="L4", scaledown_window=300)
class OCRService:
    @modal.enter()
    def setup(self):
        self.pipeline = PPStructureV3(**config)

    @modal.method()
    def convert(self, file_bytes, filename):
        return self.pipeline.predict(...)
```

**Use `scaledown_window` to keep containers warm.** Setting `scaledown_window=300` keeps the container alive for 5 minutes after the last request. During testing, my second call to Marker processed a 1-page resume in 2.8 seconds. Without the warm window, that same call would take 60+ seconds.

**Bake models into the image.** Use `Image.run_function(download_fn, gpu="L4")` to download and initialize models during the image build. They get snapshotted into the container image, eliminating download time on cold starts.

**Separate deployment from execution.** `modal deploy` builds your image and registers your functions once. Then a separate caller script invokes the deployed function — no rebuilding, no waiting.

**L4 GPUs are underrated.** The L4 is 34% cheaper than the A10G ($0.73/hr vs $1.10/hr) with comparable inference performance for PaddlePaddle workloads. For Marker (PyTorch), the A10G was measurably faster — different frameworks have different GPU architecture preferences.

## The Verdict

| Use Case | Best Choice |
|---|---|
| Occasional PDF conversion | **Datalab API** — $25/mo free credit, ~15s processing, zero infrastructure |
| Math-heavy papers where LaTeX accuracy matters | **PP-StructureV3 lightweight** on L4 — 26–32s, $0.006/run |
| Best overall document quality and structure | **Marker** on A10G — 54s, correct reading order, complete extraction |
| Any use case | Not PaddleOCR-VL — slowest, worst quality, hardest to set up |

If I could only pick one tool for general-purpose document conversion, it would be **Marker**. The reading order and completeness issues with StructureV3 are hard to work around in production, and Marker's setup experience is dramatically better.

If LaTeX formula accuracy is your primary concern — research papers going into a math-aware pipeline — **StructureV3 lightweight** is worth the extra setup complexity.

And if you're processing fewer than 6,000 pages a month, just use the Datalab API and save yourself the infrastructure headache entirely.

---

*All Modal configs used in this benchmark are [available on GitHub](https://github.com/vaibhav135/pdf-to-markdown-benchmarks-modal_com). Feel free to reproduce and extend these results.*
