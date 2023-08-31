const Discord = require("discord.js");
const config = require("../../config.json");
const apptheme = require('../../themes/theme.json');
const themes = require('../../themes/chalk-themes');
const ecoCfg = require("../economy/economycfg.json");

module.exports = {
    name: "help",
    description: "Painel de comandos do bot.",
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        const permissionsArray = [
            Discord.PermissionFlagsBits.Administrator,
            Discord.PermissionFlagsBits.ManageRoles,
            Discord.PermissionFlagsBits.KickMembers,
            Discord.PermissionFlagsBits.ManageChannels,
            Discord.PermissionFlagsBits.BanMembers,
            Discord.PermissionFlagsBits.ManageMessages,
            Discord.PermissionFlagsBits.ManageGuild,
        ];
        const hasPermission = permissionsArray.some((permission) => interaction.member.permissions.has(permission));

        const embed_painel = new Discord.EmbedBuilder()
            .setColor(apptheme.maincolor)
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`Olá ${interaction.user}, veja meus comandos interagindo com o painel abaixo:`);

        const embed_utilidade = new Discord.EmbedBuilder()
            .setColor("Blue")
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`Olá ${interaction.user}, veja meus comandos de **utilidade** abaixo:
            /botinfo - Fornece informações sobre o bot.
            /help - Mostra a lista de comandos do bot.
            /qr - Cria um QR Code que dura 72 horas.
            /ping - Mostra o ping do bot.
            /serverinfo - Mostra as informações do servidor atual.
            /suggest - Envia sua sugestão para o canal de sugestões.
        `);

        const embed_diversao = new Discord.EmbedBuilder()
            .setColor("Yellow")
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`Olá ${interaction.user}, veja meus comandos de **diversão** abaixo:
            /apod - Envia a imagem astronômica da data escolhida.
            /avatar - Envia o avatar do usuário escolhido.
        `);

        const embed_economia = new Discord.EmbedBuilder()
            .setColor("Green")
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`Olá ${interaction.user}, veja meus comandos de **economia** abaixo:
            /daily - Resgata seus ${ecoCfg.coinname}s diários.
            /weekly - Resgata seus ${ecoCfg.coinname}s semanais.
            /monthly - Resgata seus ${ecoCfg.coinname}s mensais.
            /yearly - Resgata seus ${ecoCfg.coinname}s anuais.
            /wallet - Mostra quantos ${ecoCfg.coinname}s você ou o usuário marcado tem.
            /transfer - Transfere dinheiro para o usuário escolhido.
            /store - Abre a loja do servidor atual.
            /buy - Compra itens na loja.
            /sell - Vende um cargo cadastrado na loja, recebendo 25% do valor dele.
        `);

        const embed_debug = new Discord.EmbedBuilder()
            .setColor("Green")
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })

        if (interaction.user.id === config.owner) {
            embed_debug.setDescription(`Olá ${interaction.user}, veja meus comandos de **debug** abaixo:
            /bugreport - Reporta um bug do bot para o desenvolvedor.
            /setstatus - Define o status do bot.
        `);
        } else {
            embed_debug.setDescription(`Olá ${interaction.user}, veja meus comandos de **debug** abaixo:
            /bugreport - Reporta um bug do bot para o desenvolvedor.
            `)
        }


        const embed_mod = new Discord.EmbedBuilder()
            .setColor("Aqua")
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`Olá ${interaction.user}, veja meus comandos de **administração** abaixo:
            /additem - Adiciona o item escolhido à loja.
            /announce - Envia um anúncio em embed para o canal selecionado.
            /antilink - Ativa/Desativa o sistema de bloqueio de links no servidor.
            /ban - Bane o usuário selecionado.
            /clear - Limpa mensagens do canal selecionado.
            /dm - Manda mensagem na DM do usuário selecionado.
            /kick - Expulsa o usuário selecionado.
            /lock - Bloqueia o canal desejado.
            /removeitem - Remove o item escolhido da loja.
            /rpb - Entrega cargos clicando nos botões.
            /setup - Define os IDs dos canais no servidor.
            /transcript - Exporta as mensagens do canal escolhido.
            /unban - Revoga o banimento do usuário selecionado.
            /unlock - Desbloqueia o canal desejado.
        `);

        const painel = new Discord.ActionRowBuilder().addComponents(
            new Discord.StringSelectMenuBuilder()
                .setCustomId("painel_help")
                .setPlaceholder("Clique aqui!")
                .addOptions(
                    {
                        label: "Painel Inicial",
                        emoji: "📖",
                        value: "painel",
                    },
                    {
                        label: "Utilidade",
                        description: "Veja meus comandos de utilidade.",
                        emoji: "✨",
                        value: "utilidade",
                    },
                    {
                        label: "Diversão",
                        description: "Veja meus comandos de diversão.",
                        emoji: "😅",
                        value: "diversao",
                    },
                    {
                        label: "Economia",
                        description: "Veja meus comandos de economia.",
                        emoji: "💸",
                        value: "economia",
                    },
                    {
                        label: "Debug",
                        description: "Veja meus comandos de debug.",
                        emoji: "📎",
                        value: "debug",
                    },
                    {
                        label: "Moderação",
                        description: "Veja meus comandos de moderação.",
                        emoji: "🔨",
                        value: "mod",
                    }
                )
        );

        interaction.reply({ embeds: [embed_painel], components: [painel], ephemeral: true })
            .then(() => {
                interaction.channel.createMessageComponentCollector()
                    .on("collect", (c) => {
                        let valor = c.values[0];

                        if (valor === "painel") {
                            c.deferUpdate();
                            interaction.editReply({ embeds: [embed_painel], ephemeral: true });
                        } else if (valor === "utilidade") {
                            c.deferUpdate();
                            interaction.editReply({ embeds: [embed_utilidade], ephemeral: true });
                        } else if (valor === "diversao") {
                            c.deferUpdate();
                            interaction.editReply({ embeds: [embed_diversao], ephemeral: true });
                        } else if (valor === "economia") {
                            c.deferUpdate();
                            interaction.editReply({ embeds: [embed_economia], ephemeral: true });
                        } else if ((valor === "debug" || valor === "mod") && hasPermission) {
                            if (valor === "debug") {
                                c.deferUpdate();
                                interaction.editReply({ embeds: [embed_debug], ephemeral: true });
                            } else {
                                c.deferUpdate();
                                interaction.editReply({ embeds: [embed_mod], ephemeral: true });
                            }
                        } else {
                            const permembed = new Discord.EmbedBuilder()
                                .setColor("Red")
                                .setTitle("❌ Você não possui permissão para acessar essa lista.");

                            interaction.reply({ embeds: [permembed], ephemeral: true });
                        }
                    });
            });
    },
};
