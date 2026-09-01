import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CATEGORIES, PRODUCTS } from "../data/products.js";
import { getInventoryItem } from "../services/inventory.js";
import { suggestSku } from "../services/sellerProducts.js";
import Button from "../components/ui/Button.jsx";

const FILTERED_CATEGORIES = CATEGORIES.filter((c) => c !== "All Products");

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Product name is required";
  else if (form.name.trim().length < 3)
    errors.name = "Product name must be at least 3 characters";
  if (!form.description.trim())
    errors.description = "Description is required";
  else if (form.description.trim().length < 10)
    errors.description = "Description must be at least 10 characters";
  if (!form.category) errors.category = "Category is required";

  const price = parseFloat(form.price);
  if (form.price === "" || Number.isNaN(price))
    errors.price = "Price is required";
  else if (price <= 0) errors.price = "Price must be greater than zero";

  if (form.oldPrice !== "" && form.oldPrice !== null) {
    const old = parseFloat(form.oldPrice);
    if (Number.isNaN(old) || old <= 0)
      errors.oldPrice = "Compare-at price must be greater than zero";
    else if (!Number.isNaN(price) && old <= price)
      errors.oldPrice = "Compare-at price should be greater than price";
  }

  if (form.stock === "" || form.stock === null)
    errors.stock = "Stock quantity is required";
  else {
    const stock = parseInt(form.stock, 10);
    if (Number.isNaN(stock) || stock < 0)
      errors.stock = "Stock must be zero or a positive number";
  }

  if (form.sku && !/^[A-Za-z0-9-]{0,32}$/.test(form.sku))
    errors.sku = "SKU may only contain letters, numbers, and dashes";

  return errors;
}

function Field({ label, htmlFor, required, error, children, hint }) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block font-label-sm text-label-sm text-text-primary"
      >
        {label}
        {required ? <span className="text-red-400 ml-1">*</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-xs text-text-muted">{hint}</p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function inputClass(hasError) {
  return `block w-full rounded-lg bg-surface-container-high border px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime ${
    hasError ? "border-red-400" : "border-outline-variant/30"
  }`;
}

function Section({ title, description, children }) {
  return (
    <section className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
      <div
        className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
        aria-hidden="true"
      />
      <div className="mb-6 relative z-10">
        <h2 className="font-h3 text-h3 text-text-primary">{title}</h2>
        {description ? (
          <p className="font-body-md text-body-md text-text-muted mt-1">
            {description}
          </p>
        ) : null}
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
}

function ImagePreview({ src, alt, onRemove, isPrimary, onSetPrimary }) {
  return (
    <div className="group relative aspect-square rounded-lg overflow-hidden border border-outline-variant/30 bg-surface">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {isPrimary ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-lime/90 px-2 py-0.5 text-[10px] font-bold text-obsidian">
            <span
              className="material-symbols text-[12px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            Primary
          </span>
        ) : (
          <button
            type="button"
            onClick={onSetPrimary}
            className="rounded-full bg-obsidian/70 px-2 py-0.5 text-[10px] font-semibold text-text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-obsidian"
          >
            Make Primary
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${alt}`}
        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-obsidian/70 text-text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
      >
        <span
          className="material-symbols text-[18px]"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          close
        </span>
      </button>
    </div>
  );
}

function ImageDropzone({ onFiles }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length) onFiles(files);
  };

  const handleChange = (e) => {
    const files = Array.from(e.target.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length) {
      onFiles(files);
      e.target.value = "";
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Upload product images"
      className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors cursor-pointer ${
        isDragging
          ? "border-lime bg-lime/5"
          : "border-outline-variant/40 bg-surface-container-low hover:border-lime"
      }`}
    >
      <span
        className="material-symbols text-4xl text-text-muted"
        style={{ fontVariationSettings: "'FILL' 0" }}
      >
        cloud_upload
      </span>
      <p className="mt-4 text-sm text-text-muted text-center">
        <span className="font-semibold text-accent">Click to upload</span> or
        drag and drop
      </p>
      <p className="text-xs text-text-muted mt-1">
        PNG, JPG, WEBP up to 5MB each
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="sr-only"
        aria-label="Upload product images"
      />
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    published: { label: "Published", className: "bg-lime/10 text-accent border-lime/30" },
    draft: { label: "Draft", className: "bg-amber-400/10 text-amber-400 border-amber-400/30" },
    "out-of-stock": { label: "Out of Stock", className: "bg-red-400/10 text-red-400 border-red-400/30" },
  };
  const cfg = config[status] ?? config.published;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

export default function SellerEditProduct() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [product, setProduct] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    oldPrice: "",
    sku: "",
    stock: "",
  });
  const [images, setImages] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [specifications, setSpecifications] = useState([]);
  const [status, setStatus] = useState("published");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      const item = await getInventoryItem(productId);
      if (!active) return;
      if (!item) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const fullProduct = PRODUCTS.find((p) => p.id === productId);
      const merged = {
        ...item,
        oldPrice: fullProduct?.oldPrice ?? null,
        images: fullProduct?.images ?? (fullProduct?.image ? [fullProduct.image] : []),
        specs: fullProduct?.specs ?? [],
      };
      setProduct(merged);
      setForm({
        name: merged.name ?? "",
        description: merged.description ?? "",
        category: merged.category ?? "",
        price: String(merged.price ?? ""),
        oldPrice: merged.oldPrice != null ? String(merged.oldPrice) : "",
        sku: merged.sku ?? "",
        stock: String(merged.stock ?? ""),
      });
      setImages((merged.images ?? []).map((src, i) => ({
        id: `existing-${i}`,
        name: `Image ${i + 1}`,
        dataUrl: src,
        isExisting: true,
      })));
      setSpecifications((merged.specs ?? []).map((s, i) => ({
        id: `existing-${i}`,
        label: s.label,
        value: s.value,
      })));
      setStatus(merged.status === "out-of-stock" ? "out-of-stock" : merged.status === "draft" ? "draft" : "published");
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [productId]);

  const update = (field, value) => {
    setDirty(true);
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors(validate({ ...form, [field]: value }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(form));
  };

  const handleFiles = (files) => {
    const remaining = Math.max(0, 6 - images.length);
    const accepted = files.slice(0, remaining);
    Promise.all(
      accepted.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) =>
              resolve({ id: `${Date.now()}-${Math.random()}`, name: file.name, dataUrl: e.target.result });
            reader.readAsDataURL(file);
          })
      )
    ).then((newImages) => {
      setDirty(true);
      setImages((prev) => [...prev, ...newImages]);
    });
  };

  const removeImage = (id) => {
    setDirty(true);
    setImages((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      const next = prev.filter((i) => i.id !== id);
      if (idx === primaryImageIndex) {
        setPrimaryImageIndex(0);
      } else if (idx < primaryImageIndex) {
        setPrimaryImageIndex((p) => Math.max(0, p - 1));
      }
      return next;
    });
  };

  const addSpecification = () => {
    setDirty(true);
    setSpecifications((prev) => [...prev, { id: Date.now(), label: "", value: "" }]);
  };

  const updateSpecification = (id, field, value) => {
    setDirty(true);
    setSpecifications((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const removeSpecification = (id) => {
    setDirty(true);
    setSpecifications((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSuggestSku = () => {
    const sku = suggestSku(form.name, form.category);
    update("sku", sku);
  };

  const buildPayload = () => {
    const cleanSpecs = specifications
      .filter((s) => s.label.trim() && s.value.trim())
      .map((s) => ({ label: s.label.trim(), value: s.value.trim() }));
    return {
      productId,
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null,
      stock: parseInt(form.stock, 10),
      sku: form.sku.trim() || suggestSku(form.name, form.category),
      images: images.map((i) => i.dataUrl),
      primaryImage: images[primaryImageIndex]?.dataUrl ?? null,
      specifications: cleanSpecs,
      status,
      updatedAt: new Date().toISOString().split("T")[0],
    };
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const allErrors = validate(form);
    setErrors(allErrors);
    setTouched({
      name: true,
      description: true,
      category: true,
      price: true,
      oldPrice: true,
      stock: true,
      sku: true,
    });
    if (Object.keys(allErrors).length > 0) {
      const firstErrorField = document.querySelector("[data-error='true']");
      firstErrorField?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildPayload();
      setSuccess({
        title: "Changes saved",
        message: "Your product has been updated locally. Backend persistence is not yet connected.",
        payload,
      });
      setDirty(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAttemptLeave = useCallback(
    (e) => {
      if (dirty && !success) {
        if (!window.confirm("You have unsaved changes. Leave without saving?")) {
          e.preventDefault();
        }
      }
    },
    [dirty, success]
  );

  useEffect(() => {
    const handler = (e) => {
      if (dirty && !success) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, success]);

  const descriptionLength = form.description.length;
  const descriptionHint = `${descriptionLength} characters · aim for at least 100 characters for a strong product page`;

  const sortedImages = useMemo(() => {
    if (!images.length) return [];
    const primary = images[primaryImageIndex];
    const others = images.filter((_, i) => i !== primaryImageIndex);
    return primary ? [primary, ...others] : images;
  }, [images, primaryImageIndex]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="flex items-center justify-center py-16">
          <span
            className="material-symbols text-3xl text-text-muted animate-spin-fast"
            aria-label="Loading"
          >
            sync
          </span>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="mx-auto w-full max-w-2xl text-center py-16">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container mx-auto">
            <span
              className="material-symbols text-4xl text-text-muted"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              search_off
            </span>
          </div>
          <h1 className="font-display text-h2 text-text-primary mb-4">
            Product Not Found
          </h1>
          <p className="font-body-lg text-body-lg text-text-muted mb-8">
            The product you're trying to edit doesn't exist or may have been removed.
          </p>
          <Link to="/seller/inventory">
            <Button>Back to Inventory</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="mx-auto w-full max-w-2xl text-center py-16">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-lime/10 mx-auto border border-lime/20">
            <span
              className="material-symbols text-lime text-[32px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <h1 className="font-display text-h2 text-text-primary mb-4">
            {success.title}
          </h1>
          <p className="font-body-lg text-body-lg text-text-muted mb-8">
            {success.message}
          </p>
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container p-6 text-left mb-8">
            <h3 className="font-h4 text-h4 text-text-primary mb-3">
              Updated Summary
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Product</dt>
                <dd className="text-text-primary text-right">
                  {success.payload.name}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Category</dt>
                <dd className="text-text-primary text-right">
                  {success.payload.category}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Price</dt>
                <dd className="text-text-primary text-right">
                  ${success.payload.price.toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Stock</dt>
                <dd className="text-text-primary text-right">
                  {success.payload.stock} units
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">SKU</dt>
                <dd className="text-text-primary text-right">
                  {success.payload.sku}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Status</dt>
                <dd className="text-text-primary text-right capitalize">
                  {success.payload.status}
                </dd>
              </div>
            </dl>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate("/seller/inventory")}>
              Back to Inventory
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSuccess(null);
                setDirty(false);
              }}
            >
              Continue Editing
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Page Header */}
      <div className="mb-8">
        <Link
          to="/seller/inventory"
          onClick={handleAttemptLeave}
          className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors mb-4"
        >
          <span
            className="material-symbols text-sm"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            arrow_back
          </span>
          <span className="font-label-sm text-label-sm">Back to Inventory</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-display text-h2 text-text-primary">Edit Product</h1>
            <p className="font-body-md text-body-md text-text-muted mt-1">
              Update your product information, pricing, inventory, and media.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={status} />
            {dirty ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-400">
                <span
                  className="material-symbols text-[12px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  edit
                </span>
                Unsaved
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6" noValidate>
        {/* Basic Information */}
        <Section
          title="Basic Information"
          description="The essentials customers see first."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2" data-error={!!errors.name}>
              <Field
                label="Product Name"
                htmlFor="product-name"
                required
                error={touched.name ? errors.name : undefined}
              >
                <input
                  id="product-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  placeholder="Quantum Mesh Chair"
                  className={inputClass(touched.name && errors.name)}
                  maxLength={120}
                />
              </Field>
            </div>

            <div className="md:col-span-2" data-error={!!errors.description}>
              <Field
                label="Description"
                htmlFor="product-description"
                required
                error={touched.description ? errors.description : undefined}
                hint={!touched.description || !errors.description ? descriptionHint : undefined}
              >
                <textarea
                  id="product-description"
                  rows={5}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  onBlur={() => handleBlur("description")}
                  placeholder="Describe the product, its key features, and what makes it special."
                  className={inputClass(touched.description && errors.description)}
                />
              </Field>
            </div>

            <div className="md:col-span-2" data-error={!!errors.category}>
              <Field
                label="Category"
                htmlFor="product-category"
                required
                error={touched.category ? errors.category : undefined}
              >
                <select
                  id="product-category"
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  onBlur={() => handleBlur("category")}
                  className={inputClass(touched.category && errors.category)}
                >
                  <option value="">Select a category</option>
                  {FILTERED_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        </Section>

        {/* Pricing */}
        <Section
          title="Pricing"
          description="Set your selling price and an optional compare-at price."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div data-error={!!errors.price}>
              <Field
                label="Price (USD)"
                htmlFor="product-price"
                required
                error={touched.price ? errors.price : undefined}
                hint="The amount customers pay."
              >
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                    $
                  </span>
                  <input
                    id="product-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    onBlur={() => handleBlur("price")}
                    placeholder="0.00"
                    className={`${inputClass(touched.price && errors.price)} pl-8`}
                  />
                </div>
              </Field>
            </div>

            <div data-error={!!errors.oldPrice}>
              <Field
                label="Compare-at Price (USD)"
                htmlFor="product-old-price"
                error={touched.oldPrice ? errors.oldPrice : undefined}
                hint="Optional. Shown crossed out next to the price."
              >
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                    $
                  </span>
                  <input
                    id="product-old-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.oldPrice}
                    onChange={(e) => update("oldPrice", e.target.value)}
                    onBlur={() => handleBlur("oldPrice")}
                    placeholder="0.00"
                    className={`${inputClass(touched.oldPrice && errors.oldPrice)} pl-8`}
                  />
                </div>
              </Field>
            </div>
          </div>
        </Section>

        {/* Inventory */}
        <Section
          title="Inventory"
          description="Track stock and assign a SKU."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div data-error={!!errors.sku}>
              <Field
                label="SKU"
                htmlFor="product-sku"
                error={touched.sku ? errors.sku : undefined}
                hint="Optional. Letters, numbers, and dashes only."
              >
                <div className="flex gap-2">
                  <input
                    id="product-sku"
                    type="text"
                    value={form.sku}
                    onChange={(e) => update("sku", e.target.value)}
                    onBlur={() => handleBlur("sku")}
                    placeholder="SP-001"
                    className={`${inputClass(touched.sku && errors.sku)} flex-1`}
                    maxLength={32}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSuggestSku}
                  >
                    Suggest
                  </Button>
                </div>
              </Field>
            </div>

            <div data-error={!!errors.stock}>
              <Field
                label="Stock Quantity"
                htmlFor="product-stock"
                required
                error={touched.stock ? errors.stock : undefined}
                hint="How many units are available."
              >
                <input
                  id="product-stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(e) => update("stock", e.target.value)}
                  onBlur={() => handleBlur("stock")}
                  placeholder="0"
                  className={inputClass(touched.stock && errors.stock)}
                />
              </Field>
            </div>
          </div>
        </Section>

        {/* Media */}
        <Section
          title="Media"
          description={`Upload product images. ${images.length}/6 added. The first image is your primary listing image.`}
        >
          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
              {sortedImages.map((img, idx) => {
                const originalIndex = images.findIndex((i) => i.id === img.id);
                return (
                  <ImagePreview
                    key={img.id}
                    src={img.dataUrl}
                    alt={img.name}
                    isPrimary={originalIndex === primaryImageIndex}
                    onSetPrimary={() => {
                      setDirty(true);
                      setPrimaryImageIndex(originalIndex);
                    }}
                    onRemove={() => removeImage(img.id)}
                  />
                );
              })}
            </div>
          ) : null}
          {images.length < 6 ? <ImageDropzone onFiles={handleFiles} /> : null}
        </Section>

        {/* Product Details */}
        <Section
          title="Product Details"
          description="Add specifications customers compare when deciding to buy."
        >
          {specifications.length === 0 ? (
            <p className="text-sm text-text-muted mb-4">
              No specifications yet. Add things like weight, material, or
              dimensions.
            </p>
          ) : (
            <div className="space-y-3 mb-4">
              {specifications.map((spec) => (
                <div
                  key={spec.id}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2"
                >
                  <input
                    type="text"
                    value={spec.label}
                    onChange={(e) =>
                      updateSpecification(spec.id, "label", e.target.value)
                    }
                    placeholder="Specification (e.g. Weight)"
                    className={inputClass(false)}
                    aria-label="Specification label"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) =>
                      updateSpecification(spec.id, "value", e.target.value)
                    }
                    placeholder="Value (e.g. 265 grams)"
                    className={inputClass(false)}
                    aria-label="Specification value"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecification(spec.id)}
                    aria-label="Remove specification"
                    className="flex items-center justify-center rounded-lg border border-outline-variant/30 px-3 text-text-muted transition-colors hover:text-red-400 hover:border-red-400/40"
                  >
                    <span
                      className="material-symbols"
                      style={{ fontVariationSettings: "'FILL' 0" }}
                    >
                      delete
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={addSpecification}
          >
            <span
              className="material-symbols text-sm"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              add
            </span>
            Add Specification
          </Button>
        </Section>

        {/* Publishing */}
        <Section
          title="Publishing"
          description="Manage your product's visibility."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Field
                label="Product Status"
                htmlFor="product-status"
                hint="Control whether this product is visible to customers."
              >
                <select
                  id="product-status"
                  value={status}
                  onChange={(e) => {
                    setDirty(true);
                    setStatus(e.target.value);
                  }}
                  className={inputClass(false)}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </Field>
            </div>
            <div className="flex items-end">
              <p className="text-sm text-text-muted">
                Last updated: {product?.updatedAt ?? "—"}
              </p>
            </div>
          </div>
        </Section>

        {/* Actions */}
        <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky bottom-0 bg-surface/95 backdrop-blur">
          <p className="text-sm text-text-muted">
            {dirty ? (
              <span className="text-amber-400">You have unsaved changes.</span>
            ) : (
              "Backend persistence is not yet connected. Saving will only update your local state."
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:shrink-0">
            <Link to="/seller/inventory" onClick={handleAttemptLeave}>
              <Button type="button" variant="outline" disabled={submitting}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={submitting || !dirty}>
              <span
                className="material-symbols text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                save
              </span>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
