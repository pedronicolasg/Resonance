const { Schema, model } = require("mongoose");

const walletSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  lastClaim: { type: Date, default: null },
  coins: { type: Number, default: 0 },
  items: { type: Array },
});

const Wallet = model("Wallet", walletSchema);

module.exports = Wallet;
