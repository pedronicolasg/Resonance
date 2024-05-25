const { ApplicationCommandType, EmbedBuilder } = require("discord.js");
const { hxmaincolor } = require("../../themes/main");
require('dotenv').config();

module.exports = {
  name: "botinfo",
  description: "Exibe informações sobre o bot.",
  type: ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    const botOwner = client.users.cache.get(process.env.OWNER);
    const members = client.users.cache.size;
    const servers = client.guilds.cache.size;
    const channels = client.channels.cache.size;
    const bot = client.user;
    const avatarBot = bot.displayAvatarURL({ dynamic: true });
    const botTechnologies = process.env.TECHNOLOGIES;
    const ping = client.ws.ping;

    const embed = new EmbedBuilder()
      .setColor(hxmaincolor)
      .setTitle(process.env.NAME)
      .setThumbnail(avatarBot)
      .setDescription(
        `Olá ${interaction.user}, abaixo estão as informações sobre mim:\n\n`
      )
      .addFields(
        { name: "🤖 Nome", value: `\`${bot.tag}\``, inline: true },
        { name: ":man_technologist: Dono", value: `${botOwner}`, inline: true },
        { name: "🌐 Site", value: process.env.WEBSITE, inline: true },
        { name: "⚙️ Membros", value: `\`${members}\``, inline: true },
        { name: "⚙️ Servidores", value: `\`${servers}\``, inline: true },
        { name: "⚙️ Canais", value: `\`${channels}\``, inline: true },
        { name: "⚙️ Ping", value: `\`${ping}ms\``, inline: true },
        {
          name: "📚 Tecnologias",
          value: `\`${botTechnologies}\``,
          inline: true,
        }
      )
      .setFooter({ text: `${process.env.NAME} V${process.env.VERSION}`, iconURL: avatarBot })
      .setTimestamp();

    interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
