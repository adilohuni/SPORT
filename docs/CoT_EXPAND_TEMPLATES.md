# Expanding CoT Templates — Best Practices

This guide explains how to add new templates, extend existing ones, and keep collections maintainable and interoperable.

Design principles
- Backwards-compatible: adding new optional fields should not break older clients.
- Minimal required fields: keep `name` and `data` required; everything else optional.
- Human-friendly metadata: include `description`, `tags`, and `author` to make discovery easier.

Recommended additional metadata
- `id`: string — stable identifier (UUID recommended)
- `version`: number — schema version for migrations
- `tags`: string[] — search categories
- `author`: string — creator name or handle
- `createdAt` / `updatedAt`: ISO strings
- `locale`: string — e.g., `en-US`

Example expanded template (JSON)

```json
{
  "id": "uuid-1234",
  "name": "Wait action (expanded)",
  "description": "Wait-until-loaded reasoning flow",
  "version": 2,
  "metadata": { "difficulty": "easy", "platform": "web" },
  "data": "{\"grid\":[[{\"title\":\"First thought successful\",\"buttons\":[\"...\"]}]]}",
  "example": "<strong>Example</strong>"
}
```

Guidelines for adding new templates
1. Start with a minimal `name` and `data`.
2. Add `description` and `tags` for discoverability.
3. If you add new structural fields (e.g., an explicit `steps` array or `conditions`), increment `version` and include a migration function.
4. Test round-trip: import → edit → export → re-import.

Extending `data` with richer semantics
- Add typed action descriptors instead of raw strings when you need machine-executable instructions:

  ```json
  { "action": "click", "target": "#submit", "label": "Click submit" }
  ```

- Keep the older `buttons` array available as a fallback, or provide an automatic conversion step when saving.

Sharing and curating collections
- Encourage `tags` and `description` so maintainers can curate and create themed collections.
- When producing public collections, remove sensitive data and sanitize `example` HTML.

Migration strategy
- Keep a `migrations/` folder with small functions that transform older parsed `data` shapes into the new one.
- On import, read `version` and run migrations up to current version.

Tooling & automation
- Add a CLI or script to validate all templates in a directory:

  ```bash
  node scripts/validate-templates.js CoT_templates_collection.json
  ```

- Provide an `examples/` folder with small sample templates that show best practices and edge cases.

Documenting new fields
- Whenever you add a new field, update `TEMPLATES.md` and the new docs here and bump the collection version.

Summary checklist for adding a new template
- [ ] Create with `name` + `data`
- [ ] Add `id`, `description`, `tags`, and `metadata` where appropriate
- [ ] Validate with `templates.schema.json`
- [ ] Add an `example` HTML fragment demonstrating usage
- [ ] Add unit test or manual test case to verify import/export
