const { Schema, model } = require("mongoose");

const walletSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  coins: { type: Number, default: 0 },
  items: { type: Array },

  //claims
  lastDailyClaim: { type: Date, default: null },
  lastWeeklyClaim: { type: Date, default: null },
  lastMonthlyClaim: { type: Date, default: null },
  lastYearlyClaim: { type: Date, default: null },
});

const Wallet = model("Wallet", walletSchema);

module.exports = Wallet;
