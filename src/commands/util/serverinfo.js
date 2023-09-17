const ServerCfg = require("../../database/models/servercfg.js");
const themes = require('../../themes/chalk-themes');
const apptheme = require('../../themes/theme.json');
const { logger } = require('../../events/client/logger');
const config = require("../../config.json");
const Discord = require("discord.js");

module.exports = {
    name: "serverinfo",
    description: "Envia as informações do atual servidor.",
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        try {
            const nome = interaction.guild.name;
            const id = interaction.guild.id;
            const icon = interaction.guild.iconURL({ dynamic: true });
            const membros = interaction.guild.memberCount;
            const guildOwner = interaction.guild.ownerId;

            const criacao = interaction.guild.createdAt.toLocaleDateString("pt-br");

            const canais_total = interaction.guild.channels.cache.size;
            const canais_texto = interaction.guild.channels.cache.filter(c => c.type === Discord.ChannelType.GuildText).size;
            const canais_voz = interaction.guild.channels.cache.filter(c => c.type === Discord.ChannelType.GuildVoice).size;
            const canais_categoria = interaction.guild.channels.cache.filter(c => c.type === Discord.ChannelType.GuildCategory).size;

            const embed = new Discord.EmbedBuilder()
                .setColor(apptheme.maincolor)
                .setAuthor({ name: nome, iconURL: icon })
                .setThumbnail(icon)
                .addFields(
                    {
                        name: `💻 Nome:`,
                        value: `\`${nome}\``,
                        inline: true
                    },
                    {
                        name: `🆔 ID:`,
                        value: `\`${id}\``,
                        inline: true
                    },
                    {
                        name: `👥 Membros:`,
                        value: `\`${membros}\``,
                        inline: true
                    },
                    {
                        name: `👑 Dono`,
                        value: `<@${guildOwner}>`,
                        inline: true
                    },
                    {
                        name: `🔧 Criação:`,
                        value: `\`${criacao}\``,
                        inline: true
                    },
                    {
                        name: `📤 Canais Totais:`,
                        value: `\`${canais_total}\``,
                        inline: true
                    },
                    {
                        name: `📝 Canais de Texto:`,
                        value: `\`${canais_texto}\``,
                        inline: true
                    },
                    {
                        name: `🔊 Canais de Voz:`,
                        value: `\`${canais_voz}\``,
                        inline: true
                    },
                    {
                        name: `📅 Categorias:`,
                        value: `\`${canais_categoria}\``,
                        inline: true
                    }
                );

            const serverConfig = await ServerCfg.findOne({ serverId: id });

            if (interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
                if (serverConfig) {
                    const logchannelId = serverConfig.logchannelId;
                    const adschannelId = serverConfig.adschannelId;
                    const exitchannelId = serverConfig.exitchannelId;
                    const ruleschannelId = serverConfig.ruleschannelId;
                    const welcomechannelId = serverConfig.welcomechannelId;
                    const suggestionchannelId = serverConfig.suggestionchannelId;

                    embed.addFields(
                        { name: "Canal de Logs", value: `<#${logchannelId}>`, inline: true },
                        { name: "Canal de Anúncios", value: `<#${adschannelId}>`, inline: true },
                        { name: "Canal de Saídas", value: `<#${exitchannelId}>`, inline: true },
                        { name: "Canal de Regras", value: `<#${ruleschannelId}>`, inline: true },
                        { name: "Canal de Boas-Vindas", value: `<#${welcomechannelId}>`, inline: true },
                        { name: "Canal de Sugestões", value: `<#${suggestionchannelId}>`, inline: true },
                    );
                } else {
                    embed.addFields({ name: "Configurações", value: `As informações do servidor não foram configuradas ainda.`, inline: true })
                }
            }

            interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (e) {
            console.log(themes.error("Erro ") + `ao buscar as informações do servidor devido à:\n ${e}`);
            logger.error(`Erro ao buscar as informações do servidor devido à:\n ${e}`);
            interaction.reply("Ocorreu um erro ao buscar as informações do servidor no banco de dados.");
        }
    }
};