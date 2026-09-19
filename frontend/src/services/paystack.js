let PaystackPop = null;

async function loadPaystack() {
  if (PaystackPop) return PaystackPop;
  const mod = await import("@paystack/inline-js");
  PaystackPop = mod.default;
  return PaystackPop;
}

export async function openPaystackPopup({
  accessCode,
  email,
  onSuccess,
  onCancel,
  onError,
}) {
  const Pop = await loadPaystack();
  const popup = new Pop();
  return new Promise((resolve, reject) => {
    popup.newTransaction({
      accessCode,
      email,
      onSuccess: (response) => {
        onSuccess?.(response);
        resolve(response);
      },
      onCancel: () => {
        onCancel?.();
        reject(new Error("cancelled"));
      },
      onError: (err) => {
        onError?.(err);
        reject(err instanceof Error ? err : new Error(String(err)));
      },
      onLoad: () => {},
    });
  });
}
