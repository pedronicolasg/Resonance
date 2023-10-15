const { ApplicationCommandType, EmbedBuilder } = require("discord.js");
const { economy } = require("../../config.json");
const { hxmaincolor, success, error } = require("../../themes/main");
const { logger } = require("../../methods/loggers");
const ms = require("ms");
const Wallet = require("../../database/models/wallet");

module.exports = {
  name: "daily",
  description: `Resgate suas ${economy.coinname}s diárias.`,
  type: ApplicationCommandType.ChatInput,

  run: async (client, interaction, args) => {
    const userId = interaction.user.id;
    const timeout = ms("1 day");

    try {
      let user = await Wallet.findOne({ userId });

      if (
        user &&
        user.lastDailyClaim &&
        Date.now() - user.lastDailyClaim < timeout
      ) {
        const timeLeft = ms(timeout - (Date.now() - user.lastDailyClaim));
        let warnEmbed = new EmbedBuilder()
          .setColor("Yellow")
          .setTitle("Daily já resgatado!")
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setDescription(
            `Espere \`${timeLeft}\` para resgatar seu daily novamente!`
          );

        interaction.reply({ embeds: [warnEmbed], ephemeral: true });
        return;
      }

      var amount = Math.ceil(Math.random() * 125);
      if (amount < 75) {
        amount = 75;
      }

      user = user || new Wallet({ userId });
      user.coins = (user.coins || 0) + amount;
      user.lastDailyClaim = Date.now();
      await user.save();

      let embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Daily Resgatado!")
        .setDescription(
          `Você resgatou \`${economy.coinsymb}:${amount}\` em seu daily.\nUtilize o comando \`/wallet\` para ver seu total de ${economy.coinname}s.`
        )
        .setFooter({
          text: `${economy.coinname} (${economy.coinsymb}).`,
          iconURL: `${economy.coinicon}`,
        });

      interaction.reply({ embeds: [embed] });
    } catch (e) {
      let errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Erro ao resgatar o Daily!")
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `Não foi possível resgatar seu daily, tente novamente mais tarde.`
        );

      interaction.reply({ embeds: [errorEmbed] });
      console.log(
        error("Erro ") +
          `ao adicionar ${economy.coinsymb}:${amount} à carteira de ${interaction.user.id} devido à:\n ${e}`
      );
      logger.error(
        `Erro ao adicionar ${economy.coinsymb}:${amount} à carteira de ${interaction.user.id} devido à:\n ${e}`
      );
    }
  },
};
