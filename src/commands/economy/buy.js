const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const StoreItem = require("../../database/models/storeItem");
const Wallet = require("../../database/models/wallet");
const { hxmaincolor, success, error } = require("../../themes/main");
const { sendLogEmbed, logger } = require("../../methods/loggers");
const { economy } = require("../../config.json");

module.exports = {
  name: "buy",
  description: "Compre um item da loja do servidor.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "item_id",
      description: "ID do item que você deseja comprar.",
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
            "O item que você deseja comprar não foi encontrado na loja."
          );

        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
      }

      const user = await Wallet.findOne({ userId });

      if (!user || user.coins < item.price) {
        let errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Saldo Insuficiente")
          .setDescription(
            "Você não possui moedas suficientes para comprar este item."
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

      if (member.roles.cache.has(itemId)) {
        let warnEmbed = new EmbedBuilder()
          .setColor("Yellow")
          .setTitle("Você já possui o cargo")
          .setDescription("Você já possui o cargo associado a este item.");

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

      try {
        await member.roles.add(role);
      } catch (e) {
        console.log("Erro ao adicionar cargo ao usuário:", e);
        let errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Erro ao Adicionar Cargo")
          .setDescription("Não foi possível adicionar o cargo ao seu usuário.");

        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
      }

      const rewardAmount = Math.round(item.price * 0.25);

      const addedByUserId = item.addedBy;
      const addedByUser = await Wallet.findOne({ userId: addedByUserId });

      if (addedByUser) {
        addedByUser.coins += rewardAmount;
        await addedByUser.save();
      } else {
        console.log(
          `Usuário com ID ${addedByUserId} não encontrado na carteira.`
        );
      }

      user.coins -= item.price;
      await user.save();

      let embed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle("Compra Realizada!")
        .setDescription(
          `Você comprou o item "${item.name}" da loja com sucesso.`
        );

      interaction.reply({ embeds: [embed] });

        let logEmbed = new EmbedBuilder()
          .setColor(hxmaincolor)
          .setTitle("Compra Realizada!")
          .setDescription(
            `${interaction.user} comprou o item "${item.name}"! @${addedByUserId} ganhou ${economy.coinsymb}:${rewardAmount} de comissão.`
          );
        sendLogEmbed(client, interaction.guild.id, logEmbed);
    } catch (e) {
      let errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Erro ao Comprar Item")
        .setDescription("Ocorreu um erro ao tentar comprar o item.");
      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      console.log(error("Erro ") + `ao comprar o item da loja devido à: ${e}`);
      logger.error(`Erro ao comprar o item da loja devido à: ${e}`);
    }
  },
};
