const ServerSettings = require("../../methods/DB/models/servercfg.js");

async function getServerSettings(serverId) {
  let serverSettings = await ServerSettings.findOne({ serverId });
  if (!serverSettings) {
    serverSettings = new ServerSettings({ serverId });
    await serverSettings.save();
  }
  return serverSettings;
}

async function getServerConfig(serverId, configName) {
  const serverSettings = await getServerSettings(serverId);
  return serverSettings[configName];
}

async function dumpServerSettings(serverId) {
  let result = await ServerSettings.deleteMany({ serverId: serverId });
  return result;
}

async function updateMessage(serverId, msg, content) {
  try {
    const serverSettings = await getServerSettings(serverId);
    serverSettings[msg] = content;
    await serverSettings.save();
    return { success: true };
  } catch (error) {
    console.error(`Erro ao atualizar a mensagem ${msg} para o servidor ${serverId}:`, error);
    return { success: false, error };
  }
}

async function updateChannel(serverId, channelName, channelId) {
  try {
    const serverSettings = await getServerSettings(serverId);
    serverSettings[channelName] = channelId;
    await serverSettings.save();
    return { success: true };
  } catch (error) {
    console.error(`Erro ao atualizar o canal ${channelName} para o servidor ${serverId}:`, error);
    return { success: false, error };
  }
}

module.exports = { getServerConfig, dumpServerSettings, updateMessage, updateChannel };
