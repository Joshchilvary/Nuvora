export const PAYOUT_STATUSES = {
  paid: {
    label: "Paid",
    icon: "check_circle",
    className: "bg-lime/10 text-accent border-lime/30",
  },
  pending: {
    label: "Pending",
    icon: "schedule",
    className: "bg-amber-400/10 text-amber-400 border-amber-400/30",
  },
  processing: {
    label: "Processing",
    icon: "autorenew",
    className: "bg-blue-400/10 text-blue-400 border-blue-400/30",
  },
  failed: {
    label: "Failed",
    icon: "cancel",
    className: "bg-red-400/10 text-red-400 border-red-400/30",
  },
};

export const TRANSACTION_TYPES = {
  sale: {
    label: "Sale",
    icon: "sell",
    className: "bg-lime/10 text-accent border-lime/30",
  },
  payout: {
    label: "Payout",
    icon: "account_balance_wallet",
    className: "bg-blue-400/10 text-blue-400 border-blue-400/30",
  },
  refund: {
    label: "Refund",
    icon: "undo",
    className: "bg-red-400/10 text-red-400 border-red-400/30",
  },
  fee: {
    label: "Platform Fee",
    icon: "percent",
    className: "bg-amber-400/10 text-amber-400 border-amber-400/30",
  },
};

export const PAYOUT_DATA = {
  summary: {
    availableBalance: 385400,
    pendingBalance: 120800,
    totalEarnings: 2845000,
    nextPayout: 185000,
  },
  payoutMethod: {
    type: "Bank Transfer",
    accountName: "Aether Collective Ltd",
    accountNumber: "•••• 4821",
    bankName: "NUVORA Business Bank",
  },
  schedule: {
    nextPayoutDate: "2026-09-05",
    frequency: "Weekly",
    minimumThreshold: 50000,
  },
  payouts: [
    {
      id: "PAY-10482",
      date: "2026-08-28",
      reference: "PAY-10482",
      amount: 185000,
      method: "Bank Transfer",
      status: "paid",
    },
    {
      id: "PAY-10371",
      date: "2026-08-21",
      reference: "PAY-10371",
      amount: 142500,
      method: "Bank Transfer",
      status: "paid",
    },
    {
      id: "PAY-10263",
      date: "2026-08-14",
      reference: "PAY-10263",
      amount: 198000,
      method: "Bank Transfer",
      status: "pending",
    },
    {
      id: "PAY-10154",
      date: "2026-08-07",
      reference: "PAY-10154",
      amount: 167300,
      method: "Bank Transfer",
      status: "paid",
    },
    {
      id: "PAY-10045",
      date: "2026-07-31",
      reference: "PAY-10045",
      amount: 215000,
      method: "Bank Transfer",
      status: "paid",
    },
  ],
  transactions: [
    {
      id: "TXN-9041",
      date: "2026-08-30",
      description: "Order #NV-1048 payment settled",
      amount: 548,
      type: "sale",
      status: "paid",
    },
    {
      id: "TXN-9040",
      date: "2026-08-29",
      description: "Order #NV-1047 payment settled",
      amount: 189,
      type: "sale",
      status: "paid",
    },
    {
      id: "TXN-9039",
      date: "2026-08-28",
      description: "Payout PAY-10482",
      amount: -185000,
      type: "payout",
      status: "paid",
    },
    {
      id: "TXN-9038",
      date: "2026-08-28",
      description: "Platform fee (5%)",
      amount: -9250,
      type: "fee",
      status: "paid",
    },
    {
      id: "TXN-9037",
      date: "2026-08-27",
      description: "Order #NV-1044 refund",
      amount: -349,
      type: "refund",
      status: "paid",
    },
    {
      id: "TXN-9036",
      date: "2026-08-26",
      description: "Order #NV-1043 payment settled",
      amount: 587,
      type: "sale",
      status: "paid",
    },
    {
      id: "TXN-9035",
      date: "2026-08-25",
      description: "Order #NV-1042 payment settled",
      amount: 75,
      type: "sale",
      status: "paid",
    },
    {
      id: "TXN-9034",
      date: "2026-08-24",
      description: "Order #NV-1041 payment settled",
      amount: 214,
      type: "sale",
      status: "paid",
    },
  ],
};
