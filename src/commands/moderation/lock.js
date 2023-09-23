const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const ServerSettings = require("../../database/models/servercfg");
const { hxmaincolor, success, error } = require("../../themes/main");
const { logger } = require("../../events/client/logger");

module.exports = {
  name: "lock",
  description: "Bloqueie um canal.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "canal",
      description: "Mencione um canal para o bloquear o chat.",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)
    ) {
      let permembed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Você não possui permissão para utilizar este comando.")
        .setDescription(
          `Você precisa da permissão "Gerencias Canais" para usar esse comando`
        );

      return interaction.reply({ embeds: [permembed], ephemeral: true });
    }

    const serverSettings = await ServerSettings.findOne({
      serverId: interaction.guild.id,
    });

    const channel = interaction.options.getChannel("canal");
    if (!channel.isTextBased()) {
      let nottextchannelembed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Algo deu errado ao bloquear o canal.")
        .setDescription(`O canal não é de texto.`);
      return interaction.reply({
        embeds: [nottextchannelembed],
        ephemeral: true,
      });
    }
    const channelId = serverSettings.logchannelId;
    const logchannel = client.channels.cache.get(channelId);

    channel.permissionOverwrites
      .edit(interaction.guild.id, { SendMessages: false })
      .then(() => {
        let embed = new EmbedBuilder()
          .setColor(hxmaincolor)
          .setDescription(
            `🔒 O canal de texto ${channel} foi bloqueado por ${interaction.user}.`
          );
        interaction.reply({ embeds: [embed] });

        if (logchannel) {
          logchannel.send({ embeds: [embed] });
        }

        let channelembed = new EmbedBuilder()
          .setColor(hxmaincolor)
          .setDescription(
            `🔒 Este canal foi bloqueado por ${interaction.user}.`
          );
        if (channel.id !== interaction.channel.id)
          return channel.send({ embeds: [channelembed] });
      })
      .catch((e) => {
        let error = new EmbedBuilder()
          .setColor("Red")
          .setTitle("❌ Erro ao bloquear o canal.")
          .setDescription(
            `Não foi possível bloquear o canal: ${channel.name}!`
          );
        interaction.reply({ embeds: [error], ephemeral: true });
        console.log(
          error("Erro ") + `ao bloquear o canal ${channel} devido à: ${e}`
        );
        logger.error(`Erro ao bloquear o canal ${channel} devido à: ${e}`);
      });
  },
};
