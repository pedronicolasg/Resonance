const { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { economy } = require("../../config.json");
const { error } = require("../../themes/main");
const { logger } = require("../../methods/loggers");
const ms = require("ms");
const Wallet = require("../../database/models/wallet");

module.exports = {
  name: "claim",
  description: `Resgate seus ${economy.coinname}s.`,
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "daily",
      description: `${economy.coinname}s diários`,
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "weekly",
      description: `${economy.coinname}s semanais`,
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "monthly",
      description: `${economy.coinname}s mensais`,
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "yearly",
      description: `${economy.coinname}s anuais`,
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],

  run: async (client, interaction) => {
    const subCommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    try {
      let user = await Wallet.findOne({ userId });
      if (subCommand === "daily") {
        let cooldown = ms("1 day");

        if (
          user?.lastDailyClaim &&
          Date.now() - user.lastDailyClaim < cooldown
        ) {
          let timeLeft = ms(cooldown - (Date.now() - user.lastDailyClaim));
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
      } else if (subCommand === "weekly") {
        let cooldown = ms("7 days");

        if (
          user?.lastWeeklyClaim &&
          Date.now() - user.lastWeeklyClaim < cooldown
        ) {
          let timeLeft = ms(cooldown - (Date.now() - user.lastWeeklyClaim));
          let warnEmbed = new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("Weekly já resgatado!")
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setDescription(
              `Espere \`${timeLeft}\` para resgatar seu weekly novamente!`
            );

          interaction.reply({ embeds: [warnEmbed], ephemeral: true });
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

        let embed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("Weekly Resgatado!")
          .setDescription(
            `Você resgatou \`${economy.coinsymb}:${amount}\` em seu weekly.\nUtilize o comando \`/wallet\` para ver seu total de ${economy.coinname}s.`
          )
          .setFooter({
            text: `${economy.coinname} (${economy.coinsymb}).`,
            iconURL: `${economy.coinicon}`,
          });

        interaction.reply({ embeds: [embed] });
      } else if (subCommand === "monthly") {
        let cooldown = ms("30 days");

        if (
          user?.lastMonthlyClaim &&
          Date.now() - user.lastMonthlyClaim < cooldown
        ) {
          let timeLeft = ms(cooldown - (Date.now() - user.lastMonthlyClaim));
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
      } else {
        const cooldown = ms("365 days");

        if (
          user?.lastYearlyClaim &&
          Date.now() - user.lastYearlyClaim < cooldown
        ) {
          let timeLeft = ms(cooldown - (Date.now() - user.lastYearlyClaim));
          let warnEmbed = new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("Yearly já resgatado!")
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setDescription(
              `Espere \`${timeLeft}\` para resgatar seu yearly novamente!`
            );

          interaction.reply({ embeds: [warnEmbed], ephemeral: true });
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

        let embed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("Yearly Resgatado!")
          .setDescription(
            `Você resgatou \`${economy.coinsymb}:${amount}\` em seu yearly.\nUtilize o comando \`/wallet\` para ver seu total de ${economy.coinname}s.`
          )
          .setFooter({
            text: `${economy.coinname} (${economy.coinsymb}).`,
            iconURL: `${economy.coinicon}`,
          });

        interaction.reply({ embeds: [embed] });
      }
    } catch {
      let errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Erro ao resgatar!")
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `Não foi possível resgatar seus ${economy.coinname}s, tente novamente mais tarde.`
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
