const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { hxmaincolor, error } = require("../../themes/main");
const { sendLogEmbed, logger } = require("../../methods/loggers");

module.exports = {
  name: "ban",
  description: "Banir um usuário.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "user",
      description: "Mencione um usuário para ser banido.",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "Insira um motivo.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      let warnEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("Você não possui permissão para utilizar este comando.")
        .setDescription(
          `Você precisa da permissão "Banir Membros" para usar esse comando`
        );

      return interaction.reply({ embeds: [warnEmbed], ephemeral: true });
    }

    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "Não definido.";

    let embed = new EmbedBuilder()
      .setColor(hxmaincolor)
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `O usuário ${user} (\`${user.id}\`) foi banido com sucesso!`
      );

    try {
      interaction.reply({ embeds: [embed], ephemeral: true });
      await interaction.guild.members.ban(user, { reason });

      sendLogEmbed(client, interaction.guild.id, embed);
    } catch (e) {
      let embedError = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Erro ao banir um usuário.")
        .setDescription(
          `Não foi possível banir o usuário ${user} (\`${user.id}\`) do servidor!`
        );
      console.log(
        error(`Erro `) +
          `ao banir ${user} no servidor ${interaction.guild.id} devido à:\n ${e}`
      );
      logger.error(
        `Erro ao banir ${user} no servidor ${interaction.guild.id} devido à: ${e}`
      );
      interaction.reply({ embeds: [embedError], ephemeral: true });
    }
  },
};
