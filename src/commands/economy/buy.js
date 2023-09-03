const Discord = require("discord.js");
const ServerSettings = require("../../database/models/servercfg");
const StoreItem = require("../../database/models/storeItem");
const Wallet = require("../../database/models/wallet");
const themes = require("../../themes/chalk-themes");
const apptheme = require("../../themes/theme.json");
const { logger, logger_economy } = require("../../events/client/logger");
const ecoCfg = require("./economycfg.json");

module.exports = {
  name: "buy",
  description: "Compre um item da loja do servidor.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "item_id",
      description: "ID do item que você deseja comprar.",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  run: async (client, interaction, args) => {
    const serverSettings = await ServerSettings.findOne({
      serverId: interaction.guild.id,
    });

    const userId = interaction.user.id;
    const serverId = interaction.guild.id;
    const itemId = interaction.options.getString("item_id");

    try {
      const item = await StoreItem.findOne({ serverId, itemId });

      if (!item) {
        const embed = new Discord.EmbedBuilder()
          .setColor("Red")
          .setTitle("❌ Item não encontrado")
          .setDescription(
            "O item que você deseja comprar não foi encontrado na loja."
          );

        interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      const user = await Wallet.findOne({ userId });

      if (!user || user.coins < item.price) {
        const embed = new Discord.EmbedBuilder()
          .setColor("Red")
          .setTitle("❌ Saldo Insuficiente")
          .setDescription(
            "Você não possui moedas suficientes para comprar este item."
          );

        interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      const member = interaction.guild.members.cache.get(userId);

      if (!member) {
        const embed = new Discord.EmbedBuilder()
          .setColor("Red")
          .setTitle("❌ Usuário não encontrado")
          .setDescription(
            "Não foi possível encontrar o seu usuário no servidor."
          );

        interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      if (member.roles.cache.has(itemId)) {
        const embed = new Discord.EmbedBuilder()
          .setColor("Red")
          .setTitle("❌ Já possui o Cargo")
          .setDescription("Você já possui o cargo associado a este item.");

        interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      const role = interaction.guild.roles.cache.get(itemId);

      if (!role) {
        console.log(`O cargo com ID ${itemId} não foi encontrado no servidor.`);
        const embed = new Discord.EmbedBuilder()
          .setColor("Red")
          .setTitle("❌ Cargo não encontrado")
          .setDescription(
            "O cargo associado a este item não foi encontrado no servidor."
          );

        interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      try {
        await member.roles.add(role);
      } catch (e) {
        console.log("Erro ao adicionar cargo ao usuário: ", e);
        const embed = new Discord.EmbedBuilder()
          .setColor("Red")
          .setTitle("❌ Erro ao Adicionar Cargo")
          .setDescription("Não foi possível adicionar o cargo ao seu usuário.");

        interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      const rewardAmount = Math.round(item.price * 0.25);

      user.coins -= item.price;
      await user.save();

      const embed = new Discord.EmbedBuilder()
        .setColor(apptheme.maincolor)
        .setTitle("✅ Compra Realizada!")
        .setDescription(
          `Você comprou o item "${item.name}" da loja com sucesso.`
        );

      interaction.reply({ embeds: [embed] });

      const addedByUserId = item.addedBy;
      const addedByUser = await Wallet.findOne({ userId: addedByUserId });

      const channelId = serverSettings.logchannelId;
      const logchannel = client.channels.cache.get(channelId);

      if (addedByUser) {
        addedByUser.coins += rewardAmount;
        await addedByUser.save();

        if (logchannel) {
          const logembed = new Discord.EmbedBuilder()
            .setColor(apptheme.maincolor)
            .setTitle("Compra Realizada!")
            .setDescription(
              `${interaction.user} comprou o item "${item.name}"! @${addedByUserId} ganhou ${ecoCfg.coinsymb}:${rewardAmount} de comissão.`
            );
          logchannel.send({ embeds: [logembed] });
        }
      } else {
        if (logchannel) {
          const logembed = new Discord.EmbedBuilder()
            .setColor(apptheme.maincolor)
            .setTitle("Compra Realizada!")
            .setDescription(
              `${interaction.user} comprou o item "${item.name}", porém, a carteira do usuário @${addedByUserId} não foi encontrada no banco de dados para receber ${ecoCfg.coinsymb}:${rewardAmount} de comissão`
            );
          logchannel.send({ embeds: [logembed] });
        }
        logger_economy.warn(
          `${interaction.user.id} comprou o item "${item.name}" no servidor ${interaction.guild.id}, porém, a carteira do usuário @${addedByUserId} não foi encontrada no banco de dados para receber ${ecoCfg.coinsymb}:${rewardAmount} de comissão`
        );
      }
    } catch (e) {
      console.log(
        themes.error("Erro ") + `ao comprar o item da loja devido à:\n ${e}`
      );
      logger.error(`Erro ao comprar o item da loja devido à: ${e}`);
      const embed = new Discord.EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Erro ao Comprar Item")
        .setDescription("Ocorreu um erro ao tentar comprar o item.");

      interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
