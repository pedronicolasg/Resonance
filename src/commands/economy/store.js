const { ApplicationCommandType, EmbedBuilder } = require("discord.js");
const StoreItem = require("../../database/models/storeItem");
const { hxmaincolor, success, error } = require("../../themes/main");
const { logger } = require("../../events/client/logger");
const { economy } = require("../../config.json");

module.exports = {
  name: "store",
  description: "Ver os itens disponíveis na loja do servidor.",
  type: ApplicationCommandType.ChatInput,
  run: async (client, interaction) => {
    const serverId = interaction.guild.id;

    try {
      const items = await StoreItem.find({ serverId });

      if (items.length === 0) {
        const embed = new EmbedBuilder()
          .setColor(hxmaincolor)
          .setTitle("Loja vazia!")
          .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
          .setDescription(
            "A loja do servidor ainda não possui itens disponíveis."
          );

        interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle("Loja do servidor")
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setDescription("Itens disponíveis para compra:");

      items.forEach((item) => {
        embed.addFields({
          name: `${item.name} ( ${item.itemId} )`,
          value: `${item.description} \n Preço: ${economy.coinsymb}:${item.price}`,
          inline: true,
        });
      });

      interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.log(error("Erro ") + `ao obter os itens da loja devido à: ${e}`);
      logger.error(`Erro ao obter os itens da loja devido à: ${e}`);
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Erro ao acessar a loja")
        .setDescription("Ocorreu um erro ao obter os itens da loja.");

      interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
