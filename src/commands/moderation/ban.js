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
      name: "motivo",
      description: "Insira um motivo.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      let permembed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Você não possui permissão para utilizar este comando.")
        .setDescription(
          `Você precisa da permissão "Banir Membros" para usar esse comando`
        );

      return interaction.reply({ embeds: [permembed], ephemeral: true });
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
        `O usuário ${user} (\`${user.id}\`) foi banido com sucesso!`
      );

    let error = new EmbedBuilder()
      .setColor("Red")
      .setTitle("❌ Erro ao banir um usuário.")
      .setDescription(
        `Não foi possível banir o usuário ${user} (\`${user.id}\`) do servidor!`
      );

    try {
      await interaction.guild.members.ban(user, { reason });

      const channelId = serverSettings.logchannelId;
      const channel = client.channels.cache.get(channelId);

      if (channel) {
        channel.send({ embeds: [embed] });
      }

      interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (e) {
      interaction.reply({ embeds: [error], ephemeral: true });
      console.log(error(`Erro `) + `ao banir ${user}: ${e}`);
      logger.error(`Erro ao banir ${user}: ${e}`);
    }
  },
};
