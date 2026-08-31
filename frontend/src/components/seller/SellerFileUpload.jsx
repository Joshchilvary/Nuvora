import React, { useCallback } from "react";

export default function SellerFileUpload({ label, accept, onFileChange, file }) {
  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      const selected = event.dataTransfer.files[0];
      if (selected) onFileChange(selected);
    },
    [onFileChange]
  );

  const handleChange = (event) => {
    const selected = event.target.files[0];
    if (selected) onFileChange(selected);
  };

  const handleRemove = () => {
    onFileChange(null);
  };

  return (
    <div className="space-y-2">
      <label className="block font-label-sm text-label-sm text-text-primary">{label}</label>
      <div
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        className="mt-2 flex justify-center rounded-lg border border-dashed border-outline-variant/40 px-6 py-10 hover:border-lime transition-colors bg-surface-container-low cursor-pointer group"
      >
        <div className="text-center">
          <span
            className="material-symbols text-4xl text-text-muted group-hover:text-lime transition-colors"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            cloud_upload
          </span>
          <div className="mt-4 flex text-sm leading-6 text-text-muted justify-center">
            <label className="relative cursor-pointer rounded-md font-semibold text-accent hover:text-accent/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-lime focus-within:ring-offset-2 focus-within:ring-offset-background">
              <span>Upload a file</span>
              <input className="sr-only" type="file" accept={accept} onChange={handleChange} />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs leading-5 text-text-muted mt-2">PDF, PNG, JPG up to 10MB</p>
          {file && (
            <div className="mt-4 flex items-center justify-center gap-3 rounded-lg border border-outline-variant/30 bg-surface px-4 py-2">
              <span className="font-label-sm text-label-sm text-text-primary truncate max-w-[200px]">{file.name}</span>
              <button
                type="button"
                onClick={handleRemove}
                className="text-text-muted hover:text-red-400 transition-colors"
              >
                <span
                  className="material-symbols text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  close
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
