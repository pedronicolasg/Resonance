const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const ServerSettings = require("../../database/models/servercfg");
const { hxmaincolor, success, error } = require("../../themes/main");
const { sendLogEmbed, logger } = require("../../methods/loggers");

module.exports = {
  name: "unlock",
  description: "Desbloqueie um canal.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "canal",
      description: "Mencione um canal para o desbloquear o chat.",
      type: ApplicationCommandOptionType.Channel,
      required: false,
    },
  ],

  run: async (client, interaction) => {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)
    ) {
      let warnEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("Você não possui permissão para utilizar este comando.")
        .setDescription(
          `Você precisa da permissão "Gerenciar Canais" para usar esse comando`
        );

      return interaction.reply({ embeds: [warnEmbed], ephemeral: true });
    }

    const channel =
      interaction.options.getChannel("canal") || interaction.channel.id;
    if (!channel.isTextBased()) {
      let errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Algo deu errado ao desbloquear o canal.")
        .setDescription(`O canal não é de texto.`);
      return interaction.reply({
        embeds: [errorEmbed],
        ephemeral: true,
      });
    }
    channel.permissionOverwrites
      .edit(interaction.guild.id, { SendMessages: true })
      .then(() => {
        let embed = new EmbedBuilder()
          .setColor(hxmaincolor)
          .setDescription(
            `🔒 O canal de texto ${channel} foi desbloqueado por ${interaction.user}.`
          );
        interaction.reply({ embeds: [embed] });
        sendLogEmbed(client, interaction.guild.id, embed);

        let channelembed = new EmbedBuilder()
          .setColor(hxmaincolor)
          .setDescription(
            `🔓 Este canal foi desbloqueado por ${interaction.user}.`
          );
        if (channel.id !== interaction.channel.id)
          return channel.send({ embeds: [channelembed] });
      })
      .catch((e) => {
        let error = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Erro ao desbloquear o canal.")
          .setDescription(
            `Não foi possível desbloquear o canal: ${channel.name}!`
          );
        interaction.reply({ embeds: [error], ephemeral: true });
        console.log(
          error("Erro ") + `ao desbloquear o canal ${channel} devido à: ${e}`
        );
        logger.error(`Erro ao desbloquear o canal ${channel} devido à: ${e}`);
      });
  },
};
