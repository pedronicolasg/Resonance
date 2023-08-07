const mongoose = require('mongoose');

const servercfgSchema = new mongoose.Schema({
  serverId: { type: String, required: true, unique: true },
  logchannelId: { type: String, required: true },
  adschannelId: { type: String, required: true },
  exitchannelId: { type: String, required: true },
  ruleschannelId: { type: String, required: true },
  welcomechannelId: { type: String, required: true },
  suggestionchannelId: { type: String, required: true },
});

const ServerCfg = mongoose.model('ServerCfg', servercfgSchema);

module.exports = ServerCfg;
