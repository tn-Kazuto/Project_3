/**
 * Utilities for slicing culinary recipes and tips to a 50% complimentary preview
 * for unregistered visitors on the frontend.
 */

/**
 * Splits a recipe ingredients string into normalized items.
 * Handles newline/bullet-delimited lists as well as comma-delimited single-line lists.
 */
export const parseIngredientList = (rawIngredients) => {
  const lines = String(rawIngredients || '')
    .split(/\r?\n|•/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  if (lines.length === 1 && lines[0].includes(',')) {
    const commaParts = lines[0]
      .split(/,(?![^(]*\))/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    if (commaParts.length > 1) {
      return commaParts;
    }
  }

  return lines;
};

const truncateBlurredTeaser = (rawText, maxChars = 65) => {
  const clean = String(rawText || '').trim();
  if (!clean) return '';
  return clean.length > maxChars ? `${clean.slice(0, maxChars).trimEnd()}...` : clean;
};

/**
 * Splits a single block of text roughly in half at a natural sentence or word boundary.
 */
export const splitHalfText = (rawText) => {
  const text = String(rawText || '').trim();
  if (!text) {
    return { visibleText: '', hiddenTeaser: '', hasMore: false };
  }

  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 0);
  if (sentences.length >= 2) {
    const halfSentenceCount = Math.max(1, Math.floor(sentences.length / 2));
    const visibleText = sentences.slice(0, halfSentenceCount).join(' ');
    const hiddenTeaser = truncateBlurredTeaser(sentences.slice(halfSentenceCount).join(' '));
    // Only use sentence split if visible portion stays reasonably near half (20% - 75%)
    const ratio = visibleText.length / text.length;
    if (ratio >= 0.2 && ratio <= 0.75) {
      return { visibleText, hiddenTeaser, hasMore: true };
    }
  }

  const words = text.split(/\s+/);
  if (words.length < 2) {
    return { visibleText: text, hiddenTeaser: '', hasMore: false };
  }

  const targetCharIndex = Math.ceil(text.length * 0.5);
  let charCount = 0;
  let splitWordIndex = 1;

  for (let i = 0; i < words.length; i += 1) {
    charCount += words[i].length + (i > 0 ? 1 : 0);
    splitWordIndex = i + 1;
    if (charCount >= targetCharIndex) break;
  }

  // Ensure at least 1 word remains hidden when there are 2+ words
  if (splitWordIndex >= words.length) {
    splitWordIndex = words.length - 1;
  }

  return {
    visibleText: `${words.slice(0, splitWordIndex).join(' ')}...`,
    hiddenTeaser: truncateBlurredTeaser(words.slice(splitWordIndex).join(' ')),
    hasMore: true,
  };
};

/**
 * Truncates an array of recipe items (ingredients or steps) to 50% when preview mode is active.
 */
export const buildHalfPreview = (items, isPreview) => {
  const normalized = Array.isArray(items) ? items : [];
  if (!isPreview || normalized.length === 0) {
    return {
      visibleItems: normalized,
      hiddenTeaser: null,
      totalCount: normalized.length,
      isTruncated: false,
    };
  }

  if (normalized.length >= 2) {
    const visibleCount = Math.max(1, Math.ceil(normalized.length * 0.5));
    return {
      visibleItems: normalized.slice(0, visibleCount),
      hiddenTeaser: normalized[visibleCount] ? truncateBlurredTeaser(normalized[visibleCount]) : null,
      totalCount: normalized.length,
      isTruncated: visibleCount < normalized.length,
    };
  }

  // Single-item/single-paragraph fallback: split the text itself in half
  const { visibleText, hiddenTeaser, hasMore } = splitHalfText(normalized[0]);
  return {
    visibleItems: [visibleText],
    hiddenTeaser: hasMore ? hiddenTeaser : null,
    totalCount: 1,
    isTruncated: true,
  };
};
