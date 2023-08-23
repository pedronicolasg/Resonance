const Discord = require("discord.js");
const transcript = require('discord-html-transcripts');
const themes = require('../../themes/chalk-themes');
const { logger } = require('../../events/app/logger');
const config = require("../../config.json");
const ServerSettings = require('../../models/servercfg');

module.exports = {
    name: 'transcript',
    description: 'Transcreve o canal desejado em um arquivo html',
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "canal",
            description: "Mencione um canal para o transcrever.",
            type: Discord.ApplicationCommandOptionType.Channel,
            required: true,
        }
    ],

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageChannels)) {
            let permembed = new Discord.EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Você não possui permissão para utilizar este comando.")
                .setDescription(`Você precisa da permissão "Gerenciar Canais" para usar esse comando`);

            return interaction.reply({ embeds: [permembed], ephemeral: true });
        }

        const serverSettings = await ServerSettings.findOne({ serverId: interaction.guild.id });

        function getCurrentDate() {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        }
        const currentDate = getCurrentDate();


        const channelTrscpt = interaction.options.getChannel("canal");
        if (!channelTrscpt.isTextBased()) {
            let nottextchannelembed = new Discord.EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Algo deu errado ao transcrever o canal.")
                .setDescription(`O canal não é de texto.`);
            return interaction.reply({
                embeds: [nottextchannelembed],
                ephemeral: true
            });
        }
        try {
            const embed = new Discord.EmbedBuilder()
                .setColor('#48deff')
                .setDescription(`Criando transcript do canal ${channelTrscpt}...`);

            interaction.reply({ embeds: [embed], ephemeral: true }).then(() => {
                setTimeout(async () => {
                    const attachement = await transcript.createTranscript(channelTrscpt, {
                        limit: -1,
                        returnType: 'attachement',
                        filename: `${channelTrscpt.id}_${currentDate}.html`,
                        saveImages: true,
                        footerText: 'Foram exportadas {number} mensagens!',
                        poweredBy: false
                    });

                    embed.setDescription(`Transcript do canal ${channelTrscpt.name} criado:`);
                    interaction.editReply({ embeds: [embed], files: [attachement] });

                    const channelId = serverSettings.logchannelId;
                    const logchannel = client.channels.cache.get(channelId);
                    if (logchannel) {
                        const logembed = new Discord.EmbedBuilder()
                            .setColor('#48deff')
                            .setDescription(`Um transcript do canal ${channelTrscpt} foi criado por ${interaction.user}`);
                        logchannel.send({ embeds: [logembed], files: [attachement] });
                    }
                }, 1500);
            });
        } catch (e) {
            let error = new Discord.MessageEmbed()
                .setColor("Red")
                .setTitle(`❌ Erro ao transcrever o canal`)
                .setDescription(`Não foi possível bloquear o canal: ${channelTrscpt.name}.!`);
            interaction.reply({ embeds: [error], ephemeral: true });
            console.log(themes.error("Erro ") + `ao transcrever o canal ${channelTrscpt.name} devido à:\n ${e}`);
            logger.error(`Erro ao transcrever o canal ${channelTrscpt.name} devido à:\n ${e}`);
        }
    }
};
