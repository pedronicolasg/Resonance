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

    const embed = new EmbedBuilder()
      .setColor(hxmaincolor)
      .setTitle(`Avatar de ${user.username}`)
      .setImage(avatarURL);

    try {
      interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.log(
        error("Erro ") + `ao executar o comando /avatar devido à:\n ${error}`
      );
      logger.error(`Erro ao executar o comando /avatar devido à:\n ${error}`);
    }
  },
};
