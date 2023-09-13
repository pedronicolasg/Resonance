const Discord = require("discord.js");
const StoreItem = require('../../database/models/storeItem');
const themes = require('../../themes/chalk-themes');
const apptheme = require('../../themes/theme.json');
const { logger } = require('../../events/app/logger');
const ecoCfg = require('./economycfg.json')

module.exports = {
    name: "store",
    description: "Ver os itens disponíveis na loja do servidor.",
    type: Discord.ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        const serverId = interaction.guild.id;

        try {
            const items = await StoreItem.find({ serverId });

            if (items.length === 0) {
                const embed = new Discord.EmbedBuilder()
                    .setColor(apptheme.maincolor)
                    .setTitle("Loja vazia!")
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setDescription("A loja do servidor ainda não possui itens disponíveis.");

                interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const embed = new Discord.EmbedBuilder()
                .setColor(apptheme.maincolor)
                .setTitle("Loja do servidor")
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setDescription("Itens disponíveis para compra:");

            items.forEach((item) => {
                embed.addFields(
                    { name: `${item.name} ( ${item.itemId} )`, value: `${item.description} \n Preço: ${ecoCfg.coinsymb}:${item.price}`, inline: true }
                );
            });

            interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.log(themes.error("Erro ") + `ao obter os itens da loja devido à: ${e}`)
            logger.error(`Erro ao obter os itens da loja devido à: ${e}`);
            const embed = new Discord.EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Erro ao acessar a loja")
                .setDescription("Ocorreu um erro ao obter os itens da loja.");

            interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
