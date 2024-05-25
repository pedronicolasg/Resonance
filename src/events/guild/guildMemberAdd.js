const { EmbedBuilder, Events } = require("discord.js");
const { hxmaincolor } = require("../../themes/main");
const client = require("../../index");
const { getServerConfig } = require("../../methods/DB/server");

client.on(Events.GuildMemberAdd, async (member) => {
  const serverId = member.guild.id;
  const welcomeChannelId = await getServerConfig(serverId, 'welcomechannelId');
  const welcomeMessage = await getServerConfig(serverId, 'welcomeMessage');
  const welcomeChannel = client.channels.cache.get(welcomeChannelId);

  if (welcomeChannel) {
    let embed;

    if (welcomeMessage) {
      embed = new EmbedBuilder()
        .setColor(member.displayHexColor)
        .setTitle(`Boas vindas ${member.displayName}!`)
        .setThumbnail(member.displayAvatarURL({ dynamic: true, size: 2048 }))
        .setDescription(welcomeMessage)
        .setTimestamp();
    } else {
      embed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle(`Boas vindas ${member.displayName}!`)
        .setThumbnail(member.displayAvatarURL({ dynamic: true, size: 2048 }))
        .setDescription(`Olá ${member} 👋 boas-vindas ao servidor!`)
        .setTimestamp();
    }

    await welcomeChannel.send({ embeds: [embed] });
  }
});
