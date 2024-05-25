const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
require('dotenv').config();
const { hxmaincolor, error } = require("../../themes/main");
const { logger } = require("../../methods/loggers");
const { getWallet } = require("../../methods/DB/economy");

module.exports = {
  name: "wallet",
  description: `Verifique a quantidade de ${process.env.ECONOMY_COINNAME}s em sua carteira.`,
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "usuário",
      type: ApplicationCommandOptionType.User,
      description: "Verifique a carteira de um usuário.",
      required: false,
    },
  ],

  run: async (client, interaction) => {
    let user = interaction.options.getUser("usuário") || interaction.user;

    try {
      const userWallet = await getWallet(user.id);
      let amount = userWallet ? userWallet.coins : 0;

      let embed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle("Carteira")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `${user === interaction.user
            ? "Você tem"
            : `O usuário ${user} tem`
          } \`${process.env.ECONOMY_COINSYMB}:${amount}\` na carteira.`
        )
        .setFooter({
          text: `${process.env.ECONOMY_COINNAME} (${process.env.ECONOMY_COINSYMB}).`,
          iconURL: `${process.env.ECONOMY_COINICON}`,
        });

      interaction.reply({
        embeds: [embed],
        ephemeral: user !== interaction.user,
      });
    } catch (e) {
      console.log(
        error("Erro ") +
        `ao buscar a carteira de ${user.username}(${user.id}) devido a: ${e}`
      );
      logger.error(
        `Erro ao buscar a carteira de ${user.username}(${user.id}) devido a: ${e}`
      );

      let errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Erro ao verificar a carteira!")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `Não foi possível verificar a carteira, tente novamente mais tarde.`
        );

      interaction.reply({ embeds: [errorEmbed] });
    }
  },
};
