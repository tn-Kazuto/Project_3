import { mediaApi } from './api';

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = {
  image: new Set(['image/jpeg', 'image/png', 'image/webp']),
  video: new Set(['video/mp4', 'video/webm', 'video/quicktime']),
};

export const uploadMediaFile = async (file, kind) => {
  if (!file || !ALLOWED_CONTENT_TYPES[kind]?.has(file.type)) {
    throw new Error('Choose a supported image or video file.');
  }
  if (file.size < 1 || file.size > MAX_UPLOAD_BYTES) {
    throw new Error('The selected file must be at most 100 MB.');
  }

  const ticketResponse = await mediaApi.createUploadTicket({
    fileName: file.name,
    contentType: file.type,
    size: file.size,
    kind,
  });
  const ticketEnvelope = ticketResponse.data;
  const ticket = ticketEnvelope?.success ? ticketEnvelope.data : null;
  if (!ticket?.uploadUrl || !ticket?.fields || !ticket?.ticketId) {
    throw new Error(ticketEnvelope?.message || 'Could not prepare the media upload.');
  }

  const formData = new FormData();
  Object.entries(ticket.fields).forEach(([name, value]) => formData.append(name, value));
  formData.append('file', file);

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 5 * 60 * 1000);
  let uploadResponse;
  try {
    uploadResponse = await fetch(ticket.uploadUrl, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      credentials: 'omit',
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('The upload timed out. Please try again with a smaller file.');
    }
    throw new Error('Could not reach Cloudinary. Check your connection and try again.');
  } finally {
    window.clearTimeout(timeoutId);
  }

  const uploadResult = await uploadResponse.json().catch(() => null);
  if (!uploadResponse.ok || !uploadResult?.signature) {
    throw new Error(uploadResult?.error?.message || 'Cloudinary could not upload this file.');
  }

  const completionResponse = await mediaApi.completeUpload(ticket.ticketId, {
    publicId: uploadResult.public_id,
    signature: uploadResult.signature,
    resourceType: uploadResult.resource_type,
    bytes: uploadResult.bytes,
    format: uploadResult.format,
    version: uploadResult.version,
  });
  const completionEnvelope = completionResponse.data;
  if (!completionEnvelope?.success || !completionEnvelope.data?.secureUrl) {
    throw new Error(completionEnvelope?.message || 'Could not verify the uploaded file.');
  }

  return completionEnvelope.data.secureUrl;
};
