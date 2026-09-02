import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import { CUSTOMER_ORDERS } from "../data/customerOrders.js";
import { useCart } from "../context/CartContext.jsx";

const STATUS_CONFIG = {
  processing: {
    label: "Processing",
    icon: "autorenew",
    description: "Your order is being prepared.",
    className: "bg-blue-400/10 text-blue-400 border-blue-400/30",
  },
  shipped: {
    label: "Shipped",
    icon: "local_shipping",
    description: "Your order is on the way.",
    className: "bg-purple-400/10 text-purple-400 border-purple-400/30",
  },
  delivered: {
    label: "Delivered",
    icon: "check_circle",
    description: "Your order was delivered successfully.",
    className: "bg-lime/10 text-accent border-lime/30",
  },
  cancelled: {
    label: "Cancelled",
    icon: "cancel",
    description: "This order has been cancelled.",
    className: "bg-red-400/10 text-red-400 border-red-400/30",
  },
};

const TRACKING_STAGES = [
  { id: "placed", label: "Order Placed", icon: "shopping_cart_checkout" },
  { id: "processing", label: "Processing", icon: "precision_manufacturing" },
  { id: "shipped", label: "Shipped", icon: "local_shipping" },
  { id: "out_for_delivery", label: "Out for Delivery", icon: "directions_car" },
  { id: "delivered", label: "Delivered", icon: "mark_email_read" },
];

function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function OrderTimeline({ status }) {
  const stageIndex = useMemo(() => {
    if (status === "cancelled") return -1;
    if (status === "processing") return 1;
    if (status === "shipped") return 2;
    if (status === "delivered") return 4;
    return 0;
  }, [status]);

  if (status === "cancelled") {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="font-h4 text-h4 text-text-primary mb-6">Order Progress</h3>
      <div className="relative">
        {/* Desktop horizontal track */}
        <div className="absolute left-[10%] right-[10%] top-6 hidden h-1 -translate-y-1/2 rounded-full bg-outline-variant/30 md:block" />
        <div
          className="absolute left-[10%] top-6 hidden h-1 -translate-y-1/2 rounded-full bg-lime md:block"
          style={{ width: `${Math.min(100, (stageIndex / (TRACKING_STAGES.length - 1)) * 100)}%` }}
        />

        {/* Mobile vertical track */}
        <div className="absolute bottom-6 left-6 top-6 w-1 -translate-x-1/2 rounded-full bg-outline-variant/30 md:hidden" />
        <div
          className="absolute left-6 top-6 w-1 -translate-x-1/2 rounded-full bg-lime md:hidden"
          style={{ height: `${Math.min(100, (stageIndex / (TRACKING_STAGES.length - 1)) * 100)}%` }}
        />

        <ol className="relative flex flex-col gap-8 md:flex-row md:justify-between md:gap-0">
          {TRACKING_STAGES.map((stage, index) => {
            const isCompleted = index <= stageIndex;
            const isCurrent = index === stageIndex;
            const stateClass = isCompleted
              ? "bg-lime text-obsidian border-lime"
              : "bg-surface border-2 border-outline-variant text-text-muted";
            const labelColor = isCompleted ? "text-text-primary" : "text-text-muted opacity-60";

            return (
              <li
                key={stage.id}
                className="relative flex items-center gap-4 md:w-1/5 md:flex-col md:items-center md:gap-3"
              >
                <div className="relative flex items-center justify-center">
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full bg-lime/40 pulse-ring" />
                  )}
                  <div
                    className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border ${stateClass}`}
                  >
                    <span
                      className="material-symbols text-[22px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {stage.icon}
                    </span>
                  </div>
                </div>
                <div className="text-left md:text-center">
                  <p className={`font-label-sm ${labelColor} ${isCurrent ? "font-bold" : ""}`}>
                    {stage.label}
                  </p>
                  <p className="text-[12px] text-text-muted">
                    {isCurrent ? "Current" : isCompleted ? "Completed" : "Pending"}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Card>
  );
}

function ProductItem({ item, onBuyAgain }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Link to={`/product/${item.productId}`} className="shrink-0">
        <div className="h-20 w-20 rounded-lg overflow-hidden border border-outline-variant/30 bg-surface">
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          to={`/product/${item.productId}`}
          className="font-label-sm text-label-sm text-text-primary hover:text-accent truncate block"
        >
          {item.name}
        </Link>
        <p className="text-xs text-text-muted mt-0.5">by {item.seller}</p>
        <p className="text-xs text-text-muted mt-1">Qty: {item.quantity}</p>
      </div>
      <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
        <p className="font-label-sm text-label-sm text-text-primary">
          {formatPrice(item.price * item.quantity)}
        </p>
        <p className="text-xs text-text-muted">
          {formatPrice(item.price)} each
        </p>
        <div className="flex gap-2 mt-1">
          <Link to={`/product/${item.productId}`}>
            <Button variant="outline" size="sm">View Product</Button>
          </Link>
          <Button size="sm" onClick={() => onBuyAgain(item)}>
            <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              shopping_cart
            </span>
            Buy Again
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CustomerOrderDetails() {
  const { orderId } = useParams();
  const { addItem } = useCart();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const order = useMemo(() => {
    return CUSTOMER_ORDERS.find((o) => o.id === orderId);
  }, [orderId]);

  const statusConfig = order ? STATUS_CONFIG[order.status] : null;

  const handleBuyAgain = (item) => {
    addItem(
      {
        id: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
      },
      item.quantity
    );
  };

  const handleCancelOrder = () => {
    setShowCancelModal(true);
  };

  const handleRequestReturn = () => {
    setShowCancelModal(true);
  };

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container">
          <span className="material-symbols text-4xl text-text-muted" style={{ fontVariationSettings: "'FILL' 0" }}>
            search_off
          </span>
        </div>
        <h2 className="font-display text-h2 text-text-primary mb-2">Order Not Found</h2>
        <p className="font-body-md text-body-md text-text-muted mb-8 max-w-md">
          We couldn't find the order you're looking for. It may have been removed or the link may be incorrect.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/customer/orders">
            <Button size="lg">
              <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                arrow_back
              </span>
              Back to Orders
            </Button>
          </Link>
          <Link to="/marketplace">
            <Button variant="outline" size="lg">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Page Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Link
            to="/customer/orders"
            className="flex items-center gap-1 font-label-sm text-label-sm text-text-muted hover:text-accent transition-colors"
          >
            <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>
              arrow_back
            </span>
            Back to Orders
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-h2 text-text-primary">Order #{order.orderNumber}</h1>
              {statusConfig && (
                <Badge variant={order.status === "delivered" ? "lime" : "default"} className={statusConfig.className}>
                  <span className="material-symbols text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {statusConfig.icon}
                  </span>
                  {statusConfig.label}
                </Badge>
              )}
            </div>
            <p className="font-body-md text-body-md text-text-muted">
              Placed {formatDate(order.date)}
            </p>
          </div>
          <Link to="/marketplace">
            <Button variant="outline">
              <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                storefront
              </span>
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>

      {/* Order Status */}
      {statusConfig && (
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full border ${statusConfig.className}`}>
              <span className="material-symbols text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {statusConfig.icon}
              </span>
            </div>
            <div>
              <h2 className="font-h4 text-h4 text-text-primary">{statusConfig.label}</h2>
              <p className="font-body-md text-body-md text-text-muted mt-1">{statusConfig.description}</p>
              {order.estimatedDelivery && order.status !== "cancelled" && (
                <p className="text-sm text-text-muted mt-2">
                  <span className="material-symbols text-sm align-middle mr-1" style={{ fontVariationSettings: "'FILL' 0" }}>
                    calendar_today
                  </span>
                  Estimated delivery: {formatDate(order.estimatedDelivery)}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Order Timeline */}
      <div className="mb-6">
        <OrderTimeline status={order.status} />
      </div>

      {/* Track Order Button */}
      {order.trackingAvailable && order.status !== "delivered" && order.status !== "cancelled" && (
        <div className="mb-6">
          <Link to="/track-order">
            <Button size="lg" className="w-full sm:w-auto">
              <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_shipping
              </span>
              Track Your Order
            </Button>
          </Link>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="font-h4 text-h4 text-text-primary mb-6">
              Items ({order.items.length})
            </h3>
            <div className="space-y-6">
              {order.items.map((item) => (
                <div
                  key={`${order.id}-${item.productId}`}
                  className="pb-6 border-b border-outline-variant/20 last:border-0 last:pb-0"
                >
                  <ProductItem item={item} onBuyAgain={handleBuyAgain} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shipping Information */}
          <Card className="p-6">
            <h3 className="font-h4 text-h4 text-text-primary mb-4">Shipping Information</h3>
            <div className="space-y-4">
              <div>
                <p className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider mb-2">
                  Delivery Address
                </p>
                <div className="font-body-md text-body-md text-text-primary">
                  <p>{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.region}</p>
                  <p>{order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
              <div className="border-t border-outline-variant/20 pt-4">
                <p className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider mb-2">
                  Delivery Method
                </p>
                <p className="font-body-md text-body-md text-text-primary">{order.deliveryMethod}</p>
              </div>
            </div>
          </Card>

          {/* Payment Summary */}
          <Card className="p-6">
            <h3 className="font-h4 text-h4 text-text-primary mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-body-md text-body-md text-text-muted">Subtotal</span>
                <span className="font-body-md text-body-md text-text-primary">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-body-md text-body-md text-text-muted">Delivery</span>
                <span className="font-body-md text-body-md text-text-primary">{formatPrice(order.deliveryFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="font-body-md text-body-md text-text-muted">Discount</span>
                  <span className="font-body-md text-body-md text-accent">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="border-t border-outline-variant/20 pt-3">
                <div className="flex justify-between">
                  <span className="font-h4 text-h4 text-text-primary">Total</span>
                  <span className="font-h4 text-h4 text-accent">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
            <div className="border-t border-outline-variant/20 mt-4 pt-4">
              <p className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider mb-2">
                Payment Method
              </p>
              <div className="flex items-center gap-2">
                <span className="material-symbols text-text-muted" style={{ fontVariationSettings: "'FILL' 0" }}>
                  credit_card
                </span>
                <p className="font-body-md text-body-md text-text-primary">{order.paymentMethod}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Order Summary Card */}
      <Card className="p-6 mt-6">
        <h3 className="font-h4 text-h4 text-text-primary mb-4">Order Summary</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider mb-1">
              Order Number
            </p>
            <p className="font-body-md text-body-md text-text-primary">#{order.orderNumber}</p>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider mb-1">
              Items
            </p>
            <p className="font-body-md text-body-md text-text-primary">{order.items.length}</p>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider mb-1">
              Payment
            </p>
            <p className="font-body-md text-body-md text-text-primary">
              {order.status === "cancelled" ? "Refunded" : "Paid"}
            </p>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider mb-1">
              Status
            </p>
            <p className="font-body-md text-body-md text-text-primary">
              {statusConfig?.label ?? order.status}
            </p>
          </div>
        </div>
      </Card>

      {/* Actions */}
      {order.status === "processing" && (
        <div className="mt-6">
          <Button variant="outline" onClick={handleCancelOrder}>
            <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>
              cancel
            </span>
            Cancel Order
          </Button>
        </div>
      )}

      {order.status === "delivered" && (
        <div className="mt-6">
          <Button variant="outline" onClick={handleRequestReturn}>
            <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>
              keyboard_return
            </span>
            Request Return
          </Button>
        </div>
      )}

      {/* Help/Support Section */}
      <Card className="p-6 mt-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lime/10 text-accent">
            <span className="material-symbols text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>
              support_agent
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-h4 text-h4 text-text-primary">Need help with this order?</h3>
            <p className="font-body-md text-body-md text-text-muted mt-1">
              Our support team is here to assist you with any questions or concerns.
            </p>
          </div>
          <Link to="/support">
            <Button variant="outline">
              <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                chat
              </span>
              Contact Support
            </Button>
          </Link>
        </div>
      </Card>

      {/* Cancel/Return Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3 className="font-h4 text-h4 text-text-primary mb-4">
              {order.status === "processing" ? "Cancel Order" : "Request Return"}
            </h3>
            <p className="font-body-md text-body-md text-text-muted mb-6">
              {order.status === "processing"
                ? "This feature is not yet connected to the backend. Order cancellation will be available soon."
                : "This feature is not yet connected to the backend. Return requests will be available soon."}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
