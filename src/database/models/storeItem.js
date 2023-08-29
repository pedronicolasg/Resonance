const mongoose = require('mongoose');

const storeItemSchema = new mongoose.Schema({
  serverId: { type: String, required: true },
  itemId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  addedBy: { type: String, required: true },
});

const StoreItem = mongoose.model('StoreItem', storeItemSchema);

module.exports = StoreItem;
