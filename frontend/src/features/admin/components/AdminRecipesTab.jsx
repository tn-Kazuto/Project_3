import React from 'react';

export const AdminRecipesTab = ({
  recipes = [],
  setShowRecipeModal,
  handleToggleRecipeFree,
  handleDeleteRecipe,
}) => {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 className="fw-bold mb-0">Recipes Catalog Management</h5>
        <button
          className="btn btn-primary btn-sm d-flex align-items-center gap-1"
          onClick={() => setShowRecipeModal(true)}
        >
          + Add Recipe
        </button>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Format</th>
              <th>Author</th>
              <th>Access Tier</th>
              <th>Date</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((r) => (
              <tr key={r.recipeId}>
                <td className="fw-bold text-dark">{r.title}</td>
                <td>
                  <span className="badge bg-light text-dark border">{r.categoryName}</span>
                </td>
                <td>
                  <span
                    className="badge font-monospace text-uppercase"
                    style={{ backgroundColor: '#4a5568', color: '#fff' }}
                  >
                    {r.contentType || 'ARTICLE'}
                  </span>
                  {r.shareCount > 0 && (
                    <span className="small text-muted ms-2">{r.shareCount} shares</span>
                  )}
                </td>
                <td>{r.authorName}</td>
                <td>
                  <span className={`badge ${r.isFree ? 'bg-success' : 'bg-warning text-dark'}`}>
                    {r.isFree ? 'Free Access' : 'Members Only'}
                  </span>
                </td>
                <td className="small text-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="text-end">
                  <button
                    className={`btn btn-sm me-2 ${r.isFree ? 'btn-outline-warning' : 'btn-outline-success'}`}
                    title={r.isFree ? 'Set to Members Only' : 'Set to Free Access'}
                    onClick={() => handleToggleRecipeFree(r)}
                  >
                    {r.isFree ? 'Set Member-only' : 'Set Free'}
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    title="Delete Recipe"
                    onClick={() => handleDeleteRecipe(r.recipeId, r.title)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
