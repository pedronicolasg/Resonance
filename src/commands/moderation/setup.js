const Discord = require("discord.js");
const ServerSettings = require('../../database/models/servercfg.js');
const themes = require('../../themes/chalk-themes.js');
const apptheme = require('../../themes/theme.json');
const { logger } = require('../../events/client/logger.js');

module.exports = {
  name: "setup",
  description: "Indique ao bot os IDs do seu servidor.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "log_channel_id",
      description: "ID do canal de Logs.",
      type: Discord.ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "ads_channel_id",
      description: "ID do canal de anúncios.",
      type: Discord.ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "exit_channel_id",
      description: "ID do canal de saídas.",
      type: Discord.ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "rules_channel_id",
      description: "ID do canal de regras.",
      type: Discord.ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "welcome_channel_id",
      description: "ID do canal de boas-vindas.",
      type: Discord.ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "suggestion_channel_id",
      description: "ID do canal de sugestões.",
      type: Discord.ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
      let permembed = new Discord.EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Você não possui permissão para utilizar este comando.")
        .setDescription(`Você precisa da permissão "Administrador" para usar esse comando`);

      return interaction.reply({ embeds: [permembed], ephemeral: true });
    }

    const serverId = interaction.guild.id;
    const logchannelId = interaction.options.getString("log_channel_id");
    const adschannelId = interaction.options.getString("ads_channel_id");
    const exitchannelId = interaction.options.getString("exit_channel_id");
    const ruleschannelId = interaction.options.getString("rules_channel_id");
    const welcomechannelId = interaction.options.getString("welcome_channel_id");
    const suggestionchannelId = interaction.options.getString("suggestion_channel_id");

    try {
      let serverSettings = await ServerSettings.findOne({ serverId });

      if (!serverSettings) {
        serverSettings = new ServerSettings({ serverId });
      }

      // Adicione verificações para cada campo antes de defini-los em serverSettings
      if (logchannelId !== undefined) serverSettings.logchannelId = logchannelId;
      if (adschannelId !== undefined) serverSettings.adschannelId = adschannelId;
      if (exitchannelId !== undefined) serverSettings.exitchannelId = exitchannelId;
      if (ruleschannelId !== undefined) serverSettings.ruleschannelId = ruleschannelId;
      if (welcomechannelId !== undefined) serverSettings.welcomechannelId = welcomechannelId;
      if (suggestionchannelId !== undefined) serverSettings.suggestionchannelId = suggestionchannelId;

      await serverSettings.save();

      const embed = new Discord.EmbedBuilder()
        .setColor(apptheme.maincolor)
        .setTitle("Sucesso ao definir os IDs")
        .setDescription(`IDs dos canais foram definidos com sucesso! Use /serverinfo para ver as configurações`);

      interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (e) {
      console.log(themes.error("Erro ") + `ao definir os IDs dos canais: `, e);
      logger.error(`Erro ao definir os IDs dos canais: `, e);
      let errorembed = new Discord.EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Erro ao definir os IDs.")
        .setDescription(`Erro ao definir os IDs dos canais.`);

      interaction.reply({ embeds: [errorembed], ephemeral: true });

    }
  },
};
