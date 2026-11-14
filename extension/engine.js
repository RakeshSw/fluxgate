export function parseValue(kind, input) {
  if (kind === 'blank') return '';
  if (kind === 'null') return null;
  if (kind === 'string') return String(input ?? '');
  if (kind === 'boolean') {
    if (input === 'true') return true;
    if (input === 'false') return false;
    throw new Error('Boolean must be true or false');
  }
  if (kind === 'number') {
    if (!String(input).trim() || !Number.isFinite(Number(input))) throw new Error('Invalid number');
    return Number(input);
  }
  if (kind === 'json') return JSON.parse(input);
  throw new Error('Unknown replacement type');
}
export function editDocument(document, path, replacement) {
  const parts = String(path).trim().replace(/\[(\d+)\]/g, '.$1').split('.');
  if (!parts.length || parts.some(p => !p || ['__proto__','constructor','prototype'].includes(p))) throw new Error('Invalid JSON path');
  let cursor = document;
  for (const part of parts.slice(0,-1)) {
    if (cursor === null || typeof cursor !== 'object' || !Object.hasOwn(cursor,part)) throw new Error('Path not found');
    cursor = cursor[part];
  }
  const last = parts.at(-1);
  if (cursor === null || typeof cursor !== 'object' || !Object.hasOwn(cursor,last)) throw new Error('Path not found');
  const original = cursor[last];
  cursor[last] = replacement;
  return {document, original};
}
export function eligibleRequest(url, pattern, mime, method = 'GET') {
  if (method !== 'GET') return false;
  if (!pattern || !String(url).includes(pattern)) return false;
  return /(?:^|\b|\/)application\/json\b|\+json\b/i.test(mime || '');
}
export function filteredHeaders(headers) {
  const excluded = new Set(['content-length','content-encoding','transfer-encoding','etag','content-md5']);
  return (headers || []).filter(item=>!excluded.has(String(item.name).toLowerCase()));
}
export function toBase64(source) {
  const octets = new TextEncoder().encode(source);
  let result='';
  for(let p=0;p<octets.length;p+=8192) result += String.fromCharCode(...octets.subarray(p,p+8192));
  return btoa(result);
}
export function fromBase64(source) {
  const bytes = Uint8Array.from(atob(source),c=>c.charCodeAt(0));
  return new TextDecoder('utf-8',{fatal:true}).decode(bytes);
}
