import React, { useState, useEffect } from 'react';
import { recipeApi, tipApi, categoryApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, BookOpen, Lightbulb, ChefHat, Check, AlertCircle, X, Shield } from 'lucide-react';

export const MyRecipesPage = () => {
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('recipes'); // 'recipes' or 'tips'
  const [recipes, setRecipes] = useState([]);
  const [tips, setTips] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    ingredients: '',
    cookingProcedure: '',
    imageUrl: '',
    content: '',
    isFree: false,
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recRes, tipRes, catRes] = await Promise.all([
        recipeApi.getMyRecipes(),
        tipApi.getMyTips(),
        categoryApi.getAll(),
      ]);

      if (recRes.data?.success) setRecipes(recRes.data.data);
      if (tipRes.data?.success) setTips(tipRes.data.data);
      if (catRes.data?.success) setCategories(catRes.data.data);
    } catch (err) {
      console.error('Error loading member data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormData({
      title: '',
      categoryId: categories.length > 0 ? categories[0].categoryId : '',
      ingredients: '',
      cookingProcedure: '',
      imageUrl: '',
      content: '',
      isFree: false,
    });
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  };

  const openEditModal = (item, isRecipe = true) => {
    setModalMode('edit');
    setEditingId(isRecipe ? item.recipeId : item.tipId);
    setFormData({
      title: item.title,
      categoryId: item.categoryId || (categories[0]?.categoryId ?? ''),
      ingredients: item.ingredients || '',
      cookingProcedure: item.cookingProcedure || '',
      imageUrl: item.imageUrl || '',
      content: item.content || '',
      isFree: item.isFree,
    });
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  };

  const handleDelete = async (id, isRecipe = true) => {
    if (!window.confirm(`Are you sure you want to delete this ${isRecipe ? 'recipe' : 'tip'}?`)) {
      return;
    }

    try {
      if (isRecipe) {
        await recipeApi.delete(id);
      } else {
        await tipApi.delete(id);
      }
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting item');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (activeTab === 'recipes') {
      if (!formData.title.trim()) {
        setFormError('Recipe title is required.');
        return;
      }
      if (!formData.ingredients.trim()) {
        setFormError('Ingredients list is required.');
        return;
      }
      if (!formData.cookingProcedure.trim()) {
        setFormError('Cooking procedure is required.');
        return;
      }
    } else {
      if (!formData.title.trim()) {
        setFormError('Tip title is required.');
        return;
      }
      if (!formData.content.trim()) {
        setFormError('Tip content is required.');
        return;
      }
    }

    setSubmitting(true);

    try {
      if (activeTab === 'recipes') {
        const payload = {
          title: formData.title.trim(),
          categoryId: parseInt(formData.categoryId, 10),
          ingredients: formData.ingredients.trim(),
          cookingProcedure: formData.cookingProcedure.trim(),
          imageUrl: formData.imageUrl?.trim(),
          isFree: isAdmin ? formData.isFree : false,
        };

        if (modalMode === 'create') {
          await recipeApi.create(payload);
        } else {
          await recipeApi.update(editingId, payload);
        }
      } else {
        const payload = {
          title: formData.title.trim(),
          content: formData.content.trim(),
          isFree: isAdmin ? formData.isFree : false,
        };

        if (modalMode === 'create') {
          await tipApi.create(payload);
        } else {
          await tipApi.update(editingId, payload);
        }
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5 luxury-my-recipes">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-5 pb-3 border-bottom" style={{ borderColor: 'var(--dp-color-rule)' }}>
        <div>
          <div className="roman-numeral mb-1">IV &middot; REPERTOIRE MANAGEMENT</div>
          <h1 className="brand-font display-6 m-0 text-dark">
            {isAdmin ? 'Master Recipe & Tip Manager' : 'My Recipes & Culinary Tips'}
          </h1>
          <p className="text-muted small m-0 mt-2">
            {isAdmin
              ? 'Upload, publish, mark as Free/Member-Only, and manage Chef James Thew creations'
              : 'Manage, edit, or remove recipes and tips you have contributed to the community'}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="btn btn-primary px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
          style={{
            backgroundColor: 'var(--dp-color-field)',
            color: 'var(--dp-color-on-field)',
            letterSpacing: '0.14em',
            borderRadius: 0,
          }}
        >
          <Plus size={18} className="luxury-gold-icon" />
          <span>Add New {activeTab === 'recipes' ? 'Recipe' : 'Cooking Tip'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4 border-bottom pb-2" style={{ borderColor: 'var(--dp-color-rule)' }}>
        <button
          type="button"
          className="btn btn-sm px-4 py-2"
          style={{
            backgroundColor: activeTab === 'recipes' ? 'var(--dp-color-field)' : 'transparent',
            color: activeTab === 'recipes' ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
            borderColor: activeTab === 'recipes' ? 'var(--dp-color-field)' : 'var(--dp-color-rule)',
            letterSpacing: '0.12em',
            borderRadius: 0,
          }}
          onClick={() => setActiveTab('recipes')}
        >
          My Recipes ({recipes.length})
        </button>
        <button
          type="button"
          className="btn btn-sm px-4 py-2"
          style={{
            backgroundColor: activeTab === 'tips' ? 'var(--dp-color-field)' : 'transparent',
            color: activeTab === 'tips' ? 'var(--dp-color-on-field)' : 'var(--dp-color-ink)',
            borderColor: activeTab === 'tips' ? 'var(--dp-color-field)' : 'var(--dp-color-rule)',
            letterSpacing: '0.12em',
            borderRadius: 0,
          }}
          onClick={() => setActiveTab('tips')}
        >
          My Tips ({tips.length})
        </button>
      </div>

      {/* Content Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: 'var(--dp-color-accent)' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Retrieving contributions...</p>
        </div>
      ) : activeTab === 'recipes' ? (
        <div
          className="p-0 mb-4"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--dp-color-rule)',
          }}
        >
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead style={{ backgroundColor: 'var(--dp-color-ground-2)' }}>
                <tr>
                  <th scope="col" className="ps-4">Title</th>
                  <th scope="col">Category</th>
                  <th scope="col">Access Badge</th>
                  <th scope="col">Date Posted</th>
                  <th scope="col" className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipes.length > 0 ? (
                  recipes.map((r) => (
                    <tr key={r.recipeId}>
                      <td className="ps-4">
                        <span className="fw-semibold text-dark brand-font" style={{ fontSize: '1.05rem' }}>{r.title}</span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border font-monospace">{r.categoryName}</span>
                      </td>
                      <td>
                        <span
                          className="badge font-monospace"
                          style={{
                            backgroundColor: r.isFree ? '#1b4d3e' : 'var(--dp-color-field)',
                            color: '#ffffff',
                            borderRadius: 0,
                          }}
                        >
                          {r.isFree ? 'Free Access' : 'Members Only'}
                        </span>
                      </td>
                      <td className="small text-muted font-monospace">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(r, true)}
                            className="btn btn-outline-secondary btn-sm"
                            style={{ borderRadius: 0 }}
                            title="Edit Recipe"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(r.recipeId, true)}
                            className="btn btn-outline-dark btn-sm"
                            style={{ borderRadius: 0, borderColor: 'var(--dp-color-rule)' }}
                            title="Delete Recipe"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted small">
                      You have not published any recipes yet. Click "Add New Recipe" above to share!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Tips Table */
        <div
          className="p-0 mb-4"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--dp-color-rule)',
          }}
        >
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead style={{ backgroundColor: 'var(--dp-color-ground-2)' }}>
                <tr>
                  <th scope="col" className="ps-4">Tip Title</th>
                  <th scope="col">Content Preview</th>
                  <th scope="col">Access Badge</th>
                  <th scope="col">Date Posted</th>
                  <th scope="col" className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tips.length > 0 ? (
                  tips.map((t) => (
                    <tr key={t.tipId}>
                      <td className="ps-4">
                        <span className="fw-semibold text-dark brand-font" style={{ fontSize: '1.05rem' }}>{t.title}</span>
                      </td>
                      <td className="small text-secondary text-truncate" style={{ maxWidth: 300 }}>
                        {t.content}
                      </td>
                      <td>
                        <span
                          className="badge font-monospace"
                          style={{
                            backgroundColor: t.isFree ? '#1b4d3e' : 'var(--dp-color-field)',
                            color: '#ffffff',
                            borderRadius: 0,
                          }}
                        >
                          {t.isFree ? 'Free Access' : 'Members Only'}
                        </span>
                      </td>
                      <td className="small text-muted font-monospace">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(t, false)}
                            className="btn btn-outline-secondary btn-sm"
                            style={{ borderRadius: 0 }}
                            title="Edit Tip"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(t.tipId, false)}
                            className="btn btn-outline-dark btn-sm"
                            style={{ borderRadius: 0, borderColor: 'var(--dp-color-rule)' }}
                            title="Delete Tip"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted small">
                      You have not shared any tips yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(38, 35, 33, 0.7)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div
              className="modal-content"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--dp-color-accent)',
                borderRadius: 0,
              }}
            >
              <div
                className="modal-header py-3 px-4"
                style={{
                  backgroundColor: 'var(--dp-color-field)',
                  color: 'var(--dp-color-on-field)',
                  borderBottom: '1px solid var(--dp-color-accent)',
                  borderRadius: 0,
                }}
              >
                <h5 className="modal-title brand-font text-white m-0" style={{ fontSize: '1.25rem' }}>
                  {modalMode === 'create' ? 'Create New' : 'Edit'}{' '}
                  {activeTab === 'recipes' ? 'Recipe' : 'Cooking Tip'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="modal-body p-4">
                  {formError && (
                    <div className="alert alert-danger small py-2 mb-3" style={{ borderRadius: 0 }}>{formError}</div>
                  )}

                  {/* Common: Title */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ borderColor: 'var(--dp-color-rule)' }}
                      placeholder={activeTab === 'recipes' ? 'e.g. Classic Beef Bourguignon' : 'e.g. How to Keep Herbs Fresh'}
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  {activeTab === 'recipes' ? (
                    <>
                      {/* Category */}
                      <div className="mb-3">
                        <label className="form-label small fw-semibold">Category *</label>
                        <select
                          className="form-select"
                          style={{ borderColor: 'var(--dp-color-rule)' }}
                          value={formData.categoryId}
                          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                          required
                        >
                          {categories.map((c) => (
                            <option key={c.categoryId} value={c.categoryId}>
                              {c.categoryName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Ingredients */}
                      <div className="mb-3">
                        <label className="form-label small fw-semibold">
                          Ingredients * (Separate by new line)
                        </label>
                        <textarea
                          className="form-control"
                          style={{ borderColor: 'var(--dp-color-rule)' }}
                          rows="4"
                          placeholder="2 lbs Beef chuck, cut in cubes&#10;1 bottle Red Burgundy Wine&#10;2 Carrots, sliced&#10;Fresh Thyme..."
                          value={formData.ingredients}
                          onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                          required
                        ></textarea>
                      </div>

                      {/* Cooking Procedure */}
                      <div className="mb-3">
                        <label className="form-label small fw-semibold">
                          Cooking Procedure * (Step-by-step instructions)
                        </label>
                        <textarea
                          className="form-control"
                          style={{ borderColor: 'var(--dp-color-rule)' }}
                          rows="5"
                          placeholder="Step 1: Pat beef dry and brown thoroughly in a Dutch oven.&#10;Step 2: Add wine and stock, bring to simmer.&#10;Step 3: Transfer to oven at 160C for 3 hours..."
                          value={formData.cookingProcedure}
                          onChange={(e) => setFormData({ ...formData, cookingProcedure: e.target.value })}
                          required
                        ></textarea>
                      </div>
                    </>
                  ) : (
                    /* Cooking Tip Content */
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Cooking Tip Content *</label>
                      <textarea
                        className="form-control"
                        style={{ borderColor: 'var(--dp-color-rule)' }}
                        rows="6"
                        placeholder="Detail your professional kitchen tip, knife skill advice, or seasoning technique..."
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        required
                      ></textarea>
                    </div>
                  )}

                  {/* Optional Image URL */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Image URL (Optional)</label>
                    <input
                      type="url"
                      className="form-control"
                      style={{ borderColor: 'var(--dp-color-rule)' }}
                      placeholder="https://images.unsplash.com/..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                  </div>

                  {/* Admin Visibility Toggle */}
                  {isAdmin && (
                    <div
                      className="p-3 mb-3 d-flex align-items-center justify-content-between"
                      style={{
                        backgroundColor: 'var(--dp-color-ground-2)',
                        border: '1px solid var(--dp-color-panel-line)',
                      }}
                    >
                      <div>
                        <div className="fw-semibold small d-flex align-items-center gap-1">
                          <Shield size={16} className="luxury-gold-icon" />
                          <span>Free Public Access</span>
                        </div>
                        <small className="text-muted">
                          Allow non-registered guests to view full ingredients and instructions
                        </small>
                      </div>
                      <div className="form-check form-switch m-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          checked={formData.isFree}
                          onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                          style={{ cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer px-4 pb-4 pt-3 border-top" style={{ borderColor: 'var(--dp-color-rule)' }}>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    style={{ borderRadius: 0, letterSpacing: '0.12em' }}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 fw-semibold"
                    style={{
                      backgroundColor: 'var(--dp-color-field)',
                      color: 'var(--dp-color-on-field)',
                      letterSpacing: '0.14em',
                      borderRadius: 0,
                    }}
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : modalMode === 'create' ? 'Publish Item' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRecipesPage;
