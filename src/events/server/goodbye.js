const Discord = require("discord.js");
const ServerSettings = require('../../database/models/servercfg');
const client = require("../../index");
const config = require("../../config.json");
const themes = require('../../themes/chalk-themes');
const { logger } = require('../app/logger');

client.on("guildMemberRemove", async (member) => {
    try {
        const serverSettings = await ServerSettings.findOne({ serverId: member.guild.id });

        if (serverSettings && serverSettings.exitchannelId) {
            const exitChannelId = serverSettings.exitchannelId;

            let embed = new Discord.EmbedBuilder()
                .setColor("Red")
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setTitle(`Adeus ${member.user.username}....`)
                .setDescription(`> O usuário ${member} saiu do servidor!\n> Nos sobrou apenas \`${member.guild.memberCount}\` membros.`);

            const exitChannel = member.guild.channels.cache.get(exitChannelId);
            if (exitChannel) {
                exitChannel.send({ embeds: [embed], content: `${member}` });
            } else {
                console.log(themes.error("Erro: ") + `Canal de saída com ID ${exitChannelId} não encontrado no servidor ${member.guild.name} (${member.guild.id})`);
                logger.error(`Erro: Canal de saída com ID ${exitChannelId} não encontrado no servidor ${member.guild.name} (${member.guild.id})`);
            }
        } else {
            console.log(themes.error("Erro: ") + `Configurações ou canal de saída não encontrados para o servidor '${member.guild.name}' (${member.guild.id}).`);
            logger.error(`Erro: Configurações ou canal de saída não encontrados para o servidor '${member.guild.name}' (${member.guild.id}).`);
        }
    } catch (error) {
        console.log(themes.error("Erro ") + `ao buscar as configurações no MongoDB: ${error}`);
        logger.error(`Erro ao buscar as configurações no MongoDB: ${error}`);
    }
});
