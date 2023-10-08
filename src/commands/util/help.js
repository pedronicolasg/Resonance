const {
  ApplicationCommandType,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");
const config = require("../../config.json");
const {
  hxmaincolor,
  success,
  error,
  hxnasaapod,
} = require("../../themes/main");

module.exports = {
  name: "help",
  description: "Painel de comandos do bot.",
  type: ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    const permissionsArray = [
      PermissionFlagsBits.Administrator,
      PermissionFlagsBits.ManageRoles,
      PermissionFlagsBits.KickMembers,
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.BanMembers,
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.ManageGuild,
    ];
    const hasPermission = permissionsArray.some((permission) =>
      interaction.member.permissions.has(permission)
    );

    const embed_painel = new EmbedBuilder()
      .setColor(hxmaincolor)
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `Olá ${interaction.user}, veja meus comandos interagindo com o painel abaixo:`
      );

    const embed_utilidade = new EmbedBuilder().setColor("Blue").setAuthor({
      name: interaction.user.username,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    })
      .setDescription(`Olá ${interaction.user}, veja meus comandos de **utilidade** abaixo:
            /botinfo - Fornece informações sobre o bot.
            /help - Mostra a lista de comandos do bot.
            /ping - Mostra o ping do bot.
            /serverinfo - Mostra as informações do servidor atual.
            /suggest - Envia sua sugestão para o canal de sugestões.
        `);

    const embed_diversao = new EmbedBuilder().setColor("Yellow").setAuthor({
      name: interaction.user.username,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    })
      .setDescription(`Olá ${interaction.user}, veja meus comandos de **diversão** abaixo:
            /apod - Envia a imagem astronômica da data escolhida.
            /avatar - Envia o avatar do usuário escolhido.
            /game 2048 - Inicia o jogo "2048".
            /game snake-game - Inicia o jogo da cobrinha.
            /game minesweeper - Inicia o jogo "Campo Minado"
        `);

    const embed_economia = new EmbedBuilder().setColor("Green").setAuthor({
      name: interaction.user.username,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    })
      .setDescription(`Olá ${interaction.user}, veja meus comandos de **economia** abaixo:
            /daily - Resgata seus ${config.economy.coinname}s diários.
            /weekly - Resgata seus ${config.economy.coinname}s semanais.
            /monthly - Resgata seus ${config.economy.coinname}s mensais.
            /yearly - Resgata seus ${config.economy.coinname}s anuais.
            /wallet - Mostra quantos ${config.economy.coinname}s você ou o usuário marcado tem.
            /transfer - Transfere dinheiro para o usuário escolhido.
            /store - Abre a loja do servidor atual.
            /buy - Compra itens na loja.
            /sell - Vende um cargo cadastrado na loja, recebendo 25% do valor dele.
        `);

    const embed_debug = new EmbedBuilder().setColor("Green").setAuthor({
      name: interaction.user.username,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    });

    if (interaction.user.id === config.owner) {
      embed_debug.setDescription(`Olá ${interaction.user}, veja meus comandos de **debug** abaixo:
            /bugreport - Reporta um bug do bot para o desenvolvedor.
            /setstatus - Define o status do bot.
        `);
    } else {
      embed_debug.setDescription(`Olá ${interaction.user}, veja meus comandos de **debug** abaixo:
            /bugreport - Reporta um bug do bot para o desenvolvedor.
            `);
    }

    const embed_mod = new EmbedBuilder().setColor("Aqua").setAuthor({
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

    const painel = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
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

    interaction
      .reply({ embeds: [embed_painel], components: [painel], ephemeral: true })
      .then(() => {
        interaction.channel
          .createMessageComponentCollector()
          .on("collect", (c) => {
            let valor = c.values[0];

            if (valor === "painel") {
              c.deferUpdate();
              interaction.editReply({
                embeds: [embed_painel],
                ephemeral: true,
              });
            } else if (valor === "utilidade") {
              c.deferUpdate();
              interaction.editReply({
                embeds: [embed_utilidade],
                ephemeral: true,
              });
            } else if (valor === "diversao") {
              c.deferUpdate();
              interaction.editReply({
                embeds: [embed_diversao],
                ephemeral: true,
              });
            } else if (valor === "economia") {
              c.deferUpdate();
              interaction.editReply({
                embeds: [embed_economia],
                ephemeral: true,
              });
            } else if (
              (valor === "debug" || valor === "mod") &&
              hasPermission
            ) {
              if (valor === "debug") {
                c.deferUpdate();
                interaction.editReply({
                  embeds: [embed_debug],
                  ephemeral: true,
                });
              } else {
                c.deferUpdate();
                interaction.editReply({ embeds: [embed_mod], ephemeral: true });
              }
            } else {
              const warnEmbed = new EmbedBuilder()
                .setColor("Yellow")
                .setTitle(
                  "Você não possui permissão para acessar essa lista."
                );

              interaction.reply({ embeds: [warnEmbed], ephemeral: true });
            }
          });
      });
  },
};
