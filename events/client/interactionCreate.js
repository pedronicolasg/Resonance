const Discord = require("discord.js");
const client = require("../../index");
const config = require("../../config.json");
const themes = require('../../themes/chalk-themes');
const logger = require('../app/logger');

client.on("interactionCreate", (interaction) => {
    if (interaction.type === Discord.InteractionType.ApplicationCommand) {
        const cmd = client.slashCommands.get(interaction.commandName);

        if (!cmd) return interaction.reply(`Error`);

        interaction["member"] = interaction.guild.members.cache.get(
            interaction.user.id
        );

        cmd.run(client, interaction);
    }
});
