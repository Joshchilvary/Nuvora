import React from "react";
import RevenueChart from "../components/seller/RevenueChart.jsx";
import SellerAlerts from "../components/seller/SellerAlerts.jsx";
import TopProducts from "../components/seller/TopProducts.jsx";
import SellerStats from "../components/seller/SellerStats.jsx";
import {
  SELLER_STATS,
  REVENUE_DATA,
  ALERTS,
  TOP_PRODUCTS,
} from "../data/seller.js";

export default function SellerIntelligence() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Revenue Chart */}
        <div className="col-span-1 md:col-span-8 glass-panel rounded-xl p-4 md:p-6 flex flex-col relative overflow-hidden ai-glow group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4 md:mb-8">
            <div>
              <h3 className="font-h4 text-h4 text-text-primary">Revenue</h3>
              <div className="flex items-baseline mt-2 space-x-3">
                <span className="font-display text-h1-mobile md:text-h1 text-text-primary">
                  {SELLER_STATS.revenue}
                </span>
                <span className="font-label-sm text-label-sm text-accent flex items-center bg-lime/10 px-2 py-1 rounded">
                  <span
                    className="material-symbols text-sm mr-1"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    trending_up
                  </span>
                  {SELLER_STATS.revenueChange}
                </span>
              </div>
            </div>
            <div className="glass-panel px-3 py-1.5 md:px-4 md:py-2 rounded-full flex items-center space-x-2 border border-outline-variant/20">
              <span className="font-label-sm text-label-sm text-text-muted">This Week</span>
              <span
                className="material-symbols text-text-muted text-sm"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                expand_more
              </span>
            </div>
          </div>
          <RevenueChart data={REVENUE_DATA} />
        </div>

        {/* Notifications / Alerts */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-3">
          <SellerAlerts alerts={ALERTS} />
        </div>

        {/* Stats Row */}
        <div className="col-span-1 md:col-span-12">
          <SellerStats stats={SELLER_STATS} />
        </div>

        {/* Top Products */}
        <div className="col-span-1 md:col-span-12 glass-panel rounded-xl p-4 md:p-6">
          <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-outline-variant/20 pb-4">
            <h3 className="font-h4 text-h4 text-text-primary">Top Products</h3>
            <button
              type="button"
              className="font-label-sm text-label-sm text-text-muted hover:text-accent transition-colors flex items-center"
            >
              View All
              <span
                className="material-symbols ml-1 text-sm"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                arrow_forward
              </span>
            </button>
          </div>
          <TopProducts products={TOP_PRODUCTS} />
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full px-5 md:px-16 mt-auto py-12 bg-surface-container-lowest border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center z-10 relative">
        <div className="font-display text-h3 text-accent mb-6 md:mb-0">NUVORA</div>
        <div className="flex space-x-6 mb-6 md:mb-0">
          <a
            href="#"
            className="font-body-md text-body-md text-text-muted hover:text-accent opacity-80 hover:opacity-100 transition-opacity"
          >
            Privacy
          </a>
          <a
            href="#"
            className="font-body-md text-body-md text-text-muted hover:text-accent opacity-80 hover:opacity-100 transition-opacity"
          >
            Terms
          </a>
          <a
            href="#"
            className="font-body-md text-body-md text-text-muted hover:text-accent opacity-80 hover:opacity-100 transition-opacity"
          >
            API
          </a>
          <a
            href="#"
            className="font-body-md text-body-md text-text-muted hover:text-accent opacity-80 hover:opacity-100 transition-opacity"
          >
            Careers
          </a>
        </div>
        <div className="font-body-md text-body-md text-text-muted">
          &copy; 2024 NUVORA. Dimensional Discovery.
        </div>
      </footer>
    </div>
  );
}
