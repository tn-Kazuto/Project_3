export const FALLBACK_RECIPE_IMAGE = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=85';

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
