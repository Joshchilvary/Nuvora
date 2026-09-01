import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  PAYOUT_DATA,
  PAYOUT_STATUSES,
  TRANSACTION_TYPES,
} from "../data/sellerPayouts.js";
import Button from "../components/ui/Button.jsx";

function formatCurrency(amount) {
  return `$${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function PayoutStatusBadge({ status }) {
  const cfg = PAYOUT_STATUSES[status] ?? PAYOUT_STATUSES.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.className}`}
    >
      <span
        className="material-symbols text-xs"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {cfg.icon}
      </span>
      {cfg.label}
    </span>
  );
}

function TransactionTypeBadge({ type }) {
  const cfg = TRANSACTION_TYPES[type] ?? TRANSACTION_TYPES.sale;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.className}`}
    >
      <span
        className="material-symbols text-xs"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {cfg.icon}
      </span>
      {cfg.label}
    </span>
  );
}

function BalanceCard({ label, value, icon, highlight }) {
  return (
    <div
      className={`rounded-xl border p-5 shadow-lg ${
        highlight
          ? "border-lime/30 bg-lime/5"
          : "border-outline-variant/20 bg-surface-container"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="material-symbols text-sm text-text-muted"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          {icon}
        </span>
        <p className="font-label-sm text-label-sm text-text-muted">{label}</p>
      </div>
      <p className={`font-h3 text-h3 ${highlight ? "text-accent" : "text-text-primary"}`}>
        {value}
      </p>
    </div>
  );
}

function PayoutRow({ payout }) {
  return (
    <tr className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
      <td className="py-4">
        <span className="font-body-md text-body-md text-text-muted">
          {formatDate(payout.date)}
        </span>
      </td>
      <td className="py-4">
        <span className="font-label-sm text-label-sm text-text-primary">
          {payout.reference}
        </span>
      </td>
      <td className="py-4">
        <span className="font-body-md text-body-md text-text-primary font-semibold">
          {formatCurrency(payout.amount)}
        </span>
      </td>
      <td className="py-4 hidden md:table-cell">
        <span className="font-body-md text-body-md text-text-muted">{payout.method}</span>
      </td>
      <td className="py-4">
        <PayoutStatusBadge status={payout.status} />
      </td>
    </tr>
  );
}

function PayoutCard({ payout }) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-4 shadow-lg">
      <div className="flex justify-between items-start mb-2">
        <span className="font-label-sm text-label-sm text-text-primary">
          {payout.reference}
        </span>
        <PayoutStatusBadge status={payout.status} />
      </div>
      <p className="font-h4 text-h4 text-text-primary mb-1">
        {formatCurrency(payout.amount)}
      </p>
      <div className="flex justify-between items-center">
        <span className="text-xs text-text-muted">{formatDate(payout.date)}</span>
        <span className="text-xs text-text-muted">{payout.method}</span>
      </div>
    </div>
  );
}

function TransactionRow({ txn }) {
  const isNegative = txn.amount < 0;
  return (
    <tr className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
      <td className="py-4">
        <span className="font-body-md text-body-md text-text-muted">
          {formatDate(txn.date)}
        </span>
      </td>
      <td className="py-4">
        <div className="flex items-center gap-2">
          <TransactionTypeBadge type={txn.type} />
          <span className="font-body-md text-body-md text-text-primary hidden sm:inline">
            {txn.description}
          </span>
          <span className="font-body-md text-body-md text-text-primary sm:hidden">
            {txn.description.length > 25
              ? txn.description.slice(0, 25) + "…"
              : txn.description}
          </span>
        </div>
      </td>
      <td className="py-4">
        <span
          className={`font-body-md text-body-md font-semibold ${
            isNegative ? "text-red-400" : "text-accent"
          }`}
        >
          {isNegative ? "-" : "+"}
          {formatCurrency(txn.amount)}
        </span>
      </td>
      <td className="py-4 hidden lg:table-cell">
        <PayoutStatusBadge status={txn.status} />
      </td>
    </tr>
  );
}

function TransactionCard({ txn }) {
  const isNegative = txn.amount < 0;
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-4 shadow-lg">
      <div className="flex justify-between items-start mb-2">
        <TransactionTypeBadge type={txn.type} />
        <span
          className={`font-label-sm text-label-sm font-semibold ${
            isNegative ? "text-red-400" : "text-accent"
          }`}
        >
          {isNegative ? "-" : "+"}
          {formatCurrency(txn.amount)}
        </span>
      </div>
      <p className="font-body-md text-body-md text-text-primary mb-1">{txn.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-xs text-text-muted">{formatDate(txn.date)}</span>
        <PayoutStatusBadge status={txn.status} />
      </div>
    </div>
  );
}

function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-obsidian/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-xl border border-outline-variant/20 bg-surface-container p-6 shadow-2xl">
        <h3 className="font-h4 text-h4 text-text-primary mb-2">{title}</h3>
        {message ? <p className="font-body-md text-body-md text-text-muted mb-4">{message}</p> : null}
        {children}
        <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
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

export default function SellerPayouts() {
  const [data, setData] = useState(PAYOUT_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const filteredTransactions = useMemo(() => {
    let result = [...data.transactions];
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      result = result.filter(
        (txn) =>
          txn.description.toLowerCase().includes(query) ||
          txn.id.toLowerCase().includes(query)
      );
    }
    if (typeFilter !== "all") {
      result = result.filter((txn) => txn.type === typeFilter);
    }
    return result;
  }, [data.transactions, searchQuery, typeFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
  };

  const handleRequestPayout = () => {
    const amount = data.summary.availableBalance;
    if (amount <= 0) return;
    const newPayout = {
      id: `PAY-${10483 + data.payouts.length}`,
      date: new Date().toISOString().split("T")[0],
      reference: `PAY-${10483 + data.payouts.length}`,
      amount,
      method: data.payoutMethod.type,
      status: "pending",
    };
    const newTxn = {
      id: `TXN-${9042 + data.transactions.length}`,
      date: new Date().toISOString().split("T")[0],
      description: `Payout ${newPayout.reference}`,
      amount: -amount,
      type: "payout",
      status: "pending",
    };
    setData((prev) => ({
      ...prev,
      summary: {
        ...prev.summary,
        availableBalance: 0,
        pendingBalance: prev.pendingBalance + amount,
      },
      payouts: [newPayout, ...prev.payouts],
      transactions: [newTxn, ...prev.transactions],
    }));
    setShowPayoutModal(false);
    setPayoutSuccess(true);
    setTimeout(() => setPayoutSuccess(false), 5000);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Link
            to="/seller"
            className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors mb-4"
          >
            <span
              className="material-symbols text-sm"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              arrow_back
            </span>
            <span className="font-label-sm text-label-sm">Back to Dashboard</span>
          </Link>
          <h1 className="font-display text-h2 text-text-primary">Payouts</h1>
          <p className="font-body-md text-body-md text-text-muted mt-1">
            Track your earnings and manage how you receive payments from NUVORA.
          </p>
        </div>
      </div>

      {/* Success Message */}
      {payoutSuccess ? (
        <div className="mb-6 rounded-lg border border-lime/30 bg-lime/5 p-4 flex items-start gap-3">
          <span
            className="material-symbols text-accent mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <div>
            <p className="font-label-sm text-label-sm text-text-primary">Payout request submitted</p>
            <p className="text-sm text-text-muted mt-0.5">
              This is a demo transaction and no real payment has been processed.
            </p>
          </div>
        </div>
      ) : null}

      {/* Balance Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <BalanceCard
          label="Available Balance"
          value={formatCurrency(data.summary.availableBalance)}
          icon="account_balance_wallet"
          highlight
        />
        <BalanceCard
          label="Pending Balance"
          value={formatCurrency(data.summary.pendingBalance)}
          icon="hourglass_empty"
        />
        <BalanceCard
          label="Total Earnings"
          value={formatCurrency(data.summary.totalEarnings)}
          icon="trending_up"
        />
        <BalanceCard
          label="Next Payout"
          value={formatCurrency(data.summary.nextPayout)}
          icon="schedule"
        />
      </div>

      {/* Payout Method + Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="glass-panel rounded-xl p-6 shadow-lg">
          <h2 className="font-h4 text-h4 text-text-primary mb-4">Payout Method</h2>
          <div className="space-y-3">
            <div>
              <p className="font-label-sm text-label-sm text-text-muted">Method</p>
              <p className="font-body-md text-body-md text-text-primary">{data.payoutMethod.type}</p>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-text-muted">Account</p>
              <p className="font-body-md text-body-md text-text-primary">
                {data.payoutMethod.accountName}
              </p>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-text-muted">Account Number</p>
              <p className="font-body-md text-body-md text-text-primary font-mono">
                {data.payoutMethod.accountNumber}
              </p>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-text-muted">Bank</p>
              <p className="font-body-md text-body-md text-text-primary">
                {data.payoutMethod.bankName}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/seller/settings"
              className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-semibold"
            >
              Manage Payout Method
              <span
                className="material-symbols text-[14px]"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
        <div className="glass-panel rounded-xl p-6 shadow-lg">
          <h2 className="font-h4 text-h4 text-text-primary mb-4">Payout Schedule</h2>
          <div className="space-y-3">
            <div>
              <p className="font-label-sm text-label-sm text-text-muted">Next Payout</p>
              <p className="font-body-md text-body-md text-text-primary">
                {formatDate(data.schedule.nextPayoutDate)}
              </p>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-text-muted">Frequency</p>
              <p className="font-body-md text-body-md text-text-primary">
                {data.schedule.frequency}
              </p>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-text-muted">Minimum Threshold</p>
              <p className="font-body-md text-body-md text-text-primary">
                {formatCurrency(data.schedule.minimumThreshold)}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <Button
              type="button"
              className="w-full"
              onClick={() => setShowPayoutModal(true)}
              disabled={data.summary.availableBalance <= 0}
            >
              <span
                className="material-symbols text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                payments
              </span>
              Request Payout
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="glass-panel rounded-xl p-6 shadow-lg mb-6">
        <div className="flex justify-between items-center mb-4 border-b border-outline-variant/20 pb-4">
          <h2 className="font-h4 text-h4 text-text-primary">Recent Payouts</h2>
        </div>
        {data.payouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <span
              className="material-symbols text-4xl text-text-muted mb-3"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              account_balance_wallet
            </span>
            <p className="font-body-md text-body-md text-text-muted">No payouts yet</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    <th className="text-left py-3 font-label-sm text-label-sm text-text-muted">Date</th>
                    <th className="text-left py-3 font-label-sm text-label-sm text-text-muted">Reference</th>
                    <th className="text-left py-3 font-label-sm text-label-sm text-text-muted">Amount</th>
                    <th className="text-left py-3 font-label-sm text-label-sm text-text-muted hidden md:table-cell">Method</th>
                    <th className="text-left py-3 font-label-sm text-label-sm text-text-muted">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payouts.map((payout) => (
                    <PayoutRow key={payout.id} payout={payout} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden space-y-4">
              {data.payouts.map((payout) => (
                <PayoutCard key={payout.id} payout={payout} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Transaction History */}
      <div className="glass-panel rounded-xl p-6 shadow-lg mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 border-b border-outline-variant/20 pb-4">
          <h2 className="font-h4 text-h4 text-text-primary">Transaction History</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <span
              className="material-symbols text-text-muted absolute left-3 top-1/2 -translate-y-1/2"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              search
            </span>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-outline-variant/30 bg-surface-container px-10 py-2.5 font-body-md text-body-md text-text-primary placeholder-text-muted/60 focus:border-lime focus:outline-none"
              aria-label="Search transactions"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", label: "All" },
              ...Object.entries(TRANSACTION_TYPES).map(([id, cfg]) => ({ id, label: cfg.label })),
            ].map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setTypeFilter(filter.id)}
                className={`px-3 py-2 rounded-lg font-label-sm text-label-sm transition-all ${
                  typeFilter === filter.id
                    ? "bg-lime text-obsidian"
                    : "bg-surface-high text-text-muted hover:text-text-primary"
                }`}
                aria-pressed={typeFilter === filter.id}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <span
              className="material-symbols text-5xl text-text-muted mb-4"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              search_off
            </span>
            <h3 className="font-display text-h3 text-text-primary mb-2">No transactions found</h3>
            <p className="font-body-md text-body-md text-text-muted mb-4 max-w-md">
              Try adjusting your search or filter criteria.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="font-label-sm text-label-sm text-accent hover:underline transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    <th className="text-left py-3 font-label-sm text-label-sm text-text-muted">Date</th>
                    <th className="text-left py-3 font-label-sm text-label-sm text-text-muted">Description</th>
                    <th className="text-left py-3 font-label-sm text-label-sm text-text-muted">Amount</th>
                    <th className="text-left py-3 font-label-sm text-label-sm text-text-muted hidden lg:table-cell">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((txn) => (
                    <TransactionRow key={txn.id} txn={txn} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden space-y-4">
              {filteredTransactions.map((txn) => (
                <TransactionCard key={txn.id} txn={txn} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Request Payout Modal */}
      <ConfirmModal
        open={showPayoutModal}
        title="Request Payout"
        onConfirm={handleRequestPayout}
        onCancel={() => setShowPayoutModal(false)}
        confirmLabel="Confirm Payout"
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-label-sm text-label-sm text-text-muted">Available Balance</span>
              <span className="font-h4 text-h4 text-accent">
                {formatCurrency(data.summary.availableBalance)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-label-sm text-label-sm text-text-muted">Payout Method</span>
              <span className="font-body-md text-body-md text-text-primary">
                {data.payoutMethod.type}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-label-sm text-label-sm text-text-muted">Account</span>
              <span className="font-body-md text-body-md text-text-primary font-mono">
                {data.payoutMethod.accountNumber}
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-3 flex items-start gap-2">
            <span
              className="material-symbols text-amber-400 text-sm mt-0.5"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              info
            </span>
            <p className="text-xs text-text-muted">
              This is a demo. No real payment will be processed.
            </p>
          </div>
        </div>
      </ConfirmModal>
    </div>
  );
}
