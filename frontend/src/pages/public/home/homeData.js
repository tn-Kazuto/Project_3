export const FALLBACK_RECIPE_IMAGE = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=85';

export const CULINARY_SVG_PLACEHOLDER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" fill="none"><rect width="800" height="450" fill="%23242320"/><rect x="30" y="30" width="740" height="390" stroke="%23c5a880" stroke-width="1.5" stroke-dasharray="6 4" fill="none"/><circle cx="400" cy="180" r="44" stroke="%23c5a880" stroke-width="2" fill="%231a1918"/><path d="M380 185C380 170 390 160 400 160C410 160 420 170 420 185H380Z" fill="%23c5a880"/><rect x="375" y="187" width="50" height="4" rx="2" fill="%23c5a880"/><circle cx="400" cy="154" r="4" fill="%23c5a880"/><text x="400" y="270" text-anchor="middle" fill="%23fcfbf7" font-family="serif" font-size="20" letter-spacing="3">CHEF JAMES THEW</text><text x="400" y="300" text-anchor="middle" fill="%23c5a880" font-family="monospace" font-size="12" letter-spacing="4">5-STAR CULINARY ATELIER</text></svg>`;

export const INITIAL_HOME_DATA = {
  recipes: { status: 'loading', items: [] },
  contests: { status: 'loading', items: [] },
  announcements: { status: 'loading', items: [] },
};

export const getListState = (result, limit) => {
  if (result.status !== 'fulfilled' || result.value?.data?.success !== true) {
    return { status: 'error', items: [] };
  }

  const collection = result.value.data.data;
  const records = Array.isArray(collection)
    ? collection
    : Array.isArray(collection?.items)
      ? collection.items
      : null;

  if (!records) return { status: 'error', items: [] };

  const items = records.slice(0, limit);
  return { status: items.length ? 'success' : 'empty', items };
};

export const formatHomeDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};
