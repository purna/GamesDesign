import { BUCKET_MS } from './config.js';

export function generateDynamicCode(bucket) {
  const hash = Math.sin(bucket) * 1000000;
  return Math.abs(Math.floor(hash)).toString(36).substring(0, 6).toUpperCase().padStart(6, 'X');
}

export function currentBucket() {
  return Math.floor(Date.now() / BUCKET_MS);
}

export function roomNameFor(bucket) {
  return `lms-arena-${generateDynamicCode(bucket)}`;
}
