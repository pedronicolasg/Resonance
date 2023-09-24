const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const { economy } = require("../../config.json");
const { hxmaincolor, success, error } = require("../../themes/main");
const { logger } = require("../../events/client/logger");

const Wallet = require("../../database/models/wallet");

module.exports = {
  name: "wallet",
  description: `Verifique a quantidade de ${economy.coinname}s em sua carteira.`,
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "usuário",
      type: ApplicationCommandOptionType.User,
      description: "Verifique a carteira de um usuário.",
      required: false,
    },
  ],

  run: async (client, interaction, args) => {
    let user = interaction.options.getUser("usuário") || interaction.user;

    try {
      const userData = await Wallet.findOne({ userId: user.id });
      let quantidade = userData ? userData.coins : 0;

      let embed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle("💸 Carteira")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `${
            user === interaction.user
              ? "Você tem"
              : `O usuário ${user} (${user.id}) tem`
          } \`${economy.coinsymb}:${quantidade}\` em sua carteira.`
        )
        .setFooter({
          text: `${economy.coinname} (${economy.coinsymb}).`,
          iconURL: `${economy.coinicon}`,
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

      let errorembed = new EmbedBuilder()
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
