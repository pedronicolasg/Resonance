const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const StoreItem = require("../../database/models/storeItem");
const ServerSettings = require("../../database/models/servercfg");
const { hxmaincolor, success, error } = require("../../themes/main");
const { logger } = require("../../events/client/logger");

module.exports = {
  name: "removeitem",
  description: "Remova um item da loja do servidor.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "item_id",
      description: "ID do item que você deseja remover.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  run: async (client, interaction, args) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      let warnEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("Permissão Necessária")
        .setDescription(
          `Você precisa da permissão de "Gerenciar Guilda" para usar este comando.`
        );

      return interaction.reply({ embeds: [warnEmbed], ephemeral: true });
    }

    const serverSettings = await ServerSettings.findOne({
      serverId: interaction.guild.id,
    });

    const serverId = interaction.guild.id;
    const itemId = interaction.options.getString("item_id");

    try {
      const item = await StoreItem.findOneAndDelete({ serverId, itemId });

      if (!item) {
        let embed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Item não Encontrado")
          .setDescription(
            "O item com o ID especificado não foi encontrado na loja."
          );

        interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      let embed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle("Item Removido da Loja!")
        .setDescription(
          `O item "${item.name}" foi removido da loja com sucesso.`
        );

      interaction.reply({ embeds: [embed] });
      const channelId = serverSettings.logchannelId;
      const logchannel = client.channels.cache.get(channelId);
      if (logchannel) {
        let logEmbed = new EmbedBuilder()
          .setColor(hxmaincolor)
          .setTitle("Item Adicionado à Loja!")
          .setDescription(
            `O item "${name}" foi adicionado à loja por ${interaction.user}.\nID do Item: ${newItem.itemId}`
          );
        logchannel.send({ embeds: [logEmbed] });
      }
    } catch (e) {
      console.log(error("Erro ") + `ao remover o item da loja devido à: ${e}`);
      logger.error(`Erro ao remover o item da loja devido à: ${e}`);
      let errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Erro ao Remover o Item da Loja")
        .setDescription("Não foi possível remover o item da loja.");

      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
