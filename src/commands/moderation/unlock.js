const Discord = require("discord.js")
const ServerSettings = require('../../database/models/servercfg');
const themes = require('../../themes/chalk-themes');
const apptheme = require('../../themes/theme.json');
const { logger } = require('../../events/client/logger');

module.exports = {
    name: "unlock",
    description: "Desbloqueie um canal.",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "canal",
            description: "Mencione um canal para o desbloquear o chat.",
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
        
        const channel = interaction.options.getChannel("canal")
        if (!channel.isTextBased()) {
            let nottextchannelembed = new Discord.EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Algo deu errado ao desbloquear o canal.")
                .setDescription(`O canal não é de texto.`);
            return interaction.reply({
                embeds: [nottextchannelembed],
                ephemeral: true
            });
        }
        const channelId = serverSettings.logchannelId;
        const logchannel = client.channels.cache.get(channelId);

        channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: true }).then(() => {
            let embed = new Discord.EmbedBuilder()
                .setColor(apptheme.maincolor)
                .setDescription(`🔒 O canal de texto ${channel} foi desbloqueado por ${interaction.user}.`)
            interaction.reply({ embeds: [embed] })

            if (logchannel) {
                logchannel.send({ embeds: [embed] });
            }

            let channelembed = new Discord.EmbedBuilder()
                .setColor(apptheme.maincolor)
                .setDescription(`🔓 Este canal foi desbloqueado por ${interaction.user}.`)
            if (channel.id !== interaction.channel.id) return channel.send({ embeds: [channelembed] })
        }).catch(e => {
            let error = new Discord.EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Erro ao desbloquear o canal.")
                .setDescription(
                    `Não foi possível desbloquear o canal: ${channel.name}!`
                );
            interaction.reply({ embeds: [error], ephemeral: true })
            console.log(themes.error("Erro ") + `ao desbloquear o canal ${channel} devido à: ${e}`)
            logger.error(`Erro ao desbloquear o canal ${channel} devido à: ${e}`);
        })
    }
}
