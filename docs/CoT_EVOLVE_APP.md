# Evolving the App for CoT Templates

This document outlines concrete changes and feature ideas to evolve PromptGrid Studio so it fully supports creating, editing, validating, and sharing CoT-style templates.

Goals
- First-class support for CoT templates (create/edit/preview/import/export)
- Safe rendering of descriptive HTML/examples
- Strong validation and migration path for future template changes
- UX for building step-by-step reasoning flows

Recommended Features

- Template Editor UI
  - Add a dedicated editor that visualizes `grid` rows and cells as an editable matrix.
  - Allow adding/removing rows/columns and editing `title` and `buttons` per cell.
  - Support reordering and drag-and-drop of cells.

- Template Previewer
  - A read-only preview mode that shows how the template will appear for authors and end users.
  - Option to render the `example` HTML in a sandboxed iframe or into sanitized HTML.

- Strict JSON Schema + Validation
  - Add a `templates.schema.json` in `src/` and use it when importing templates.
  - Run validation on import and in the editor; show friendly errors.

- Versioning & Migration
  - Add `version` to templates; implement a migration utility to bring older templates forward when the schema evolves.

- Metadata & Search
  - Add metadata fields: `id`, `tags`, `author`, `createdAt`, `difficulty`, `locale`.
  - Add search and filter UI in `TemplatesGallery` using tags and text.

- Storage & Sync
  - Local-first storage (localStorage or IndexedDB) and optional cloud sync (GitHub Gist, personal S3/Blob or a simple backend).

- Import/Export UX
  - Bulk import: accept a collection file (like the provided `CoT_templates_collection.json`).
  - Single-template import/export for sharing a single template.
  - Provide an 'inspect' modal on import to show parsed structure and examples before adding.

- Programmatic Execution / Runtime
  - If the app will drive agents or step-through UIs, provide a runtime that can iterate through `buttons` and record chosen items.
  - Expose hooks for automation (e.g., run a template in a simulated environment or pass steps to an assistant).

Implementation pointers (where to change in repo)
- UI
  - Add `TemplateEditor.tsx` and `TemplatePreview.tsx` under `src/components/`.
  - Update `TemplateToolbar.tsx` to include 'Edit template' and 'Preview template' actions.

- State & Types
  - Add TypeScript interfaces in `src/types/templates.ts`:

    interface CoTCell { title: string; buttons: string[] }
    interface CoTGrid = CoTCell[][] | (CoTCell|null)[][]
    interface CoTTemplate { id?: string; name: string; data: string; example?: string; metadata?: Record<string, any> }

- Validation
  - Add `ajv` to `package.json` and validate on import and save.

- Security
  - When rendering `example` HTML, sanitize (e.g. `DOMPurify`) or render in an isolated iframe to avoid XSS.

Roadmap (minimal incremental steps)
1. Add `templates.schema.json` + import validation.
2. Add `TemplatePreview` component to display parsed content safely.
3. Add `TemplateEditor` that can load, edit, and save one template.
4. Wire editor actions to existing save/export modals (`SaveTemplateModal`, `ExportTemplatesCollectionModal`).
5. Add metadata fields and search UI.

Testing & QA
- Unit-test parse/serialize cycles for templates.
- Add integration tests for import/export flows.
- Manual QA: import `CoT_templates_collection.json`, edit one template, export and re-import.

Performance & UX
- Use virtualization for template lists if there are many templates.
- Provide autosave in editor and a clear undo/redo for editing steps.

Example: tiny migration helper (concept)

```ts
function migrateTemplate(parsedData: any, fromVersion = 1) {
  // example: ensure `grid` is always an array of rows
  if (!Array.isArray(parsedData.grid)) parsedData.grid = [];
  // more migration logic here
  return parsedData;
}
```
