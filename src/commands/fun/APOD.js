const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const { error, hxnasaapod } = require("../../themes/main");
const { logger } = require("../../methods/loggers");
const fetch = require("node-fetch");

const API = `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASAKEY}`;
const NASALogo = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/2449px-NASA_logo.svg.png";

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
    const date = interaction.options.getString("data");
    const url = date ? `${API}&date=${date}` : API;

    try {
      const res = await fetch(url);
      const data = await res.json();

      const embed = new EmbedBuilder()
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
          { name: "HD", value: data.hdurl || "Não disponível", inline: true }
        )
        .setFooter({
          text: `NASA API | APOD ${data.service_version}.`,
          iconURL: NASALogo,
        });

      interaction.reply({ embeds: [embed] });
    } catch (e) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Erro inesperado")
        .setDescription("Ocorreu um erro inesperado, tente novamente mais tarde.");

      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      console.log(error("Erro ") + `ao executar o comando APOD:\n ${e}`);
      logger.error(`Erro ao executar o comando APOD: ${e}`);
    }
  },
};
