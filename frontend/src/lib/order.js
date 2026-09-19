export function estimateDelivery(deliveryId) {
  let startOffset;
  let endOffset;
  if (deliveryId === "express") {
    startOffset = 2;
    endOffset = 3;
  } else {
    startOffset = 5;
    endOffset = 7;
  }
  const start = new Date();
  start.setDate(start.getDate() + startOffset);
  const end = new Date();
  end.setDate(end.getDate() + endOffset);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export function formatDateRange(startISO, endISO) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const startStr = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endStr = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
}
