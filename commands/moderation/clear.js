const Discord = require("discord.js");
const config = require("../../config.json");
const themes = require('../../themes/chalk-themes');
const { logger } = require('../../events/app/logger');
const ServerSettings = require('../../models/servercfg');

module.exports = {
    name: "clear",
    description: "Limpa o canal de texto",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "quantidade",
            description: "Número de mensagens para serem apagadas.",
            type: Discord.ApplicationCommandOptionType.Number,
            required: true,
        },
    ],

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageMessages)) {
            let permembed = new Discord.EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Você não possui permissão para utilizar este comando.")
                .setDescription(`Você precisa da permissão "Gerenciar Mensagens" para usar esse comando`);

            return interaction.reply({ embeds: [permembed], ephemeral: true });
        }

        const serverSettings = await ServerSettings.findOne({ serverId: interaction.guild.id });
        let number = interaction.options.getNumber("quantidade");

        if (number <= 0 || number > 99) {
            let embed = new Discord.EmbedBuilder()
                .setColor("Red")
                .setDescription(`Escolha um número entre 1 e 99!`);

            interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        try {
            const messages = await interaction.channel.messages.fetch({ limit: number });
            const oldMessages = messages.filter(msg => Date.now() - msg.createdTimestamp >= 1209600000);

            const channelId = serverSettings.logchannelId;
            const channel = client.channels.cache.get(channelId);

            if (oldMessages.size > 0) {
                oldMessages.forEach(async msg => {
                    await msg.delete();
                });
            }

            const remainingMessages = messages.filter(msg => !oldMessages.has(msg.id));
            await interaction.channel.bulkDelete(remainingMessages);

            let embed = new Discord.EmbedBuilder()
                .setColor("#48deff")
                .setAuthor({
                    name: interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                })
                .setDescription(`O canal de texto ${interaction.channel} teve \`${number}\` mensagens deletadas por ${interaction.user}.`);

            if (channel) {
                channel.send({ embeds: [embed] });
            }

            interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (e) {
            console.log(themes.error(`Erro `) + `ao usuário ${interaction.user.username} tentar deletar ${number} mensagens do canal de texto ${interaction.channel} devido à: \n ${e}`);
            logger.error(`Erro ao usuário ${interaction.user.username} tentar deletar ${number} mensagens do canal de texto ${interaction.channel} devido à: \n ${e}`);

            let embed = new Discord.EmbedBuilder()
                .setColor("Red")
                .setAuthor({
                    name: interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                })
                .setDescription(`❌ Erro ao usuário ${interaction.user.username} tentar deletar ${number} mensagens do canal de texto ${interaction.channel} devido à: \n ${e}`);

            interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
