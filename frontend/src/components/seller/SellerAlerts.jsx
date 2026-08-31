import React from "react";

export default function SellerAlerts({ alerts }) {
  return (
    <div className="flex flex-col gap-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`glass-panel rounded-xl p-3 md:p-5 border relative overflow-hidden flex items-start space-x-3 md:space-x-4 ${
            alert.type === "error" ? "border-error-container/30" : "border-outline-variant/20"
          }`}
        >
          {alert.type === "error" && (
            <div className="absolute inset-0 bg-red-500/5 opacity-50 z-0" />
          )}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${
              alert.type === "error"
                ? "bg-error-container text-error"
                : alert.type === "success"
                  ? "bg-lime/10 text-accent"
                  : "bg-surface-variant text-accent"
            }`}
          >
            <span
              className="material-symbols text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {alert.type === "error" ? "warning" : alert.type === "success" ? "trending_up" : "local_mall"}
            </span>
          </div>
          <div className="z-10">
            <h4 className="font-label-sm text-label-sm text-text-primary">{alert.title}</h4>
            <p className="font-body-md text-sm text-text-muted mt-1">{alert.description}</p>
            {alert.time && (
              <p className="font-body-md text-xs text-text-muted mt-1">{alert.time}</p>
            )}
            {alert.action && (
              <button
                type="button"
                className={`mt-3 font-label-sm text-label-sm transition-colors ${
                  alert.type === "error"
                    ? "text-accent hover:underline"
                    : "text-text-muted hover:text-accent"
                }`}
              >
                {alert.action}
              </button>
            )}
            {alert.value && (
              <div className="flex items-center space-x-2 mt-2">
                <span className="font-h3 text-h3 text-text-primary">{alert.value}</span>
                <span
                  className="material-symbols text-accent"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  arrow_upward
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
