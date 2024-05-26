const Discord = require("discord.js");
const { ApplicationCommandType } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const { hxmaincolor } = require("../../themes/main");

module.exports = {
  name: "qr",
  description: "Cria um QR Code com duração de 72 horas.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "url",
      description: "Insira o link que deseja transformar em QR Code.",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  run: async (client, interaction) => {
    const url = interaction.options.getString("url");

    const Embed = new EmbedBuilder()
      .setColor(hxmaincolor)
      .setTitle(`QR Code gerado com sucesso:`)
      .setThumbnail(`https://qrtag.net/api/qr_7.png?url=${url}`)
      .setURL(`https://qrtag.net/api/qr_7.png?url=${url}`)
      .setDescription("O QR Code expira em 72 horas.")
      .setAuthor({
        name: "QR tag",
        iconURL: "https://www.qrtag.net/favicon-32x32.png",
        url: "https://www.qrtag.net/",
      });

    interaction.reply({ embeds: [Embed], ephemeral: true });
  },
};
