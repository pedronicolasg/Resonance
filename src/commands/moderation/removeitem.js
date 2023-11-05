const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const StoreItem = require("../../database/models/storeItem");
const { hxmaincolor, error } = require("../../themes/main");
const { sendLogEmbed, logger } = require("../../methods/loggers");

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

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      let warnEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("Permissão Necessária")
        .setDescription(
          `Você precisa da permissão de "Gerenciar Guilda" para usar este comando.`
        );

      return interaction.reply({ embeds: [warnEmbed], ephemeral: true });
    }

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

      let logEmbed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle("Item Adicionado à Loja!")
        .setDescription(
          `O item "${item.name}"(${item.id}) foi removido à da por ${interaction.user}.`
        );
      sendLogEmbed(client, interaction.guild.id, logEmbed);
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
