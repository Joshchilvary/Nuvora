import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CUSTOMER_ACCOUNT } from "../data/customerSettings.js";
import Button from "../components/ui/Button.jsx";
import {
  REVIEWS_PRODUCTS,
  INITIAL_REVIEWS,
  REVIEW_FILTERS,
} from "../data/customerReviews.js";

function Section({ title, description, children, className = "" }) {
  return (
    <section
      className={`glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden ${className}`}
    >
      <div
        className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
        aria-hidden="true"
      />
      <div className="mb-6 relative z-10">
        <h2 className="font-h3 text-h3 text-text-primary">{title}</h2>
        {description ? (
          <p className="font-body-md text-body-md text-text-muted mt-1">{description}</p>
        ) : null}
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
}

function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-obsidian/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-xl border border-outline-variant/20 bg-surface-container p-6 shadow-2xl">
        <h3 className="font-h4 text-h4 text-text-primary mb-2">{title}</h3>
        <p className="font-body-md text-body-md text-text-muted mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StarRating({ rating, setRating, readonly = false }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = hover || rating;
        const filled = star <= active;
        return (
          <button
            key={star}
            type="button"
            aria-checked={filled}
            disabled={readonly}
            onClick={() => !readonly && setRating(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            className={`transition-all duration-200 ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            } ${filled ? "text-lime" : "text-outline-variant"}`}
          >
            <span
              className="material-symbols text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ReviewModal({ open, product, existingReview, onSave, onCancel }) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [content, setContent] = useState(existingReview?.content || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setRating(existingReview?.rating || 0);
      setTitle(existingReview?.title || "");
      setContent(existingReview?.content || "");
      setError("");
    }
  }, [open, existingReview]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) {
      setError("Please select a star rating.");
      return;
    }
    if (!title.trim()) {
      setError("Please add a review title.");
      return;
    }
    if (!content.trim() || content.trim().length < 10) {
      setError("Review content must be at least 10 characters.");
      return;
    }
    onSave({
      ...existingReview,
      productId: product.productId,
      name: product.name,
      seller: product.seller,
      image: product.image,
      rating,
      title: title.trim(),
      content: content.trim(),
      date: existingReview?.date || new Date().toISOString().split("T")[0],
      status: "published",
      hasMedia: false,
    });
  };

  if (!open || !product) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={existingReview ? "Edit Review" : "Write Review"}
    >
      <div className="absolute inset-0 bg-obsidian/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-lg rounded-xl border border-outline-variant/20 bg-surface-container p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden border border-outline-variant/20">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div>
            <h3 className="font-h4 text-h4 text-text-primary">{product.name}</h3>
            <p className="font-body-md text-sm text-text-muted">{product.seller}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block font-label-sm text-label-sm text-text-primary">Rating</label>
            <StarRating rating={rating} setRating={setRating} />
          </div>
          <div className="space-y-2">
            <label htmlFor="review-title" className="block font-label-sm text-label-sm text-text-primary">
              Title
            </label>
            <input
              id="review-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="block w-full rounded-lg bg-surface-container-high border border-outline-variant/30 px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="review-content" className="block font-label-sm text-label-sm text-text-primary">
              Review
            </label>
            <textarea
              id="review-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What did you like or dislike?"
              rows={4}
              className="block w-full rounded-lg bg-surface-container-high border border-outline-variant/30 px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-label-sm text-label-sm text-text-primary">Photos</label>
            <div className="flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant/30 px-4 py-2 text-sm text-text-muted transition-colors hover:bg-surface-high hover:text-text-primary">
                <span className="material-symbols text-lg" style={{ fontVariationSettings: "'FILL' 0" }}>
                  photo_camera
                </span>
                <span>Add Photo</span>
                <input type="file" accept="image/*" className="hidden" />
              </label>
              <span className="text-xs text-text-muted">Mock upload only</span>
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {existingReview ? "Save Changes" : "Submit Review"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CustomerReviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [products, setProducts] = useState(REVIEWS_PRODUCTS);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const awaitingProducts = products.filter((p) => p.status === "awaiting");
  const reviewedProductIds = new Set(reviews.map((r) => r.productId));

  const filteredReviews = reviews.filter((review) => {
    if (filter === "awaiting") return false;
    if (filter === "published") return review.status === "published";
    if (filter === "recent") {
      const reviewDate = new Date(review.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return reviewDate >= weekAgo;
    }
    return true;
  }).filter((review) => {
    if (!search.trim()) return true;
    const term = search.trim().toLowerCase();
    return (
      review.name.toLowerCase().includes(term) ||
      review.title.toLowerCase().includes(term) ||
      review.content.toLowerCase().includes(term)
    );
  });

  const handleWriteReview = (product) => {
    setSelectedProduct(product);
    setEditingReview(null);
    setReviewModalOpen(true);
  };

  const handleEditReview = (review) => {
    setSelectedProduct({
      productId: review.productId,
      name: review.name,
      seller: review.seller,
      image: review.image,
    });
    setEditingReview(review);
    setReviewModalOpen(true);
  };

  const handleSaveReview = (reviewData) => {
    if (editingReview) {
      setReviews((prev) =>
        prev.map((r) => (r.id === editingReview.id ? { ...r, ...reviewData } : r))
      );
      showToast("Review updated successfully.");
    } else {
      setReviews((prev) => [...prev, { ...reviewData, id: `review-${Date.now()}` }]);
      setProducts((prev) =>
        prev.map((p) =>
          p.productId === reviewData.productId ? { ...p, status: "reviewed" } : p
        )
      );
      showToast("Review submitted successfully.");
    }
    setReviewModalOpen(false);
    setEditingReview(null);
  };

  const handleDeleteReview = () => {
    if (deleteConfirm) {
      const productId = deleteConfirm.productId;
      setReviews((prev) => prev.filter((r) => r.id !== deleteConfirm.id));
      setProducts((prev) =>
        prev.map((p) =>
          p.productId === productId && p.status === "reviewed"
            ? { ...p, status: "awaiting" }
            : p
        )
      );
      setDeleteConfirm(null);
      showToast("Review deleted.");
    }
  };

  const stats = {
    written: reviews.length,
    productsReviewed: new Set(reviews.map((r) => r.productId)).size,
    awaiting: awaitingProducts.length,
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Toast */}
      {toast && (
        <div className="mb-6 rounded-lg border border-lime/30 bg-lime/5 p-4 flex items-center gap-3 animate-fade-rise">
          <span className="material-symbols text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <p className="text-sm text-text-primary">{toast}</p>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <Link
          to="/customer"
          className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors mb-4"
        >
          <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>
            arrow_back
          </span>
          <span className="font-label-sm text-label-sm">Back to Dashboard</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-h2 text-text-primary">My Reviews</h1>
            <p className="font-body-md text-body-md text-text-muted mt-1">
              Share your experience and help other shoppers discover better products.
            </p>
          </div>
          <Link to="/marketplace">
            <Button type="button" variant="outline" size="sm">
              <span
                className="material-symbols text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                storefront
              </span>
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-5 shadow-lg">
          <p className="font-label-sm text-label-sm text-text-muted mb-1">Reviews Written</p>
          <p className="font-h3 text-h3 text-text-primary">{stats.written}</p>
        </div>
        <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-5 shadow-lg">
          <p className="font-label-sm text-label-sm text-text-muted mb-1">Products Reviewed</p>
          <p className="font-h3 text-h3 text-text-primary">{stats.productsReviewed}</p>
        </div>
        <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-5 shadow-lg">
          <p className="font-label-sm text-label-sm text-text-muted mb-1">Awaiting Review</p>
          <p className="font-h3 text-h3 text-text-primary">{stats.awaiting}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex flex-wrap gap-2">
          {REVIEW_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-lg px-4 py-2 font-label-sm text-label-sm transition-all ${
                filter === f.id
                  ? "bg-lime text-obsidian"
                  : "border border-outline-variant/30 text-text-muted hover:text-text-primary hover:bg-surface-high"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="sm:ml-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews..."
            className="block w-full sm:w-64 rounded-lg border border-outline-variant/30 bg-surface-container-high px-4 py-2.5 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime"
          />
        </div>
      </div>

      <div className="space-y-6">
        {/* Awaiting Reviews */}
        {(filter === "all" || filter === "awaiting") && (
          <Section title="Products You Can Review" description="Share feedback on your recent purchases.">
            {awaitingProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant/20 bg-surface-container py-12 text-center">
                <span className="material-symbols text-4xl text-text-muted mb-3">rate_review</span>
                <p className="font-body-md text-body-md text-text-muted mb-4">
                  No products awaiting review right now.
                </p>
                <Link to="/marketplace">
                  <Button type="button" size="sm">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {awaitingProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-xl border border-outline-variant/20 bg-surface-container p-5 shadow-lg transition-all hover:border-outline-variant/40"
                  >
                    <Link to={`/product/${product.productId}`} className="block mb-4">
                      <div className="h-40 w-full overflow-hidden rounded-lg bg-surface-high mb-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <h4 className="font-label-sm text-label-sm text-text-primary truncate">
                        {product.name}
                      </h4>
                      <p className="font-body-md text-xs text-text-muted mt-1">
                        {product.seller}
                      </p>
                    </Link>
                    <div className="flex items-center justify-between text-xs text-text-muted mb-4">
                      <span>Order #{product.orderReference}</span>
                      <span>
                        {new Date(product.purchaseDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => handleWriteReview(product)}
                    >
                      <span
                        className="material-symbols text-sm"
                        style={{ fontVariationSettings: "'FILL' 0" }}
                      >
                        edit
                      </span>
                      Write Review
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* Reviews Written */}
        {(filter === "all" || filter !== "awaiting") && (
          <Section title="Your Reviews" description="Manage and update your published reviews.">
            {filteredReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant/20 bg-surface-container py-12 text-center">
                <span className="material-symbols text-4xl text-text-muted mb-3">reviews</span>
                <p className="font-body-md text-body-md text-text-muted mb-4">
                  {reviews.length === 0
                    ? "You have not written any reviews yet."
                    : "No reviews match your current filter."}
                </p>
                {reviews.length === 0 && (
                  <Link to="/marketplace">
                    <Button type="button" size="sm">
                      Continue Shopping
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-outline-variant/20 bg-surface-container p-5 shadow-lg transition-all hover:border-outline-variant/40"
                  >
                    <div className="flex items-start gap-4">
                      <Link to={`/product/${review.productId}`} className="shrink-0">
                        <div className="h-16 w-16 overflow-hidden rounded-lg border border-outline-variant/20">
                          <img
                            src={review.image}
                            alt={review.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link to={`/product/${review.productId}`}>
                              <h4 className="font-label-sm text-label-sm text-text-primary hover:text-accent transition-colors">
                                {review.name}
                              </h4>
                            </Link>
                            <p className="font-body-md text-xs text-text-muted">{review.seller}</p>
                            <div className="mt-1">
                              <StarRating rating={review.rating} readonly />
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                              review.status === "published"
                                ? "border-lime/30 bg-lime/10 text-accent"
                                : "border-outline-variant/30 bg-surface-high text-text-muted"
                            }`}
                          >
                            {review.status === "published" ? "Published" : review.status}
                          </span>
                        </div>
                        <div className="mt-3">
                          <p className="font-label-sm text-label-sm text-text-primary">{review.title}</p>
                          <p className="font-body-md text-sm text-text-muted mt-1 line-clamp-2">
                            {review.content}
                          </p>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-xs text-text-muted">
                            {new Date(review.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                            {review.hasMedia && (
                              <span className="ml-2 inline-flex items-center gap-1 text-accent">
                                <span className="material-symbols text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  photo
                                </span>
                                Media
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditReview(review)}
                              className="font-label-sm text-label-sm text-text-muted hover:text-accent transition-colors"
                            >
                              Edit Review
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(review)}
                              className="font-label-sm text-label-sm text-text-muted hover:text-red-400 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        open={reviewModalOpen}
        product={selectedProduct}
        existingReview={editingReview}
        onSave={handleSaveReview}
        onCancel={() => {
          setReviewModalOpen(false);
          setEditingReview(null);
          setSelectedProduct(null);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteConfirm}
        title="Delete Review?"
        message={`Are you sure you want to delete this review for ${deleteConfirm?.name || ""}? This action cannot be undone.`}
        confirmLabel="Delete Review"
        onConfirm={handleDeleteReview}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
