const SUBSCRIPTION_PLANS = Object.freeze({
  FREE: {
    id: "free", // The planId you send to backend
    price: 0, // The price in Rupees
    name: "Starter", // Nice name for UI
  },
  STANDAR: {
    id: "standard",
    price: 49,
    name: "Coder",
  },
  PREMIUM: {
    id: "premium",
    price: 149,
    name: "Job Ready",
  },
});

// CommonJS Export
module.exports = {
  SUBSCRIPTION_PLANS,
};
