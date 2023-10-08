const { ApplicationCommandType, EmbedBuilder } = require("discord.js");
const { economy } = require("../../config.json");
const { hxmaincolor, success, error } = require("../../themes/main");
const { logger } = require("../../events/client/logger");
const ms = require("ms");
const Wallet = require("../../database/models/wallet");

module.exports = {
  name: "monthly",
  description: `Resgate suas ${economy.coinname}s mensais.`,
  type: ApplicationCommandType.ChatInput,

  run: async (client, interaction, args) => {
    const userId = interaction.user.id;
    const timeout = ms("30 days");

    try {
      let user = await Wallet.findOne({ userId });

      if (
        user &&
        user.lastMonthlyClaim &&
        Date.now() - user.lastMonthlyClaim < timeout
      ) {
        const timeLeft = ms(timeout - (Date.now() - user.lastMonthlyClaim));
        let warnEmbed = new EmbedBuilder()
          .setColor("Yellow")
          .setTitle("Monthly já resgatado!")
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setDescription(
            `Espere \`${timeLeft}\` para resgatar seu monthly novamente!`
          );

        interaction.reply({ embeds: [warnEmbed], ephemeral: true });
        return;
      }

      var amount = Math.ceil(Math.random() * 225);
      if (amount < 125) amount = 125;

      user = user || new Wallet({ userId });
      user.coins = (user.coins || 0) + amount;
      user.lastMonthlyClaim = Date.now();
      await user.save();

      let embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Monthly Resgatado!")
        .setDescription(
          `Você resgatou \`${economy.coinsymb}:${amount}\` em seu monthly.\nUtilize o comando \`/wallet\` para ver seu total de ${economy.coinname}s.`
        )
        .setFooter({
          text: `${economy.coinname} (${economy.coinsymb}).`,
          iconURL: `${economy.coinicon}`,
        });

      interaction.reply({ embeds: [embed] });
    } catch (e) {
      console.log(
        error("Erro ") +
          `ao adicionar ${economy.coinsymb}:${amount} à carteira de ${interaction.user.id} devido à:\n ${e}`
      );
      logger.error(
        `Erro ao adicionar ${economy.coinsymb}:${amount} à carteira de ${interaction.user.id} devido à:\n ${e}`
      );

      let errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Erro ao resgatar o Monthly!")
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `Não foi possível resgatar seu monthly, tente novamente mais tarde.`
        );

      interaction.reply({ embeds: [errorEmbed] });
    }
  },
};
