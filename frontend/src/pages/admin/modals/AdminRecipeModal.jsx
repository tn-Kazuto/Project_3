import React from 'react';

export const AdminRecipeModal = ({
  show,
  onClose,
  onSubmit,
  recipeForm,
  setRecipeForm,
  categories,
  savingRecipe,
}) => {
  if (!show) return null;

  return (
    <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title fw-bold">Add New Master Recipe</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={onSubmit}>
            <div className="modal-body p-4">
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label fw-semibold">Recipe Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Handmade Fettuccine al Tartufo"
                    value={recipeForm.title}
                    onChange={(e) => setRecipeForm({ ...recipeForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Category *</label>
                  <select
                    className="form-select"
                    value={recipeForm.categoryId}
                    onChange={(e) => setRecipeForm({ ...recipeForm, categoryId: e.target.value })}
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>
                        {c.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Ingredients List *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="List of ingredients..."
                    value={recipeForm.ingredients}
                    onChange={(e) => setRecipeForm({ ...recipeForm, ingredients: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Cooking Procedure *</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Step by step cooking procedure..."
                    value={recipeForm.cookingProcedure}
                    onChange={(e) => setRecipeForm({ ...recipeForm, cookingProcedure: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">Media Format *</label>
                  <select
                    className="form-select"
                    value={recipeForm.contentType}
                    onChange={(e) => setRecipeForm({ ...recipeForm, contentType: e.target.value })}
                  >
                    <option value="ARTICLE">Article (Written Recipe)</option>
                    <option value="VIDEO">Video Masterclass</option>
                    <option value="TALKSHOW">Culinary Talkshow</option>
                    <option value="LIVESHOW">Live Cooking Show</option>
                  </select>
                </div>

                <div className="col-md-8">
                  <label className="form-label fw-semibold">Video Stream URL (YouTube, Vimeo, MP4)</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://www.youtube.com/watch?v=... or direct mp4"
                    value={recipeForm.videoUrl}
                    onChange={(e) => setRecipeForm({ ...recipeForm, videoUrl: e.target.value })}
                  />
                  <label className="form-label fw-semibold mt-3" htmlFor="admin-recipe-video-upload">Or upload a video (MP4, WebM, MOV; max 100 MB)</label>
                  <input
                    id="admin-recipe-video-upload"
                    type="file"
                    className="form-control"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={(e) => setRecipeForm({ ...recipeForm, videoFile: e.target.files?.[0] || null })}
                  />
                  {recipeForm.videoFile && <small className="text-muted">Selected: {recipeForm.videoFile.name}. This file will be uploaded instead of the URL.</small>}
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Thumbnail / Cover Image URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={recipeForm.thumbnailUrl}
                    onChange={(e) => setRecipeForm({ ...recipeForm, thumbnailUrl: e.target.value })}
                  />
                  <label className="form-label fw-semibold mt-3" htmlFor="admin-recipe-cover-upload">Or upload a cover image (JPEG, PNG, WebP; max 100 MB)</label>
                  <input
                    id="admin-recipe-cover-upload"
                    type="file"
                    className="form-control"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setRecipeForm({ ...recipeForm, thumbnailFile: e.target.files?.[0] || null })}
                  />
                  {recipeForm.thumbnailFile && <small className="text-muted">Selected: {recipeForm.thumbnailFile.name}. This file will be uploaded instead of the URL.</small>}
                  {recipeForm.thumbnailUrl && (
                    <div className="mt-2 p-2 bg-white border d-flex align-items-center gap-3">
                      <div style={{ width: '80px', height: '60px', overflow: 'hidden', backgroundColor: '#e9ecef', flexShrink: 0 }}>
                        <img
                          src={recipeForm.thumbnailUrl}
                          alt="Thumbnail Preview"
                          className="w-100 h-100"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                      </div>
                      <div className="small font-monospace text-muted">
                        Live Cover Preview
                      </div>
                    </div>
                  )}
                </div>

                <div className="col-12">
                  <div className="form-check form-switch p-3 bg-light rounded-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="adminRecipeIsFreeSwitch"
                      checked={recipeForm.isFree}
                      onChange={(e) => setRecipeForm({ ...recipeForm, isFree: e.target.checked })}
                    />
                    <label className="form-check-label fw-semibold ms-2" htmlFor="adminRecipeIsFreeSwitch">
                      {recipeForm.isFree ? '🔓 Free Access (Open to Guests)' : '🔒 Members Only (Paid Subscription)'}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={savingRecipe}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary fw-semibold" disabled={savingRecipe}>
                {savingRecipe ? 'Uploading and saving...' : 'Save Recipe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
