const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { hxmaincolor, success, error } = require("../../themes/main");
const { logger } = require("../../events/client/logger");
const ServerSettings = require("../../database/models/servercfg");

module.exports = {
  name: "unban",
  description: "Revoga o banimento de um usuário.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "user",
      description: "Mencione um usuário para ser revogado o banimento.",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "motivo",
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

    const serverSettings = await ServerSettings.findOne({
      serverId: interaction.guild.id,
    });

    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("motivo") || "Não definido.";

    let embed = new EmbedBuilder()
      .setColor(hxmaincolor)
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `O banimento do usuário ${user} (\`${user.id}\`) foi revogado com sucesso!`
      );

    let error = new EmbedBuilder()
      .setColor("Red")
      .setTitle("Erro ao revogar banimento de um usuário.")
      .setDescription(
        `Não foi possível revogar o banimento do usuário ${user} (\`${user.id}\`) no servidor!`
      );

    try {
      await interaction.guild.members.unban(user, { reason });

      const channelId = serverSettings.logchannelId;
      const channel = client.channels.cache.get(channelId);

      if (channel) {
        channel.send({ embeds: [embed] });
      }

      interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (e) {
      interaction.reply({ embeds: [error], ephemeral: true });
      console.log(error(`Erro `) + `ao revogar banimento de ${user}: ${e}`);
      logger.error(`Erro ao revogar banimento de ${user}: ${e}`);
    }
  },
};
