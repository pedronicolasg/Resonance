const mongoose = require('mongoose');

const servercfgSchema = new mongoose.Schema({
  serverId: { type: String, required: true, unique: true },
  logchannelId: { type: String, required: false },
  adschannelId: { type: String, required: false },
  exitchannelId: { type: String, required: false },
  ruleschannelId: { type: String, required: false },
  welcomechannelId: { type: String, required: false },
  suggestionchannelId: { type: String, required: false },
});

const ServerCfg = mongoose.model('ServerCfg', servercfgSchema);

module.exports = ServerCfg;
