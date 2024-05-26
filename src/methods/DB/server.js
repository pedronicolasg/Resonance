const ServerSettings = require("../../methods/DB/models/servercfg.js");
const InteractionModel = require("./models/interaction.js")
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
  let result = await ServerSettings.deleteMany({ serverId: serverId }) && StoreItem.deleteMany({ serverId: serverId }) && InteractionModel.deleteMany({ guildId: serverId });
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

async function reloadInteractions(client) {
  try {
    const interactions = await InteractionModel.find({});
    interactions.forEach(interaction => {
      const { customId, roleId, channelId, guildId } = interaction;
      const guild = client.guilds.cache.get(guildId);
      const channel = guild?.channels.cache.get(channelId);
      const role = guild?.roles.cache.get(roleId);

      if (guild && channel && role) {
        const coletor = channel.createMessageComponentCollector({ filter: i => i.customId === customId });
        coletor.on("collect", async (c) => {
          const command = require("../../commands/moderation/rpb.js");
          await command.handleInteraction(c, role);
        });
      } else {
        console.log(`Não foi possível recriar a interação: guild, canal ou cargo não encontrado`);
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
  } catch (error) {
    console.error("Erro ao salvar a interação:", error);
    throw error;
  }
}

module.exports = { getServerConfig, dumpServerSettings, updateMessage, updateChannel, reloadInteractions, saveInteraction };
