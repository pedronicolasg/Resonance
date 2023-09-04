const Discord = require("discord.js");
const ecoCfg = require("./economycfg.json");
const themes = require("../../themes/chalk-themes");
const { logger } = require("../../events/client/logger");
const ms = require("ms");
const Wallet = require("../../database/models/wallet");

module.exports = {
  name: "daily",
  description: `Resgate suas ${ecoCfg.coinname}s diárias.`,
  type: Discord.ApplicationCommandType.ChatInput,

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
        const embed = new Discord.EmbedBuilder()
          .setColor("Red")
          .setTitle("❌ Daily já resgatado!")
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setDescription(
            `Espere \`${timeLeft}\` para resgatar seu daily novamente!`
          );

        interaction.reply({ embeds: [embed], ephemeral: true });
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

      const sucessembed = new Discord.EmbedBuilder()
        .setColor("Green")
        .setTitle("💰 Daily Resgatado!")
        .setDescription(
          `Você resgatou \`${ecoCfg.coinsymb}:${amount}\` em seu daily.\nUtilize o comando \`/wallet\` para ver seu total de ${ecoCfg.coinname}s.`
        )
        .setFooter({
          text: `${ecoCfg.coinname} (${ecoCfg.coinsymb}).`,
          iconURL: ecoCfg.coinicon,
        });

      interaction.reply({ embeds: [sucessembed] });
    } catch (e) {
      console.log(
        themes.error("Erro ") +
          `ao adicionar ${ecoCfg.coinsymb}:${amount} à carteira de ${interaction.user.id} devido à:\n ${e}`
      );
      logger.error(
        `Erro ao adicionar ${ecoCfg.coinsymb}:${amount} à carteira de ${interaction.user.id} devido à: ${e}`
      );

      const errorembed = new Discord.EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Erro ao resgatar o Daily!")
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `Não foi possível resgatar seu daily, tente novamente mais tarde.`
        );

      interaction.reply({ embeds: [errorembed] });
    }
  },
};
