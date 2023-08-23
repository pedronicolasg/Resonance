const Discord = require("discord.js");
const config = require('../../config.json')
const themes = require('../../themes/chalk-themes');
const { logger } = require('../../events/app/logger');

module.exports = {
    name: "bugreport",
    description: "Reporte um bug para o desenvolvedor.",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "bug",
            description: "Descreva o bug encontrado.",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
        },
    ],

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            let permembed = new Discord.EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Você não possui permissão para utilizar este comando.")
                .setDescription(`Você precisa da permissão "Administrador" para usar esse comando`);

            return interaction.reply({ embeds: [permembed], ephemeral: true });
        }

        const bugDescription = interaction.options.getString("bug");
        const devUser = await client.users.fetch(config.owner);

        if (!devUser) {
            let errordevembed = new Discord.EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Usuário do desenvolvedor não encontrado.")
                .setDescription(`O ID do dono/desenvolvedor não foi configurado no bot, infelizmente até que o ID seja configurado você não poderá utilizar esse comando para reportar bugs do bot.`);
            interaction.reply({ embeds: [errordevembed], ephemeral: true });

            console.log(themes.error("Erro ") + `ID do dono/desenvolvedor não configurado.`);
            logger.error(`Erro ID do dono/desenvolvedor não configurado.`);
            return;
        }

        const embed = new Discord.EmbedBuilder()
            .setColor("#48deff")
            .setTitle("Bug Report")
            .setDescription(`Bug report enviado por ${interaction.user}.`)
            .addFields({ name: "Descrição do Bug", value: bugDescription, inline: true });

        try {
            await devUser.send({ embeds: [embed] });
            let successembed = new Discord.EmbedBuilder()
                .setColor("#48deff")
                .setTitle("Bug Report enviado!")
                .setDescription(`Obrigado por relatar um bug! Seu report foi enviado ao desenvolvedor.`);

            interaction.reply({ embeds: [successembed], ephemeral: true });
        } catch (e) {
            let errorembed = new Discord.EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Erro ao enviar o bug report.")
                .setDescription(`Erro ao enviar o bug report para a DM do desenvolvedor.`);

            interaction.reply({ embeds: [errorembed], ephemeral: true });
            console.log(themes.error("Erro ") + `ao enviar o bug report para a DM do desenvolvedor.`);
            logger.error(`Erro ao enviar o bug report para a DM do desenvolvedor.`);
        }
    },
};
