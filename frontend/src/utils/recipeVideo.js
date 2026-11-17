const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const DIRECT_VIDEO_TYPES = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mov': 'video/quicktime',
};

export const getVideoEmbed = (value) => {
  if (typeof value !== 'string' || !value.trim()) return null;

  let videoUrl;
  try {
    videoUrl = new URL(value.trim());
  } catch {
    return null;
  }

  if (videoUrl.protocol !== 'https:') return null;

  const host = videoUrl.hostname.toLowerCase().replace(/^www\./, '');
  if (host === 'youtu.be' || host === 'youtube.com' || host === 'm.youtube.com') {
    const pathId = videoUrl.pathname.match(/^\/(?:embed\/|shorts\/|live\/|v\/)?([A-Za-z0-9_-]{11})/i)?.[1];
    const videoId = host === 'youtu.be' ? videoUrl.pathname.slice(1).split('/')[0] : videoUrl.searchParams.get('v') || pathId;
    return videoId && YOUTUBE_ID_PATTERN.test(videoId)
      ? { type: 'iframe', src: `https://www.youtube.com/embed/${videoId}` }
      : null;
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const pathIds = videoUrl.pathname.match(/\d+/g);
    const videoId = pathIds?.[pathIds.length - 1];
    return videoId ? { type: 'iframe', src: `https://player.vimeo.com/video/${videoId}` } : null;
  }

  const extension = videoUrl.pathname.match(/\.[a-z0-9]+$/i)?.[0]?.toLowerCase();
  const mimeType = extension ? DIRECT_VIDEO_TYPES[extension] : null;
  return mimeType ? { type: 'video', src: videoUrl.href, mimeType } : null;
};

export const isSupportedRecipeVideoUrl = (value) => {
  if (value == null) return true;
  if (typeof value !== 'string') return false;
  return !value.trim() || Boolean(getVideoEmbed(value));
};
