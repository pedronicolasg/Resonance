const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema({
  customId: { type: String, required: true, unique: true },
  roleId: { type: String, required: true },
  channelId: { type: String, required: true },
  guildId: { type: String, required: true },
});

module.exports = mongoose.model("Interaction", interactionSchema);
