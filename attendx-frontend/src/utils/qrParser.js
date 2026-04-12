/**
 * Parses the raw string from a QR scan.
 * Returns { valid: bool, data?: object, error?: string }
 * 
 * Handles:
 *  - Valid JSON:        '{"vsn": 79}'
 *  - Single-quoted JSON: "{'vsn': 79}"   (Python-style dicts)
 *  - Plain string:       "79"            (treated as raw PK value)
 */
export function parseQRData(rawString) {
  if (!rawString || typeof rawString !== 'string') {
    return { valid: false, error: 'Invalid QR — Empty scan' };
  }

  const trimmed = rawString.trim();

  // Try standard JSON first
  let parsed = tryParseJSON(trimmed);

  // If that fails, try replacing single quotes with double quotes
  if (!parsed) {
    const normalized = trimmed.replace(/'/g, '"');
    parsed = tryParseJSON(normalized);
  }

  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return { valid: true, data: parsed };
  }

  // If it's a plain string (e.g., just "79"), treat it as a raw value
  // The backend will need the PK mapping to handle this
  if (trimmed && !trimmed.startsWith('{')) {
    return { valid: true, data: { _raw: trimmed } };
  }

  return { valid: false, error: 'Invalid QR — Unrecognized format' };
}

function tryParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
