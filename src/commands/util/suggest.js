const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const ServerSettings = require("../../database/models/servercfg");
const { hxmaincolor, success, error } = require("../../themes/main");
const { logger } = require("../../events/client/logger");
const config = require("../../config.json");

module.exports = {
  name: "suggest",
  description: "Faça sua sugestão.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "sugestão",
      description: "Escreva algo.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    try {
      const serverId = interaction.guild.id;
      const serverSettings = await ServerSettings.findOne({ serverId });

      if (serverSettings && serverSettings.suggestionchannelId) {
        const suggestionChannelId = serverSettings.suggestionchannelId;
        const suggestionChannel =
          interaction.guild.channels.cache.get(suggestionChannelId);

        if (!suggestionChannel) {
          let errorchannelembed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Canal não configurado.")
            .setDescription(
              `${interaction.user}, o canal de sugestões ainda não foi configurado para este servidor! Peça a um Staff para configurá-lo.`
            );

          interaction.reply({ embeds: [errorchannelembed], ephemeral: true });
        } else {
          const suggestion = interaction.options.getString("sugestão");
          let embed = new EmbedBuilder()
            .setColor(hxmaincolor)
            .setAuthor({
              name: interaction.user.username,
              iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setTitle("Nova sugestão!")
            .setDescription(
              `**Sugestão de ${interaction.user}:**\n${suggestion}`
            );

          suggestionChannel
            .send({ embeds: [embed] })
            .then(() => {
              let embed = new EmbedBuilder()
                .setColor(hxmaincolor)
                .setTitle("✅ Sugestão enviada")
                .setDescription(
                  `${interaction.user}, sua sugestão foi publicada em ${suggestionChannel} com sucesso!`
                );
              interaction.reply({ embeds: [embed], ephemeral: true });
            })
            .catch((e) => {
              console.log(
                error("Erro ") +
                  `ao enviar a sugestão de ${interaction.user} devido a:\n ${e}`
              );
              logger.error(
                `Erro ao enviar a sugestão de ${interaction.user} devido a:\n ${e}`
              );
              let errorEmbed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("Ops...")
                .setDescription(
                  `${interaction.user}, não foi possível enviar sua sugestão! Tente novamente mais tarde ou contate um Staff.`
                );

              interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            });
        }
      } else {
        console.log(
          error("Erro: ") +
            `Configurações ou canal de sugestões não encontrados para o servidor '${interaction.guild.name} (${serverId})`
        );
        logger.error(
          `Erro: Configurações ou canal de sugestões não encontrados para o servidor '${interaction.guild.name} (${serverId})`
        );
      }
    } catch (e) {
      console.log(
        error("Erro ") + `ao buscar as configurações no MongoDB: ${e}`
      );
      logger.error(`Erro ao buscar as configurações no MongoDB: ${e}`);
    }
  },
};
