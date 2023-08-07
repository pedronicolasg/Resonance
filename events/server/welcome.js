const Discord = require("discord.js");
const ServerSettings = require('../../models/servercfg');
const client = require("../../index");
const config = require("../../config.json");
const themes = require('../../themes/chalk-themes');
const logger = require('../app/logger');

client.on("guildMemberAdd", async (member) => {
    try {
        const serverSettings = await ServerSettings.findOne({ serverId: member.guild.id });

        if (serverSettings && serverSettings.welcomechannelId) {
            const welcomeChannelID = serverSettings.welcomechannelId;

            let embed = new Discord.EmbedBuilder()
                .setColor("Green")
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setTitle("👋 Boas Vindas!")
                .setDescription(`> Olá ${member}!\nSeja Bem-Vindo(a) a \`${member.guild.name}\`!\nAtualmente estamos com \`${member.guild.memberCount}\` membros.`);

            const welcomeChannel = member.guild.channels.cache.get(welcomeChannelID);
            if (welcomeChannel) {
                welcomeChannel.send({ embeds: [embed], content: `${member}` });
            } else {
                console.log(themes.error("Erro: ") + `Canal de boas-vindas com ID ${exitChannelId} não encontrado no servidor ${member.guild.name} (${member.guild.id})`);
                logger.error(`Erro: Canal de boas-vindas com ID ${exitChannelId} não encontrado no servidor ${member.guild.name} (${member.guild.id})`);
            }
        } else {
            console.log(themes.error("Erro: ") + `Configurações ou canal de boas-vindas não encontrados para o servidor '${member.guild.name}' (${member.guild.id}).`);
            logger.error(`Erro: Configurações ou canal de boas-vindas não encontrados para o servidor '${member.guild.name}' (${member.guild.id}).`);
        }
    } catch (error) {
        console.log(themes.error("Erro ") + `ao buscar as configurações no MongoDB: ${error}`);
        logger.error(`Erro ao buscar as configurações no MongoDB: ${error}`);
    }
});
