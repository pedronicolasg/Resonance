const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const config = require("../../config.json");

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

    let embedEconomy = new EmbedBuilder().setColor("Green").setAuthor({
      name: interaction.user.username,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    })
      .setDescription(`Olá ${interaction.user}, veja meus comandos de **economia** abaixo:
          /buy - Compra itens na loja.
          /daily - Resgata seus ${config.economy.coinname}s diários.
          /monthly - Resgata seus ${config.economy.coinname}s mensais.
          /sell - Vende um cargo cadastrado na loja, recebendo 25% do valor dele.
          /transfer - Transfere dinheiro para o usuário escolhido.
          /weekly - Resgata seus ${config.economy.coinname}s semanais.
          /yearly - Resgata seus ${config.economy.coinname}s anuais.
          /store - Abre a loja do servidor atual.
          /wallet - Mostra quantos ${config.economy.coinname}s você ou o usuário marcado tem.
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
          /game minesweeper - Inicia o jogo "Campo Minado".
    `);

    let embedMod = new EmbedBuilder().setColor("Aqua").setAuthor({
      name: interaction.user.username,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
    })
      .setDescription(`Olá ${interaction.user}, veja meus comandos de **moderação** abaixo:
          /additem - Adiciona o item escolhido à loja.
          /announce - Envia um anúncio em embed para o canal selecionado.
          /ban - Bane o usuário selecionado.
          /bugreport - Use para reportar um bug do bot.
          /clear - Limpa mensagens do canal selecionado.
          /dm - Manda mensagem na DM do usuário selecionado.
          /kick - Expulsa o usuário selecionado.
          /lock - Bloqueia o canal desejado.
          /removeitem - Remove o item escolhido da loja.
          /rpb - Entrega cargos clicando nos botões.
          /setup channels - Define os IDs dos canais no servidor.
          /setup messages - Define as mensagens customizáveis no servidor.
          /serverinfo channels - Mostra os IDs dos canais configurados para o servidor atual.
          /serverinfo messages - Mostra as mensagens customizadas para o servidor atual.
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
          /help economy - Mostra a lista de comandos de economia do bot.
          /help fun - Mostra a lista de comandos de diversão do bot.
          /help moderation - Mostra a lista de comandos de moderação do bot.
          /help util - Mostra a lista de comandos de utilidades do bot.
          /serverinfo geral - Mostra as informações do servidor atual.
          /status - Mostra o status do bot.
          /suggest - Envia sua sugestão para o canal de sugestões.
    `);

    if (subCommand === "economy") {
      interaction.reply({ embeds: [embedEconomy], ephemeral: true });
    } else if (subCommand === "fun") {
      interaction.reply({ embeds: [embedFun], ephemeral: true });
    } else if (subCommand === "util") {
      interaction.reply({ embeds: [embedUtils], ephemeral: true });
    } else {
      interaction.reply({ embeds: [embedMod], ephemeral: true });
    }
  },
};
