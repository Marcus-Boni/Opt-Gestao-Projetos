const DATA_URL_PREFIX = /^data:image\/[a-zA-Z0-9.+-]+;base64,/;
const REMOTE_URL_PREFIX = /^(https?:)?\/\//;

export function normalizeUserImage(image?: string | null) {
  const cleanImage = image?.trim();
  if (!cleanImage) return undefined;
  if (DATA_URL_PREFIX.test(cleanImage) || REMOTE_URL_PREFIX.test(cleanImage)) return cleanImage;
  return `data:image/jpeg;base64,${cleanImage}`;
}

export function getUserInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.split('@')[0] || 'Usuario';
  const words = source
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .map((word) => word.trim())
    .filter(Boolean);

  if (words.length === 1) return words[0]?.slice(0, 2).toUpperCase() ?? 'US';
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}
