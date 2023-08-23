const Discord = require("discord.js");
const config = require("../../config.json");
const themes = require('../../themes/chalk-themes');
const { logger } = require('../../events/app/logger');
const ms = require("ms");
const Wallet = require('../../models/wallet');

module.exports = {
    name: "monthly",
    description: `Resgate suas Resobytes mensais.`,
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction, args) => {
        const userId = interaction.user.id;
        const timeout = ms("30 days");

        try {
            let user = await Wallet.findOne({ userId });

            if (user && user.lastMonthlyClaim && Date.now() - user.lastMonthlyClaim < timeout) {
                const timeLeft = ms(timeout - (Date.now() - user.lastMonthlyClaim));
                const embed = new Discord.EmbedBuilder()
                    .setColor("Red")
                    .setTitle("❌ Monthly já resgatado!")
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`Espere \`${timeLeft}\` para resgatar seu monthly novamente!`);

                interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            var amount = Math.ceil(Math.random() * 225);
            if (amount < 125) {
                amount = 125
            }

            user = user || new Wallet({ userId });
            user.coins = (user.coins || 0) + amount;
            user.lastMonthlyClaim = Date.now();
            await user.save();

            const sucessembed = new Discord.EmbedBuilder()
                .setColor("Green")
                .setTitle("💰 Monthly Resgatado!")
                .setDescription(`Você resgatou \`RB$:${amount}\` em seu monthly.\nUtilize o comando \`/wallet\` para ver seu total de Resobytes.`)
                .setFooter({
                    text: `Resobyte (RB$).`,
                    iconURL: `${config.coinicon}`,
                });

            interaction.reply({ embeds: [sucessembed] });
        } catch (e) {
            console.log(themes.error("Erro ") + `ao adicionar RB$:${amount} à carteira de ${interaction.user.id} devido à:\n ${e}`);
            logger.error(`Erro ao adicionar RB$:${amount} à carteira de ${interaction.user.id} devido à:\n ${e}`);

            const errorembed = new Discord.EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Erro ao resgatar o Monthly!")
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`Não foi possível resgatar seu monthly, tente novamente mais tarde.`);

            interaction.reply({ embeds: [errorembed] });
        }
    }
};