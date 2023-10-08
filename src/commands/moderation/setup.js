const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const ServerSettings = require("../../database/models/servercfg.js");
const {
  hxmaincolor,
  success,
  error,
  hxnasaapod,
} = require("../../themes/main");
const { logger } = require("../../events/client/logger.js");

module.exports = {
  name: "setup",
  description: "Indique ao bot os IDs do seu servidor.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "log_channel_id",
      description: "ID do canal de Logs.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "ads_channel_id",
      description: "ID do canal de anúncios.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "exit_channel_id",
      description: "ID do canal de saídas.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "rules_channel_id",
      description: "ID do canal de regras.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "games_channel_id",
      description: "ID do canal de jogos",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "welcome_channel_id",
      description: "ID do canal de boas-vindas.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "suggestion_channel_id",
      description: "ID do canal de sugestões.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  run: async (client, interaction) => {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      let warnEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("Você não possui permissão para utilizar este comando.")
        .setDescription(
          `Você precisa da permissão "Administrador" para usar esse comando`
        );

      return interaction.reply({ embeds: [warnEmbed], ephemeral: true });
    }

    const serverId = interaction.guild.id;
    const logchannelId = interaction.options.getString("log_channel_id");
    const adschannelId = interaction.options.getString("ads_channel_id");
    const exitchannelId = interaction.options.getString("exit_channel_id");
    const ruleschannelId = interaction.options.getString("rules_channel_id");
    const gameschannelId = interaction.options.getString("games_channel_id");
    const welcomechannelId = interaction.options.getString("welcome_channel_id");
    const suggestionchannelId = interaction.options.getString("suggestion_channel_id");

    try {
      let serverSettings = await ServerSettings.findOne({ serverId });

      if (!serverSettings) {
        serverSettings = new ServerSettings({ serverId });
      }

      if (logchannelId !== undefined)
        serverSettings.logchannelId = logchannelId;
      if (adschannelId !== undefined)
        serverSettings.adschannelId = adschannelId;
      if (exitchannelId !== undefined)
        serverSettings.exitchannelId = exitchannelId;
      if (ruleschannelId !== undefined)
        serverSettings.ruleschannelId = ruleschannelId;
      if (gameschannelId !== undefined)
        serverSettings.gameschannelId = gameschannelId;
      if (welcomechannelId !== undefined)
        serverSettings.welcomechannelId = welcomechannelId;
      if (suggestionchannelId !== undefined)
        serverSettings.suggestionchannelId = suggestionchannelId;

      await serverSettings.save();

      let embed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle("Sucesso ao definir os IDs")
        .setDescription(
          `IDs dos canais foram definidos com sucesso! Use /serverinfo para ver as configurações`
        );

      interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (e) {
      console.log(error("Erro ") + `ao definir os IDs dos canais: `, e);
      logger.error(`Erro ao definir os IDs dos canais: `, e);
      let errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Erro ao definir os IDs.")
        .setDescription(`Erro ao definir os IDs dos canais.`);

      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
