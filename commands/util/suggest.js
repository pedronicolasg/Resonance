const Discord = require("discord.js");
const ServerSettings = require('../../models/servercfg');
const themes = require('../../themes/chalk-themes');
const logger = require('../../events/app/logger');
const config = require("../../config.json");

module.exports = {
    name: "suggest",
    description: "Faça sua sugestão.",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "sugestão",
            description: "Escreva algo.",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
        }
    ],

    run: async (client, interaction) => {
        try {
            const serverId = interaction.guild.id;
            const serverSettings = await ServerSettings.findOne({ serverId });

            if (serverSettings && serverSettings.suggestionchannelId) {
                const suggestionChannelId = serverSettings.suggestionchannelId;
                const suggestionChannel = interaction.guild.channels.cache.get(suggestionChannelId);

                if (!suggestionChannel) {
                    let errorchannelembed = new Discord.EmbedBuilder()
                        .setColor("Red")
                        .setTitle("❌ Canal não configurado.")
                        .setDescription(`${interaction.user}, o canal de sugestões ainda não foi configurado para este servidor! Peça a um Staff para configurá-lo.`);

                    interaction.reply({ embeds: [errorchannelembed], ephemeral: true });
                } else {
                    const suggestion = interaction.options.getString("sugestão");
                    const embed = new Discord.EmbedBuilder()
                        .setColor("#48deff")
                        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                        .setTitle("Nova sugestão!")
                        .setDescription(`**Sugestão de ${interaction.user}:**\n${suggestion}`);

                    suggestionChannel.send({ embeds: [embed] }).then(() => {
                        let successembed = new Discord.EmbedBuilder()
                            .setColor("#48deff")
                            .setTitle("✅ Sugestão enviada")
                            .setDescription(`${interaction.user}, sua sugestão foi publicada em ${suggestionChannel} com sucesso!`);
                        interaction.reply({ embeds: [successembed], ephemeral: true });

                    }).catch((e) => {
                        console.log(themes.error("Erro ") + `ao enviar a sugestão de ${interaction.user} devido a:\n ${e}`);
                        logger.error(`Erro ao enviar a sugestão de ${interaction.user} devido a:\n ${e}`);
                        let errorembed = new Discord.EmbedBuilder()
                            .setColor("Red")
                            .setTitle("❌ Ops...")
                            .setDescription(`${interaction.user}, não foi possível enviar sua sugestão! Tente novamente mais tarde ou contate um Staff.`);

                        interaction.reply({ embeds: [errorembed], ephemeral: true });
                    });
                }
            } else {
                console.log(themes.error("Erro: ") + `Configurações ou canal de sugestões não encontrados para o servidor '${interaction.guild.name} (${serverId})`);
                logger.error(`Erro: Configurações ou canal de sugestões não encontrados para o servidor '${interaction.guild.name} (${serverId})`);
            }
        } catch (e) {
            console.log(themes.error("Erro ") + `ao buscar as configurações no MongoDB: ${e}`);
            logger.error(`Erro ao buscar as configurações no MongoDB: ${e}`);
        }
    }
};
