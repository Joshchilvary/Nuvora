import React from "react";

export default function TopProducts({ products }) {
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between p-4 rounded-lg hover:bg-surface-high transition-colors group cursor-pointer border border-transparent hover:border-outline-variant/20"
        >
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-md bg-surface-variant overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow relative border border-outline-variant/30">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div>
              <h4 className="font-label-sm text-label-sm text-text-primary">{product.name}</h4>
              <p className="font-body-md text-sm text-text-muted mt-1">
                SKU: {product.sku} • {product.category}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-8">
            <div className="hidden md:block text-right">
              <p className="font-label-sm text-label-sm text-text-primary">
                {product.sales} {product.salesLabel}
              </p>
              <p className="font-body-md text-sm text-text-muted mt-1">This week</p>
            </div>
            <div className="text-right">
              <p className="font-label-sm text-label-sm text-text-primary">{product.price}</p>
              <span
                className={`inline-flex items-center px-2 py-1 rounded font-label-sm text-xs mt-1 border ${
                  product.status === "Active"
                    ? "bg-surface-variant text-text-primary border-outline-variant/30"
                    : "bg-error-container/20 text-error border-error-container/30"
                }`}
              >
                <span
                  className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                    product.status === "Active" ? "bg-accent" : "bg-error"
                  }`}
                />
                {product.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
