const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { hxmaincolor, success, error } = require("../../themes/main");
const { sendLogEmbed, logger } = require("../../methods/loggers");

module.exports = {
  name: "kick",
  description: "Expulsa um usuário.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "user",
      description: "Mencione um usuário para ser expulso.",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      let warnEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("Você não possui permissão para utilizar este comando.")
        .setDescription(
          `Você precisa da permissão "Expulsar Membros" para usar esse comando`
        );

      return interaction.reply({ embeds: [warnEmbed], ephemeral: true });
    }

    const user = interaction.options.getUser("user");

    let embed = new EmbedBuilder()
      .setColor(hxmaincolor)
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `O usuário ${user.username} (\`${user.id}\`) foi expulso.`
      );

    try {
      interaction.reply({ embeds: [embed], ephemeral: true });
      await interaction.guild.members.kick(user);
      sendLogEmbed(client, interaction.guild.id, embed);
    } catch (e) {
      let error = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Erro ao expulsar um usuário.")
        .setDescription(
          `Não foi possível expulsar o usuário ${user} (\`${user.id}\`) do servidor!`
        );
      console.log(error(`Erro `) + `ao expulsar ${user}: ${e}`);
      logger.error(`Erro ao expulsar ${user}: ${e}`);
      interaction.reply({ embeds: [error], ephemeral: true });
    }
  },
};
