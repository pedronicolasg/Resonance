const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
require('dotenv').config();
const { error } = require("../../themes/main");
const { logger } = require("../../methods/loggers");
const { claim, getWallet } = require("../../methods/DB/economy")
const ms = require("ms");

module.exports = {
  name: "claim",
  description: `Resgate seus ${process.env.ECONOMY_COINNAME}s.`,
  type: ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    const userId = interaction.user.id;
    const amount = Math.max(Math.ceil(Math.random() * 125), 75)

    try {
      let user = await getWallet(userId);
      let cooldown = ms("1 day");

      if (
        user?.lastClaim &&
        Date.now() - user.lastClaim < cooldown
      ) {
        let timeLeft = ms(cooldown - (Date.now() - user.lastClaim));
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

      await claim(userId, amount);

      let embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Daily Resgatado!")
        .setDescription(
          `Você resgatou \`${process.env.ECONOMY_COINSYMB}:${amount}\` em seu daily.\nUtilize o comando \`/wallet\` para ver seu total de ${process.env.ECONOMY_COINNAME}s.`
        )
        .setFooter({
          text: `${process.env.ECONOMY_COINNAME} (${process.env.ECONOMY_COINSYMB}).`,
          iconURL: `${process.env.ECONOMY_COINICON}`,
        });

      interaction.reply({ embeds: [embed] });
    } catch (e) {
      let errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Erro ao resgatar!")
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `Não foi possível resgatar seus ${process.env.ECONOMY_COINNAME}s, tente novamente mais tarde.`
        );

      interaction.reply({ embeds: [errorEmbed] });
      console.log(
        error("Erro ") +
        `ao adicionar ${process.env.ECONOMY_COINSYMB}:${amount} à carteira de ${interaction.user.id} devido à:\n ${e}`
      );
      logger.error(
        `Erro ao adicionar ${process.env.ECONOMY_COINSYMB}:${amount} à carteira de ${interaction.user.id} devido à:\n ${e}`
      );
    }
  },
};