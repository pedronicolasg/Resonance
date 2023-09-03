const Discord = require("discord.js");
const config = require("../../config.json");
const themes = require("../../themes/chalk-themes");
const apptheme = require("../../themes/theme.json");
const { logger } = require("../../events/client/logger");

module.exports = {
  name: "status",
  description: `Mostra os status do bot.`,
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction, args) => {
    const ping = client.ws.ping;

    const usedRam = process.memoryUsage().heapUsed / 1024 / 1024;
    const maxRam = process.memoryUsage().heapTotal / 1024 / 1024;

    const cpuUsage = process.cpuUsage().user / process.cpuUsage().system / 100;

    const embed = new Discord.EmbedBuilder()
      .setColor(`#48deff`)
      .setTitle(`Status do bot:`)
      .addFields(
        { name: "🏓 Ping", value: `${ping}ms`, inline: true },
        {
          name: "💾 RAM",
          value: `${usedRam.toFixed(2)}MB / ${maxRam.toFixed(2)}MB`,
          inline: true,
        },
        { name: ":gear:  CPU", value: `${cpuUsage.toFixed(2)}%`, inline: true }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
