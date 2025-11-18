#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function error(msg) {
  console.error('ERROR:', msg);
}

function validateTemplate(parsed, index) {
  const errors = [];
  if (typeof parsed !== 'object' || parsed === null) {
    errors.push(`template[${index}] is not an object`);
    return errors;
  }
  if (typeof parsed.name !== 'string' || !parsed.name.trim()) {
    errors.push(`template[${index}].name must be a non-empty string`);
  }
  if (typeof parsed.data !== 'string') {
    errors.push(`template[${index}].data must be a JSON string`);
    return errors;
  }
  // parse the inner data
  try {
    const inner = JSON.parse(parsed.data);
    if (!Array.isArray(inner.grid)) {
      errors.push(`template[${index}].data.grid must be an array`);
    } else {
      inner.grid.forEach((row, rIdx) => {
        if (!Array.isArray(row)) {
          errors.push(`template[${index}].data.grid[${rIdx}] must be an array (row)`);
          return;
        }
        row.forEach((cell, cIdx) => {
          if (cell === null) return;
          if (typeof cell !== 'object') {
            errors.push(`template[${index}].data.grid[${rIdx}][${cIdx}] must be null or object`);
            return;
          }
          if (typeof cell.title !== 'string') {
            errors.push(`template[${index}].data.grid[${rIdx}][${cIdx}].title must be a string`);
          }
          if (!Array.isArray(cell.buttons)) {
            errors.push(`template[${index}].data.grid[${rIdx}][${cIdx}].buttons must be an array`);
          } else {
            cell.buttons.forEach((b, bIdx) => {
              if (typeof b !== 'string') errors.push(`template[${index}].data.grid[${rIdx}][${cIdx}].buttons[${bIdx}] must be a string`);
            });
          }
        });
      });
    }
  } catch (e) {
    errors.push(`template[${index}].data is not valid JSON: ${e.message}`);
  }

  return errors;
}

function validateCollection(obj) {
  const errors = [];
  if (typeof obj !== 'object' || obj === null) {
    errors.push('Top-level JSON must be an object');
    return errors;
  }
  if (typeof obj.mainFileName !== 'string') errors.push('mainFileName must be a string');
  if (!Array.isArray(obj.templates)) errors.push('templates must be an array');
  if (Array.isArray(obj.templates)) {
    obj.templates.forEach((t, i) => {
      const te = validateTemplate(t, i);
      errors.push(...te);
    });
  }
  return errors;
}

function main() {
  const argv = process.argv.slice(2);
  const filePath = argv[0] || path.join(process.cwd(), 'CoT_templates_collection.json');

  if (!fs.existsSync(filePath)) {
    error(`File not found: ${filePath}`);
    process.exit(2);
  }

  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    error(`Unable to read file: ${e.message}`);
    process.exit(2);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    error(`Invalid JSON: ${e.message}`);
    process.exit(2);
  }

  const errors = validateCollection(parsed);
  if (errors.length === 0) {
    console.log('Validation passed — no issues found.');
    process.exit(0);
  }

  console.error(`Validation failed: ${errors.length} issue(s) found:`);
  errors.forEach((e) => console.error(' -', e));
  process.exit(1);
}

if (require.main === module) main();
