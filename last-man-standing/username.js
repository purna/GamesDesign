import {
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  NAME_PATTERN,
  NAME_RULE_TEXT,
  PROFANITY_ENDPOINT,
  PROFANITY_TIMEOUT_MS
} from './config.js';

// Local fallback list. Deliberately small: it only has to cover the obvious
// cases when the remote service is unreachable, and it fails open otherwise.
const LOCAL_BLOCKLIST = [
  'fuck', 'shit', 'cunt', 'bitch', 'bastard', 'wanker', 'slut', 'whore',
  'nigger', 'nigga', 'faggot', 'rape', 'nazi', 'hitler', 'pedo'
];

export function normalizeName(raw) {
  return String(raw || '').trim().toLowerCase();
}

export function validateNameFormat(raw) {
  const name = normalizeName(raw);
  if (name.length < MIN_NAME_LENGTH) {
    return { ok: false, name, reason: 'Enter a name to continue.' };
  }
  if (name.length > MAX_NAME_LENGTH) {
    return { ok: false, name, reason: `Names can be at most ${MAX_NAME_LENGTH} characters.` };
  }
  if (!NAME_PATTERN.test(name)) {
    return { ok: false, name, reason: NAME_RULE_TEXT };
  }
  return { ok: true, name };
}

function hasLocalProfanity(name) {
  const flattened = name.replace(/-/g, '');
  return LOCAL_BLOCKLIST.some(word => flattened.includes(word));
}

/**
 * Asks PurgoMalum whether the name contains profanity.
 * Resolves { ok, reason, source } — never rejects. On network failure or
 * timeout it falls back to the local blocklist so a dead service cannot lock
 * a player out, while still catching the obvious cases.
 */
export async function checkProfanity(name, { timeoutMs = PROFANITY_TIMEOUT_MS, fetchImpl = globalThis.fetch } = {}) {
  if (hasLocalProfanity(name)) {
    return { ok: false, reason: 'That name is not allowed. Please choose another.', source: 'local' };
  }
  if (typeof fetchImpl !== 'function') {
    return { ok: true, source: 'fallback' };
  }

  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = setTimeout(() => controller && controller.abort(), timeoutMs);
  try {
    const url = `${PROFANITY_ENDPOINT}?text=${encodeURIComponent(name)}`;
    const response = await fetchImpl(url, { signal: controller ? controller.signal : undefined });
    if (!response || !response.ok) return { ok: true, source: 'fallback' };
    const body = (await response.text()).trim().toLowerCase();
    if (body === 'true') {
      return { ok: false, reason: 'That name is not allowed. Please choose another.', source: 'remote' };
    }
    return { ok: true, source: 'remote' };
  } catch (error) {
    return { ok: true, source: 'fallback' };
  } finally {
    clearTimeout(timer);
  }
}

/** Full gate: format first (cheap, offline), then moderation. */
export async function validateUsername(raw, options) {
  const format = validateNameFormat(raw);
  if (!format.ok) return format;
  const moderation = await checkProfanity(format.name, options);
  if (!moderation.ok) return { ok: false, name: format.name, reason: moderation.reason };
  return { ok: true, name: format.name, source: moderation.source };
}
