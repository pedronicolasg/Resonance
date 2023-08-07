const Discord = require("discord.js");
const config = require("../../config.json");
const themes = require('../../themes/chalk-themes');
const logger = require('../../events/app/logger');
const Wallet = require('../../models/wallet');

module.exports = {
    name: "transfer",
    description: "Transfere Resobytes para outro usuário.",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "usuário",
            description: "Mencione o usuário para enviar moedas.",
            type: Discord.ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "quantidade",
            description: "Quantidade de Resobytes para enviar.",
            type: Discord.ApplicationCommandOptionType.Integer,
            required: true,
        },
    ],

    run: async (client, interaction, args) => {
        const senderId = interaction.user.id;
        const recipientId = interaction.options.getUser("usuário").id;
        const amount = interaction.options.getInteger("quantidade");

        if (amount <= 0) {
            const embed = new Discord.EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Quantidade inválida!")
                .setDescription("A quantidade de moedas deve ser maior que 0.");

            interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        try {
            let sender = await Wallet.findOne({ userId: senderId });
            let recipient = await Wallet.findOne({ userId: recipientId });

            if (!sender || sender.coins < amount) {
                const embed = new Discord.EmbedBuilder()
                    .setColor("Red")
                    .setTitle("❌ Saldo insuficiente!")
                    .setDescription("Você não possui moedas suficientes para enviar essa quantidade.");

                interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            sender.coins -= amount;
            recipient = recipient || new Wallet({ userId: recipientId });
            recipient.coins = (recipient.coins || 0) + amount;

            await sender.save();
            await recipient.save();

            const embed = new Discord.EmbedBuilder()
                .setColor("Green")
                .setTitle("💸 Pagamento realizado!")
                .setDescription(`Você enviou \`${amount} Resobytes\` para <@${recipientId}>.\nSeu saldo atual: \`${sender.coins} Resobytes\``);

            interaction.reply({ embeds: [embed] });
        } catch (e) {
            console.log(themes.error("Erro ") + `ao enviar RB$:${amount} de ${senderId} para ${recipientId} devido à:\n ${e}`);
            logger.error(`Erro ao enviar RB$:${amount} de ${senderId} para ${recipientId} devido à:\n ${e}`);

            const errorembed = new Discord.EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Erro ao enviar moedas!")
                .setDescription("Não foi possível completar a transação, tente novamente mais tarde.");

            interaction.reply({ embeds: [errorembed] });
        }
    },
};
