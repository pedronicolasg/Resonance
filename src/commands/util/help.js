const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");
const config = require("../../config.json");
const { hxmaincolor, success, error } = require("../../themes/main");

module.exports = {
  name: "help",
  description: "Painel de comandos do bot.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "commands",
      description: ".",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "debug",
          description: "lista de comandos de Debug",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "economy",
          description: "lista de comandos de Economia",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "fun",
          description: "lista de comandos de Diversão",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "moderation",
          description: "lista de comandos de Moderação",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "util",
          description: "lista de comandos de Utilidade",
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
    },
  ],

  run: async (client, interaction) => {
    const subCommand = interaction.options.getSubcommand();
    const permissionsArray = [
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.ManageGuild,
    ];
    const hasPermission = permissionsArray.some((permission) =>
      interaction.member.permissions.has(permission)
    );

    const warnEmbed = new EmbedBuilder()
      .setColor("Yellow")
      .setTitle("Você não possui permissão para acessar essa lista.");

    let embedDebug = new EmbedBuilder().setColor("Green").setAuthor({
      name: interaction.user.username,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    });

    if (interaction.user.id === config.owner) {
      embedDebug.setDescription(`Olá ${interaction.user}, veja meus comandos de **debug** abaixo:
          /bugreport - Reporta um bug do bot para o desenvolvedor.
          /setstatus - Define o status do bot.
    `);
    } else {
      embedDebug.setDescription(`Olá ${interaction.user}, veja meus comandos de **debug** abaixo:
          /bugreport - Reporta um bug do bot para o desenvolvedor.
    `);
    }

    let embedEconomy = new EmbedBuilder().setColor("Green").setAuthor({
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

    let embedFun = new EmbedBuilder().setColor("Yellow").setAuthor({
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

    let embedMod = new EmbedBuilder().setColor("Aqua").setAuthor({
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

    let embedUtils = new EmbedBuilder().setColor("Blue").setAuthor({
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

    if (subCommand === "economy") {
      interaction.reply({ embeds: [embedEconomy], ephemeral: true });
    } else if (subCommand === "fun") {
      interaction.reply({ embeds: [embedFun], ephemeral: true });
    } else if (subCommand === "util") {
      interaction.reply({ embeds: [embedUtils], ephemeral: true });
    } else if (
      (subCommand === "debug" && hasPermission) ||
      (subCommand === "moderation" && hasPermission)
    ) {
      if (subCommand === "debug") {
        interaction.reply({ embeds: [embedDebug], ephemeral: true });
      } else {
        interaction.reply({ embeds: [embedMod], ephemeral: true });
      }
    } else {
      interaction.reply({ embeds: [warnEmbed], ephemeral: true });
    }
  },
};
