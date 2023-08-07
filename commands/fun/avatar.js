const Discord = require("discord.js");
const themes = require('../../themes/chalk-themes');
const logger = require('../../events/app/logger');

module.exports = {
    name: "avatar",
    description: "Visualiza o avatar do usuário desejado.",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "usuário",
            description: "Usuário que você deseja ver o avatar.",
            type: Discord.ApplicationCommandOptionType.User,
            required: false,
        },
    ],

    run: async (client, interaction) => {
        const user = interaction.options.getUser("usuário") || interaction.user;
        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 2048 });

        const embed = new Discord.EmbedBuilder()
            .setColor("#48deff")
            .setTitle(`Avatar de ${user.username}`)
            .setImage(avatarURL);

        try {
            interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.log(themes.error("Erro ") + `ao executar o comando /avatar devido à:\n ${error}`);
            logger.error(`Erro ao executar o comando /avatar devido à:\n ${error}`);
        }
    },
};
