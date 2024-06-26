const { ApplicationCommandType, EmbedBuilder } = require("discord.js");
const { getItemsByServerId } = require("../../methods/DB/economy");
const { hxmaincolor, error } = require("../../themes/main");
const { logger } = require("../../methods/loggers");
require('dotenv').config();

module.exports = {
  name: "store",
  description: "Ver os itens disponíveis na loja do servidor.",
  type: ApplicationCommandType.ChatInput,
  run: async (client, interaction) => {
    const serverId = interaction.guild.id;

    try {
      const items = await getItemsByServerId(serverId);

      if (items.length === 0) {
        let warnEmbed = new EmbedBuilder()
          .setColor("Yellow")
          .setTitle("Loja vazia.")
          .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
          .setDescription(
            "A loja do servidor atual ainda não possui itens disponíveis."
          );

        interaction.reply({ embeds: [warnEmbed], ephemeral: true });
        return;
      }

      let embed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle("Loja do servidor")
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setDescription("Itens disponíveis para compra:");

      items.forEach((item) => {
        embed.addFields({
          name: `${item.name} ( ${item.buyItemId} )`,
          value: `${item.description} \n **${process.env.ECONOMY_COINSYMB}:**${item.price}`,
          inline: true,
        });
      });

      interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (e) {
      let errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Erro ao acessar a loja")
        .setDescription("Ocorreu um erro ao obter os itens da loja.");
      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      console.log(error("Erro ") + `ao obter os itens da loja devido à: ${e}`);
      logger.error(`Erro ao obter os itens da loja devido à: ${e}`);
    }
  },
};
