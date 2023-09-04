const Discord = require("discord.js");
const ecoCfg = require("./economycfg.json");
const themes = require("../../themes/chalk-themes");
const apptheme = require("../../themes/theme.json");
const { logger } = require("../../events/client/logger");

const Wallet = require("../../database/models/wallet");

module.exports = {
  name: "wallet",
  description: `Verifique a quantidade de ${ecoCfg.coinname}s em sua carteira.`,
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "usuário",
      type: Discord.ApplicationCommandOptionType.User,
      description: "Verifique a carteira de um usuário.",
      required: false,
    },
  ],

  run: async (client, interaction, args) => {
    let user = interaction.options.getUser("usuário") || interaction.user;

    try {
      const userData = await Wallet.findOne({ userId: user.id });
      let quantidade = userData ? userData.coins : 0;

      let embed = new Discord.EmbedBuilder()
        .setColor("Yellow")
        .setTitle("💸 Carteira")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `${
            user === interaction.user
              ? "Você tem"
              : `O usuário ${user} (${user.id}) tem`
          } \`${ecoCfg.coinsymb}:${quantidade}\` em sua carteira.`
        )
        .setFooter({
          text: `${ecoCfg.coinname} (${ecoCfg.coinsymb}).`,
          iconURL: ecoCfg.coinicon,
        });

      interaction.reply({
        embeds: [embed],
        ephemeral: user !== interaction.user,
      });
    } catch (e) {
      console.log(
        themes.error("Erro ") +
          `ao buscar a carteira de ${user.username}(${user.id}) devido a:\n ${e}`
      );
      logger.error(
        `Erro ao buscar a carteira de ${user.username}(${user.id}) devido a: ${e}`
      );

      let errorembed = new Discord.EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Erro ao verificar a carteira!")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `Não foi possível verificar a carteira, tente novamente mais tarde.`
        );

      interaction.reply({ embeds: [errorembed] });
    }
  },
};
