const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const { hxmaincolor, success, error } = require("../../themes/main");
const { logger } = require("../../events/client/logger");
const config = require("../../config.json");

module.exports = {
  name: "botinfo",
  description: "Exibe informações sobre o bot.",
  type: ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    const owner = client.users.cache.get(config.owner);
    const members = client.users.cache.size;
    const servers = client.guilds.cache.size;
    const channels = client.channels.cache.size;
    const bot = client.user;
    const avatarBot = bot.displayAvatarURL({ dynamic: true });
    const technologies = config.technologies;
    const ping = client.ws.ping;

    const embed = new EmbedBuilder()
      .setColor(hxmaincolor)
      .setAuthor({ name: bot.tag, iconURL: avatarBot })
      .setThumbnail(avatarBot)
      .setDescription(
        `Olá ${interaction.user}, abaixo estão as informações sobre mim:\n\n`
      )
      .addFields(
        { name: "🤖 Nome", value: `\`${bot.tag}\``, inline: true },
        { name: "🤖 Dono", value: `${owner}`, inline: true },
        { name: "⚙️ Membros", value: `\`${members}\``, inline: true },
        { name: "⚙️ Servidores", value: `\`${servers}\``, inline: true },
        { name: "⚙️ Canais", value: `\`${channels}\``, inline: true },
        { name: "⚙️ Ping", value: `\`${ping}ms\``, inline: true },
        { name: "📚 Tecnologias", value: `\`${technologies}\``, inline: true }
      )
      .setFooter({ text: bot.tag, iconURL: avatarBot })
      .setTimestamp();

    interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
