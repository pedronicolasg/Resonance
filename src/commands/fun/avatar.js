const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const { hxmaincolor, success, error } = require("../../themes/main");
const { logger } = require("../../events/client/logger");

module.exports = {
  name: "avatar",
  description: "Visualiza o avatar do usuário desejado.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "usuário",
      description: "Usuário que você deseja ver o avatar.",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],

  run: async (client, interaction) => {
    const user = interaction.options.getUser("usuário") || interaction.user;
    const avatarURL = user.displayAvatarURL({ dynamic: true, size: 2048 });

    let embed = new EmbedBuilder()
      .setColor(hxmaincolor)
      .setTitle(`Avatar de ${user.username}`)
      .setImage(avatarURL);

    try {
      interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (e) {
      let errorEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Erro inesperado")
        .setDescription(
          `Ocorreu um erro inesperado, tente novamente mais tarde.`
        )
      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      console.log(
        error("Erro ") + `ao executar o comando /avatar devido à:\n ${e}`
      );
      logger.error(`Erro ao executar o comando /avatar devido à:\n ${e}`);
    }
  },
};
