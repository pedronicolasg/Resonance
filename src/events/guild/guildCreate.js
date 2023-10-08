const { EmbedBuilder } = require("discord.js");
const { owner } = require("../../config.json");
const { hxmaincolor, error, info } = require("../../themes/main");
const { logger } = require("../client/logger");
const client = require("../../index");

client.on("guildCreate", async (guild) => {
  let devUser = await client.users.fetch(owner);
  let embed = new EmbedBuilder()
    .setColor(hxmaincolor)
    .setAuthor({
      name: guild.name,
      iconURL: guild.iconURL({ dynamic: true }),
    })
    .setDescription(
      `Fui adicionado no servidor: \`${guild.name}\`. agora faço parte de \`${client.guilds.cache.size}\` servidores!`
    )
    .setTimestamp(Date.now());
  try {
    await devUser.send({ embeds: [embed] });
    console.log(info("Fui adicionado ") + `no servidor ${guild.name}.`);
    logger.info(`Fui adicionado no servidor: ${guild.name}!`);
  } catch {
    console.log(error("Erro ") + `no evento guildCreate.`);
    logger.error(`Erro no evento guildCreate.`);
  }
});
