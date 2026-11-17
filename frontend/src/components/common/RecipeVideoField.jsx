import React, { useState } from 'react';
import { uploadMediaFile } from '../../services/mediaUpload';
import { getVideoEmbed, isSupportedRecipeVideoUrl } from '../../utils/recipeVideo';

export const RecipeVideoField = ({ id, value, onChange, onUploadStateChange, uploading = false }) => {
  const [error, setError] = useState('');

  const handleFileChange = async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    setError('');
    onUploadStateChange?.(true);
    try {
      const videoUrl = await uploadMediaFile(file, 'video');
      onChange(videoUrl);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Video upload failed. Please try again.');
    } finally {
      onUploadStateChange?.(false);
    }
  };

  const validateUrl = () => {
    setError(isSupportedRecipeVideoUrl(value)
      ? ''
      : 'Use a secure YouTube or Vimeo link, or an HTTPS MP4, WebM, OGG, or MOV video URL.');
  };
  const preview = getVideoEmbed(value);

  return (
    <fieldset className="recipe-video-field border-0 p-0 m-0" disabled={uploading}>
      <legend className="form-label fw-semibold mb-2">Recipe video</legend>
      <label className="form-label small" htmlFor={`${id}-file`}>
        Upload a video (MP4, WebM, or MOV; up to 100 MB)
      </label>
      <input
        id={`${id}-file`}
        type="file"
        className="form-control mb-2"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={handleFileChange}
        aria-describedby={`${id}-help ${id}-status`}
      />
      <label className="form-label small" htmlFor={`${id}-url`}>
        Or add a video link
      </label>
      <input
        id={`${id}-url`}
        type="url"
        className="form-control"
        placeholder="https://youtu.be/... or https://.../video.mp4"
        value={value || ''}
        onChange={(event) => {
          onChange(event.target.value);
          setError('');
        }}
        onBlur={validateUrl}
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-help ${id}-status`}
      />
      <small id={`${id}-help`} className="form-text text-muted d-block mt-2">
        Supported links: YouTube, Vimeo, or a direct HTTPS video file.
      </small>
      <div id={`${id}-status`} className="small mt-2" aria-live="polite">
        {uploading && <span role="status">Uploading video… Keep this form open until upload finishes.</span>}
        {!uploading && value && !error && <span className="text-success">Video ready to save with this recipe.</span>}
        {error && <span className="text-danger" role="alert">{error}</span>}
      </div>
      {preview && !uploading && (
        <div className="ratio ratio-16x9 mt-3 border" style={{ borderColor: 'var(--dp-color-rule)' }}>
          {preview.type === 'video' ? (
            <video controls playsInline preload="metadata" className="w-100 h-100">
              <source src={preview.src} type={preview.mimeType} />
              Your browser does not support the video tag.
            </video>
          ) : (
            <iframe
              src={preview.src}
              title="Recipe video preview"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </div>
      )}
    </fieldset>
  );
};
