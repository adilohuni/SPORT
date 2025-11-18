// Utility to extract and validate JSON from arbitrary text
export interface ValidationResult {
  ok: boolean;
  parsed?: any;
  error?: string;
  extracted?: string;
}

// Try to find the first JSON object or array in a string by locating matching braces/brackets.
function findJsonSubstring(text: string): string | null {
  if (!text) return null;

  const starts = ['{', '['];
  for (const startChar of starts) {
    let start = text.indexOf(startChar);
    while (start !== -1) {
      const stack: string[] = [];
      let i = start;
      for (; i < text.length; i++) {
        const ch = text[i];
        if (ch === '{' || ch === '[') stack.push(ch);
        else if (ch === '}' || ch === ']') {
          const last = stack[stack.length - 1];
          if ((ch === '}' && last === '{') || (ch === ']' && last === '[')) {
            stack.pop();
            if (stack.length === 0) {
              // return substring from start to i (inclusive)
              return text.slice(start, i + 1);
            }
          } else {
            // mismatched closing, stop this attempt
            break;
          }
        }
      }

      // Look for next occurrence
      start = text.indexOf(startChar, start + 1);
    }
  }

  return null;
}

export function validateJsonFromText(text: string): ValidationResult {
  if (typeof text !== 'string') {
    return { ok: false, error: 'Input is not a string' };
  }

  const trimmed = text.trim();

  // Quick try: direct parse
  try {
    const parsed = JSON.parse(trimmed);
    return { ok: true, parsed, extracted: trimmed };
  } catch (err) {
    // If direct parse fails, try to extract a JSON substring
    const extracted = findJsonSubstring(text);
    if (!extracted) {
      return { ok: false, error: 'No JSON object or array found in input.' };
    }

    try {
      const parsed = JSON.parse(extracted);
      return { ok: true, parsed, extracted };
    } catch (err2: any) {
      return { ok: false, error: `Failed to parse extracted JSON: ${err2?.message || String(err2)}`, extracted };
    }
  }
}

export default validateJsonFromText;
