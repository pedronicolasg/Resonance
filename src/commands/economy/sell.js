const Discord = require("discord.js");
const ServerSettings = require('../../database/models/servercfg');
const StoreItem = require('../../database/models/storeItem');
const Wallet = require('../../database/models/wallet');
const themes = require('../../themes/chalk-themes');
const apptheme = require('../../themes/theme.json');
const ecoCfg = require('./economycfg.json')
const { logger } = require('../../events/app/logger');

module.exports = {
    name: "sell",
    description: "Venda um item da loja do servidor.",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "item_id",
            description: "ID do item que você deseja vender.",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
        },
    ],

    run: async (client, interaction, args) => {
        const serverSettings = await ServerSettings.findOne({ serverId: interaction.guild.id });
        const userId = interaction.user.id;
        const serverId = interaction.guild.id;
        const itemId = interaction.options.getString("item_id");

        try {
            const item = await StoreItem.findOne({ serverId, itemId });

            if (!item) {
                const embed = new Discord.EmbedBuilder()
                    .setColor("Red")
                    .setTitle("❌ Item não encontrado")
                    .setDescription("O item que você deseja vender não foi encontrado na loja.");

                interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const member = interaction.guild.members.cache.get(userId);

            if (!member) {
                const embed = new Discord.EmbedBuilder()
                    .setColor("Red")
                    .setTitle("❌ Usuário não encontrado")
                    .setDescription("Não foi possível encontrar o seu usuário no servidor.");

                interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            if (!member.roles.cache.has(itemId)) {
                const embed = new Discord.EmbedBuilder()
                    .setColor("Red")
                    .setTitle("❌ Você não possui o Cargo")
                    .setDescription("Você não possui o cargo associado a este item.");

                interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const role = interaction.guild.roles.cache.get(itemId);

            if (!role) {
                console.log(`O cargo com ID ${itemId} não foi encontrado no servidor.`);
                const embed = new Discord.EmbedBuilder()
                    .setColor("Red")
                    .setTitle("❌ Cargo não encontrado")
                    .setDescription("O cargo associado a este item não foi encontrado no servidor.");

                interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            try {
                await member.roles.remove(role);
            } catch (error) {
                console.log("Erro ao remover cargo do usuário:", error);
                const embed = new Discord.EmbedBuilder()
                    .setColor("Red")
                    .setTitle("❌ Erro ao Remover Cargo")
                    .setDescription("Não foi possível remover o cargo do seu usuário.");

                interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const user = await Wallet.findOne({ userId });
            const amountGained = Math.round(item.price * 0.25);

            if (user) {
                user.coins += amountGained;
                await user.save();
            } else {
                console.log(`Usuário com ID ${userId} não encontrado na carteira.`);
            }

            const embed = new Discord.EmbedBuilder()
                .setColor(apptheme.maincolor)
                .setTitle("✅ Venda Realizada!")
                .setDescription(`Você vendeu o item "${item.name}" da loja com sucesso.\nVocê recebeu ${amountGained} ${ecoCfg.coinname}s.`);

            interaction.reply({ embeds: [embed] });

            const channelId = serverSettings.logchannelId;
            const logchannel = client.channels.cache.get(channelId);
            if (logchannel) {
                const logembed = new Discord.EmbedBuilder()
                    .setColor(apptheme.maincolor)
                    .setTitle("Compra Realizada!")
                    .setDescription(`${interaction.user} vendeu o item "${item.name}" e ganhou ${ecoCfg.coinsymb}:${amountGained} de volta!`);
                logchannel.send({ embeds: [logembed] });
            }

        } catch (error) {
            console.log("Erro ao vender o item:", error);
            console.log(themes.error("Erro ") + `ao vender o item da loja devido à: ${e}`)
            logger.error(`Erro ao vender o item da loja devido à: ${e}`);
            const embed = new Discord.EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Erro ao Vender Item")
                .setDescription("Ocorreu um erro ao tentar vender o item.");

            interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
