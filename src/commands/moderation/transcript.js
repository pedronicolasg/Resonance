const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { createTranscript } = require("discord-html-transcripts");
const { hxmaincolor, success, error } = require("../../themes/main");
const { logger } = require("../../events/client/logger");
const config = require("../../config.json");
const ServerSettings = require("../../database/models/servercfg");

module.exports = {
  name: "transcript",
  description: "Transcreve as últimas 200 mensagens canal desejado em uma página html",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "canal",
      description: "Mencione um canal para o transcrever.",
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

    const serverSettings = await ServerSettings.findOne({
      serverId: interaction.guild.id,
    });

    function getCurrentDate() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    const currentDate = getCurrentDate();

    const channelTrscpt = interaction.options.getChannel("canal") || interaction.channel.id;
    if (!channelTrscpt.isTextBased()) {
      let errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Algo deu errado ao transcrever o canal.")
        .setDescription(`O canal não é de texto.`);
      return interaction.reply({
        embeds: [errorEmbed],
        ephemeral: true,
      });
    }
    try {
      let embed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setDescription(`Criando transcript do canal ${channelTrscpt}...`);

      interaction.reply({ embeds: [embed], ephemeral: true }).then(() => {
        setTimeout(async () => {
          const attachement = await createTranscript(channelTrscpt, {
            limit: 200,
            returnType: "attachement",
            filename: `${channelTrscpt.id}_${currentDate}.html`,
            saveImages: true,
            footerText: "Foram exportadas {number} mensagens!",
            poweredBy: false,
          });

          embed.setDescription(
            `Transcript do canal ${channelTrscpt.name} criado:`
          );
          interaction.editReply({ embeds: [embed], files: [attachement] });

          const logchannel = client.channels.cache.get(serverSettings.logchannelId);
          if (logchannel) {
            let logEmbed = new EmbedBuilder()
              .setColor("#48deff")
              .setDescription(
                `Um transcript do canal ${channelTrscpt} foi criado por ${interaction.user}`
              );
            logchannel.send({ embeds: [logEmbed], files: [attachement] });
          }
        }, 1500);
      });
    } catch (e) {
      let error = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`Erro ao transcrever o canal`)
        .setDescription(
          `Não foi possível bloquear o canal: ${channelTrscpt.name}.!`
        );
      interaction.reply({ embeds: [error], ephemeral: true });
      console.log(
        error("Erro ") +
          `ao transcrever o canal ${channelTrscpt.name} devido à:\n ${e}`
      );
      logger.error(
        `Erro ao transcrever o canal ${channelTrscpt.name} devido à:\n ${e}`
      );
    }
  },
};
