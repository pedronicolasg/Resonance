const ServerSettings = require("../../methods/DB/models/servercfg.js");
const InteractionModel = require("./models/interaction.js");
const StoreItem = require("./models/storeItem");

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
  try {
    const result = await Promise.all([
      ServerSettings.deleteMany({ serverId }),
      StoreItem.deleteMany({ serverId }),
      InteractionModel.deleteMany({ guildId: serverId })
    ]);
    return result;
  } catch (error) {
    console.error(`Erro ao deletar configurações do servidor ${serverId}:`, error);
    throw error;
  }
}

async function updateMessage(serverId, msg, content) {
  return await updateServerSettings(serverId, { [msg]: content });
}

async function updateChannel(serverId, channelName, channelId) {
  return await updateServerSettings(serverId, { [channelName]: channelId });
}

async function updateServerSettings(serverId, updates) {
  try {
    const serverSettings = await getServerSettings(serverId);
    Object.assign(serverSettings, updates);
    await serverSettings.save();
    return { success: true };
  } catch (error) {
    console.error(`Erro ao atualizar configurações para o servidor ${serverId}:`, error);
    return { success: false, error };
  }
}

async function reloadInteractions(client) {
  try {
    const interactions = await InteractionModel.find({});
    interactions.forEach(interaction => {
      const { customId, roleId, channelId, guildId } = interaction;
      const guild = client.guilds.cache.get(guildId);
      if (!guild) {
        console.log(`Guild ${guildId} não encontrado`);
        return;
      }

      const channel = guild.channels.cache.get(channelId);
      const role = guild.roles.cache.get(roleId);
      if (channel && role) {
        const coletor = channel.createMessageComponentCollector({ filter: i => i.customId === customId });
        coletor.on("collect", async (c) => {
          const command = require("../../commands/moderation/rpb.js");
          await command.handleInteraction(c, role);
        });
      } else {
        console.log(`Canal ou cargo não encontrado no guild ${guildId}`);
      }
    });
  } catch (error) {
    console.error("Erro ao recarregar as interações:", error);
    logger.error(`Erro ao recarregar as interações: ${error.message}`);
  }
}

async function saveInteraction(interactionData) {
  try {
    const interaction = new InteractionModel(interactionData);
    await interaction.save();
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar a interação:", error);
    throw error;
  }
}

module.exports = {
  getServerConfig,
  dumpServerSettings,
  updateMessage,
  updateChannel,
  reloadInteractions,
  saveInteraction
};
