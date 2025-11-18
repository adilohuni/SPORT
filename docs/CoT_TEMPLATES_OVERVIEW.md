# CoT Templates — Overview

This document explains the structure and intent of the CoT (Chain-of-Thought) template collection shipped in `CoT_templates_collection.json`.

Purpose
- These templates are designed to represent short multi-step reasoning or UI-guided instruction flows.
- Each template encodes a grid of thought steps; each step typically has a `title` and an ordered list of `buttons` (phrases or prompts).

Top-level file shape
- The exported collection is an object with the following top-level fields:
  - `mainFileName`: human-friendly name for the collection
  - `templates`: array of template objects
  - `exportDate`: ISO timestamp string

Template object shape (observed fields)
- `name`: string — human readable name for the template
- `data`: string — a JSON-serialized value (you should `JSON.parse(template.data)` to get the real structure)
- `example`: string (HTML) — a rendered example or explanatory HTML used by the source exporter

Parsed `data` structure (typical)
- When parsed, `data` typically looks like:

  - `grid`: an array of rows. Each row is an array of cells or `null`.
  - Each cell is an object with at least:
    - `title`: string — short step title
    - `buttons`: array<string> — phrases, actions, or prompt fragments

Example (parsing)

```ts
// Example usage in TypeScript
const raw = template.data; // string
const parsed = JSON.parse(raw);
// parsed.grid => array of rows
parsed.grid.forEach((row) => {
  row.forEach((cell) => {
    if (!cell) return; // cell may be null
    console.log(cell.title, cell.buttons);
  });
});
```

Notes & variations seen in the collection
- Some `grid` rows contain nested arrays representing multiple columns or grouped steps.
- `example` is HTML: it provides a human-facing explanation and may include markup; treat it as read-only descriptive content.
- Some templates include null cells — treat those as empty grid slots.

Rendering recommendations
- Build a renderer that reads parsed `grid` and maps each `cell` to a UI tile with a heading (`title`) and a list of actionable phrases (`buttons`).
- Allow `buttons` to be copyable and selectable; consider a small preview of the `example` HTML.

Validation suggestions
- Because `data` is a stringified JSON blob, validate both levels:
  1. Validate top-level object (has `name`, `data`)
  2. Validate parsed `data` (has `grid` array, rows are arrays, cells are objects with `title` and `buttons` arrays)

Simple JSON Schema sketch (conceptual)

```json
{
  "type": "object",
  "required": ["mainFileName","templates"],
  "properties": {
    "mainFileName": {"type":"string"},
    "templates": {"type":"array"}
  }
}
```

This schema is intentionally minimal — see `CoT_EVOLVE_APP.md` for a suggested strict schema for in-app validation and editor use.

Where this file should be consumed in the app
- Import flow: `ImportTemplatesCollectionModal` should parse the file, run schema validation, and insert templates into local store.
- Preview / browse flow: create a `TemplatesGallery` view to show names, small previews, and allow import per-template.

Appendix: quick checklist for implementers
- When loading a template: try `JSON.parse` on `data` and handle parse errors gracefully.
- Support null cells and variable row lengths.
- Escape/clean HTML in `example` when rendering in-app, or render as trusted content only when the user explicitly enables it.
