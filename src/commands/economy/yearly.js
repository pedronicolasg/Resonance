const { ApplicationCommandType, EmbedBuilder } = require("discord.js");
const config = require("../../config.json");
const { hxmaincolor, success, error } = require("../../themes/main");
const { logger } = require("../../events/client/logger");
const ms = require("ms");
const Wallet = require("../../database/models/wallet");

module.exports = {
  name: "yearly",
  description: `Resgate suas ${config.economy.coinname}s anuais.`,
  type: ApplicationCommandType.ChatInput,

  run: async (client, interaction, args) => {
    const userId = interaction.user.id;
    const timeout = ms("365 days");

    try {
      let user = await Wallet.findOne({ userId });

      if (
        user &&
        user.lastYearlyClaim &&
        Date.now() - user.lastYearlyClaim < timeout
      ) {
        const timeLeft = ms(timeout - (Date.now() - user.lastYearlyClaim));
        const embed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("❌ Yearly já resgatado!")
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setDescription(
            `Espere \`${timeLeft}\` para resgatar seu yearly novamente!`
          );

        interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      var amount = Math.ceil(Math.random() * 1000);
      if (amount < 750) {
        amount = 750;
      }

      user = user || new Wallet({ userId });
      user.coins = (user.coins || 0) + amount;
      user.lastYearlyClaim = Date.now();
      await user.save();

      const sucessembed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("💰 Yearly Resgatado!")
        .setDescription(
          `Você resgatou \`${config.economy.coinsymb}:${amount}\` em seu yearly.\nUtilize o comando \`/wallet\` para ver seu total de ${config.economy.coinname}s.`
        )
        .setFooter({
          text: `${config.economy.coinname} (${config.economy.coinsymb}).`,
          iconURL: `${config.economy.coinicon}`,
        });

      interaction.reply({ embeds: [sucessembed] });
    } catch (e) {
      console.log(
        error("Erro ") +
          `ao adicionar ${config.economy.coinsymb}:${amount} à carteira de ${interaction.user.id} devido à:\n ${e}`
      );
      logger.error(
        `Erro ao adicionar ${config.economy.coinsymb}:${amount} à carteira de ${interaction.user.id} devido à:\n ${e}`
      );

      const errorembed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Erro ao resgatar o Yearly!")
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `Não foi possível resgatar seu yearly, tente novamente mais tarde.`
        );

      interaction.reply({ embeds: [errorembed] });
    }
  },
};
