const { EmbedBuilder, Events } = require("discord.js");
const { hxmaincolor } = require("../../themes/main");
const client = require("../../index");

const ServerSettings = require("../../database/models/servercfg");

client.on(Events.GuildMemberRemove, async (member) => {
  const serverSettings = await ServerSettings.findOne({
    serverId: member.guild.id,
  });
  const exitChannel = client.channels.cache.get(serverSettings.exitchannelId);
  const exitMessage = serverSettings.exitMessage;

  if (exitChannel) {
    if (exitMessage) {
      let embed = new EmbedBuilder()
        .setColor(member.displayHexColor)
        .setTitle(`Tchau ${member.displayName}!`)
        .setThumbnail(member.displayAvatarURL({ dynamic: true, size: 2048 }))
        .setDescription(exitMessage)
        .setTimestamp();

      await exitChannel.send({ embeds: [embed] });
    } else {
      let embed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle(`Tchau ${member.displayName}!`)
        .setThumbnail(member.displayAvatarURL({ dynamic: true, size: 2048 }))
        .setDescription(`Tchau ${member} 👋 espero te ver novamente em breve!`)
        .setTimestamp();

      await exitChannel.send({ embeds: [embed] });
    }
  }
});

