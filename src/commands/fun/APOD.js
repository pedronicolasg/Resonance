const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const {
  hxmaincolor,
  success,
  error,
  hxnasaapod,
} = require("../../themes/main");
const { logger } = require("../../events/client/logger");
const API =
  "https://api.nasa.gov/planetary/apod?api_key=" + process.env.NASAKEY;
const NASALogo =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/2449px-NASA_logo.svg.png";

module.exports = {
  name: "apod",
  description: "Envia a imagem astronômica da data escolhida",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "data",
      description: "Insira uma data na ordem: ANO-MÊS-DIA.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  run: async (client, interaction) => {
    let res,
      data,
      date = interaction.options.getString("data");
    if (date === null) {
      res = await fetch(API);
      data = await res.json();
    } else {
      res = await fetch(`${API}&date=${date}`);
      data = await res.json();
    }

    try {
      const Embed = new EmbedBuilder()
        .setColor(hxnasaapod)
        .setTitle(data.title)
        .setURL("https://api.nasa.gov/")
        .setAuthor({
          name: "NASA",
          iconURL: NASALogo,
          url: "https://api.nasa.gov/",
        })
        .setDescription(data.explanation)
        .setImage(data.url)
        .addFields(
          { name: "Data", value: data.date, inline: true },
          { name: "Tipo de mídia", value: data.media_type, inline: true },
          { name: "HD", value: data.hdurl, inline: true }
        )
        .setFooter({
          text: `NASA API | APOD ${data.service_version}.`,
          iconURL: NASALogo,
        });

      interaction.reply({ embeds: [Embed] });
    } catch (e) {
      const ErrorEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Erro inesperado")
        .setURL("https://api.nasa.gov/")
        .setAuthor({
          name: "NASA",
          iconURL: "https://api.nasa.gov/assets/img/favicons/favicon-192.png",
          url: "https://api.nasa.gov/",
        })
        .setDescription(
          `Ocorreu um erro inesperado, tente novamente mais tarde.`
        )
        .setFooter({
          text: `NASA API | APOD ${data.service_version}.`,
          iconURL: NASALogo,
        });

      interaction.reply({ embeds: [ErrorEmbed], ephemeral: true });
      console.log(error("Erro ") + `ao executar o comando APOD:\n ${e}`);
      logger.error(`Erro ao executar o comando APOD: ${e}`);
    }
  },
};
