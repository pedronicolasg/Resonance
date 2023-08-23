const Discord = require("discord.js");
const config = require("../../config.json");
const themes = require('../../themes/chalk-themes');
const { logger } = require('../../events/app/logger');

module.exports = {
    name: "setstatus",
    description: "Configure meu status.",
    options: [
        {
            type: Discord.ApplicationCommandOptionType.String,
            name: "status-type",
            description: "Qual estilo você deseja aplicar (online, dnd, idle, invisible)?",
            required: true,
        },
        {
            type: Discord.ApplicationCommandOptionType.String,
            name: "descrição",
            description: "Qual será a descrição do status?",
            required: true,
        },
    ],

    run: async (client, interaction) => {
        if (interaction.user.id !== config.owner) {
            const permembed = new Discord.EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Você não possui permissão para utilizar este comando.")
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setDescription("Somente meu dono pode usar esse comando!");

            interaction.reply({ embeds: [permembed], ephemeral: true });
            return;
        }

        try {
            const status = interaction.options.getString("status-type");
            const desc = interaction.options.getString("descrição");

            client.user.setStatus(status);

            client.user.setPresence({
                activities: [
                    {
                        name: desc,
                    },
                ],
            });

            const embed = new Discord.EmbedBuilder()
                .setColor("Green")
                .setTitle("Status atualizado!")
                .addFields(
                    {
                        name: "🔮 Mudei meu status para:",
                        value: `\`${status}\`.`,
                        inline: false,
                    },
                    {
                        name: "📝 Mudei minha descrição para:",
                        value: `\`${desc}\`.`,
                        inline: false,
                    }
                );

            await interaction.reply({ embeds: [embed], ephemeral: true });
            console.log(themes.success("Sucesso ") + `ao mudar status do bot para: ${status}`);
            logger.error(`Sucesso ao mudar status do bot para: ${status}`);
        } catch (error) {
            console.log(themes.error("Erro ") + "ao mudar status do bot: " + error);
            logger.error(`Erro ao mudar status do bot: ${error}`);
        }
    },
};
