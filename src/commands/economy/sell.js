const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const StoreItem = require("../../database/models/storeItem");
const Wallet = require("../../database/models/wallet");
const { hxmaincolor, success, error } = require("../../themes/main");
const { economy } = require("../../config.json");
const { sendLogEmbed, logger } = require("../../methods/loggers");

module.exports = {
  name: "sell",
  description: "Venda um item da loja do servidor.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "item_id",
      description: "ID do item que você deseja vender.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  run: async (client, interaction, args) => {
    const userId = interaction.user.id;
    const serverId = interaction.guild.id;
    const itemId = interaction.options.getString("item_id");

    try {
      const item = await StoreItem.findOne({ serverId, itemId });

      if (!item) {
        let errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Item não encontrado")
          .setDescription(
            "O item que você deseja vender não foi encontrado na loja."
          );

        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
      }

      const member = interaction.guild.members.cache.get(userId);

      if (!member) {
        let errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Usuário não encontrado")
          .setDescription(
            "Não foi possível encontrar o seu usuário no servidor."
          );

        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
      }

      if (!member.roles.cache.has(itemId)) {
        let warnEmbed = new EmbedBuilder()
          .setColor("Yellow")
          .setTitle("Você não possui o Cargo")
          .setDescription("Você não possui o cargo associado a este item.");

        interaction.reply({ embeds: [warnEmbed], ephemeral: true });
        return;
      }

      const role = interaction.guild.roles.cache.get(itemId);

      if (!role) {
        let errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Cargo não encontrado")
          .setDescription(
            "O cargo associado a este item não foi encontrado no servidor."
          );

        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
      }

      const user = await Wallet.findOne({ userId });
      const amountGained = Math.round(item.price * 0.25);

      if (user) {
        try {
          await member.roles.remove(role);
        } catch (e) {
          let errorEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Erro ao Remover Cargo")
            .setDescription("Não foi possível remover o cargo do seu usuário.");

          interaction.reply({ embeds: [errorEmbed], ephemeral: true });
          return;
        }
        user.coins += amountGained;
        await user.save();
      } else {
        let errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Usuário não encontrado")
          .setDescription(
            `Usuário com ID ${userId} não encontrado na carteira.`
          );
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      let embed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle("Venda Realizada!")
        .setDescription(
          `Você vendeu o item "${item.name}" da loja com sucesso.\nVocê recebeu ${amountGained} ${economy.coinname}s.`
        );

      interaction.reply({ embeds: [embed] });

      let logEmbed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle("Compra Realizada!")
        .setDescription(
          `${interaction.user} vendeu o item "${item.name}" e ganhou ${economy.coinsymb}:${amountGained} de volta!`
        );
      sendLogEmbed(client, interaction.guild.id, logEmbed);
    } catch (e) {
      let errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Erro ao Vender Item")
        .setDescription("Ocorreu um erro ao tentar vender o item.");
      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      console.log(error("Erro ") + `ao vender o item da loja devido à: ${e}`);
      logger.error(`Erro ao vender o item da loja devido à: ${e}`);
    }
  },
};
