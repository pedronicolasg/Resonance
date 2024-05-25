const { EmbedBuilder, Events } = require("discord.js");
const { hxmaincolor } = require("../../themes/main");
const client = require("../../index");
const { getServerConfig } = require("../../methods/DB/server");

client.on(Events.GuildMemberRemove, async (member) => {
  const serverId = member.guild.id;
  const exitChannelId = await getServerConfig(serverId, 'exitchannelId');
  const exitMessage = await getServerConfig(serverId, 'exitMessage');
  const exitChannel = client.channels.cache.get(exitChannelId);

  if (exitChannel) {
    let embed;

    if (exitMessage) {
      embed = new EmbedBuilder()
        .setColor(member.displayHexColor)
        .setTitle(`Tchau ${member.displayName}!`)
        .setThumbnail(member.displayAvatarURL({ dynamic: true, size: 2048 }))
        .setDescription(exitMessage)
        .setTimestamp();
    } else {
      embed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle(`Tchau ${member.displayName}!`)
        .setThumbnail(member.displayAvatarURL({ dynamic: true, size: 2048 }))
        .setDescription(`Tchau ${member} 👋 espero te ver novamente em breve!`)
        .setTimestamp();
    }

    await exitChannel.send({ embeds: [embed] });
  }
});
