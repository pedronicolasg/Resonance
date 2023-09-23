const { ApplicationCommandType, EmbedBuilder } = require("discord.js");
const config = require("../../config.json");
const { hxmaincolor, success, error } = require("../../themes/main");
const { logger } = require("../../events/client/logger");
const ms = require("ms");
const Wallet = require("../../database/models/wallet");

module.exports = {
  name: "weekly",
  description: `Resgate suas ${config.economy.coinname}s semanais.`,
  type: ApplicationCommandType.ChatInput,

  run: async (client, interaction, args) => {
    const userId = interaction.user.id;
    const timeout = ms("7 days");

    try {
      let user = await Wallet.findOne({ userId });

      if (
        user &&
        user.lastWeeklyClaim &&
        Date.now() - user.lastWeeklyClaim < timeout
      ) {
        const timeLeft = ms(timeout - (Date.now() - user.lastWeeklyClaim));
        const embed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("❌ Weekly já resgatado!")
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setDescription(
            `Espere \`${timeLeft}\` para resgatar seu weekly novamente!`
          );

        interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      var amount = Math.ceil(Math.random() * 175);
      if (amount < 100) {
        amount = 100;
      }

      user = user || new Wallet({ userId });
      user.coins = (user.coins || 0) + amount;
      user.lastWeeklyClaim = Date.now();
      await user.save();

      const sucessembed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("💰 Weekly Resgatado!")
        .setDescription(
          `Você resgatou \`${config.economy.coinsymb}:${amount}\` em seu weekly.\nUtilize o comando \`/wallet\` para ver seu total de ${config.economy.coinname}s.`
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
        .setTitle("❌ Erro ao resgatar o Weekly!")
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `Não foi possível resgatar seu weekly, tente novamente mais tarde.`
        );

      interaction.reply({ embeds: [errorembed] });
    }
  },
};
