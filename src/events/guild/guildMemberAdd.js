const { EmbedBuilder, Events } = require("discord.js");
const { hxmaincolor } = require("../../themes/main");
const client = require("../../index");

const ServerSettings = require("../../database/models/servercfg");

client.on(Events.GuildMemberAdd, async (member) => {
  const serverSettings = await ServerSettings.findOne({
    serverId: member.guild.id,
  });
  const welcomeChannel = client.channels.cache.get(serverSettings.welcomechannelId);
  const welcomeMessage = serverSettings.welcomeMessage;

  if (welcomeChannel) {
    if (welcomeMessage) {
      let embed = new EmbedBuilder()
        .setColor(member.displayHexColor)
        .setTitle(`Boas vindas ${member.displayName}!`)
        .setThumbnail(member.displayAvatarURL({ dynamic: true, size: 2048 }))
        .setDescription(welcomeMessage)
        .setTimestamp();

      await welcomeChannel.send({ embeds: [embed] });
    } else {
      let embed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle(`Boas vindas ${member.displayName}!`)
        .setThumbnail(member.displayAvatarURL({ dynamic: true, size: 2048 }))
        .setDescription(`Olá ${member} 👋 boas-vindas ao servidor!`)
        .setTimestamp();

      await welcomeChannel.send({ embeds: [embed] });
    }
  }
});

