const { Schema, model } = require("mongoose");

const servercfgSchema = new Schema({
  serverId: { type: String, required: true, unique: true },

  // IDs dos canais
  logchannelId: { type: String, required: false },
  adschannelId: { type: String, required: false },
  exitchannelId: { type: String, required: false },
  ruleschannelId: { type: String, required: false },
  gameschannelId: { type: String, required: false },
  welcomechannelId: { type: String, required: false },
  suggestionchannelId: { type: String, required: false },

  // Mensagens
  welcomeMessage: { type: String, required: false },
  exitMessage: { type: String, required: false },
});

const ServerCfg = model("ServerCfg", servercfgSchema);

module.exports = ServerCfg;
