const Discord = require("discord.js");
const StoreItem = require('../../database/models/storeItem');
const ServerSettings = require('../../database/models/servercfg');
const themes = require('../../themes/chalk-themes');
const apptheme = require('../../themes/theme.json');
const { logger } = require('../../events/app/logger');

module.exports = {
    name: "removeitem",
    description: "Remova um item da loja do servidor.",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "item_id",
            description: "ID do item que você deseja remover.",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
        },
    ],

    run: async (client, interaction, args) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageGuild)) {
            const embed = new Discord.EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Permissão Necessária")
                .setDescription(`Você precisa da permissão de "Gerenciar Guilda" para usar este comando.`);

            return interaction.reply({ embeds: [permembed], ephemeral: true });
        }

        const serverSettings = await ServerSettings.findOne({ serverId: interaction.guild.id });

        const serverId = interaction.guild.id;
        const itemId = interaction.options.getString("item_id");

        try {
            const item = await StoreItem.findOneAndDelete({ serverId, itemId });

            if (!item) {
                const embed = new Discord.EmbedBuilder()
                    .setColor("Red")
                    .setTitle("Item não Encontrado")
                    .setDescription("O item com o ID especificado não foi encontrado na loja.");

                interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const embed = new Discord.EmbedBuilder()
                .setColor(apptheme.maincolor)
                .setTitle("Item Removido da Loja!")
                .setDescription(`O item "${item.name}" foi removido da loja com sucesso.`);

            interaction.reply({ embeds: [embed] });
            const channelId = serverSettings.logchannelId;
            const logchannel = client.channels.cache.get(channelId);
            if (logchannel) {
                const logembed = new Discord.EmbedBuilder()
                    .setColor(apptheme.maincolor)
                    .setTitle("Item Adicionado à Loja!")
                    .setDescription(`O item "${name}" foi adicionado à loja por ${interaction.user}.\nID do Item: ${newItem.itemId}`);
                logchannel.send({ embeds: [logembed] });
            }
        } catch (e) {
            console.log(themes.error("Erro ") + `ao remover o item da loja devido à: ${e}`)
            logger.error(`Erro ao remover o item da loja devido à: ${e}`);
            const errorembed = new Discord.EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Erro ao Remover o Item da Loja")
                .setDescription("Não foi possível remover o item da loja.");

            interaction.reply({ embeds: [errorembed], ephemeral: true });
        }
    }
};
