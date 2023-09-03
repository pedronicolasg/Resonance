const Discord = require("discord.js");
const themes = require("../../themes/chalk-themes");
const apptheme = require("../../themes/theme.json");
const { logger } = require("../../events/client/logger");
const ServerSettings = require("../../database/models/servercfg");

module.exports = {
  name: "kick",
  description: "Expulsa um usuário.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "user",
      description: "Mencione um usuário para ser expulso.",
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "motivo",
      description: "Insira um motivo.",
      type: Discord.ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  run: async (client, interaction) => {
    if (
      !interaction.member.permissions.has(
        Discord.PermissionFlagsBits.KickMembers
      )
    ) {
      let permembed = new Discord.EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Você não possui permissão para utilizar este comando.")
        .setDescription(
          `Você precisa da permissão "Expulsar Membros" para usar esse comando`
        );

      return interaction.reply({ embeds: [permembed], ephemeral: true });
    }

    const serverSettings = await ServerSettings.findOne({
      serverId: interaction.guild.id,
    });

    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("motivo") || "Não definido.";

    let embed = new Discord.EmbedBuilder()
      .setColor(apptheme.maincolor)
      .setAuthor({
        name: interaction.user,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `O usuário ${user} (\`${user.id}\`) foi expulso com sucesso!`
      );

    let error = new Discord.EmbedBuilder()
      .setColor("Red")
      .setTitle("❌ Erro ao expulsar um usuário.")
      .setDescription(
        `Não foi possível expulsar o usuário ${user} (\`${user.id}\`) do servidor!`
      );

    try {
      await interaction.guild.members.kick(user, { reason });

      const channelId = serverSettings.logchannelId;
      const channel = client.channels.cache.get(channelId);

      if (channel) {
        channel.send({ embeds: [embed] });
      }

      interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (e) {
      interaction.reply({ embeds: [error], ephemeral: true });
      console.log(themes.error(`Erro `) + `ao expulsar ${user}:\n ${e}`);
      logger.error(`Erro ao expulsar ${user}: ${e}`);
    }
  },
};
