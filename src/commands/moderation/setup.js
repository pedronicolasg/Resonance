const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { hxmaincolor, error } = require("../../themes/main");
const { sendLogEmbed, logger } = require("../../methods/loggers.js");
const { updateMessage, updateChannel } = require("../../methods/DB/server.js");

module.exports = {
  name: "setup",
  description: "Configura o bot.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "channels",
      description: "Configure os IDs dos canais.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "logchannelid",
          description: "ID do canal de Logs.",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "adschannelid",
          description: "ID do canal de anúncios.",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "exitchannelid",
          description: "ID do canal de saídas.",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "ruleschannelid",
          description: "ID do canal de regras.",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "gameschannelid",
          description: "ID do canal de jogos",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "welcomechannelid",
          description: "ID do canal de boas-vindas.",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "suggestionchannelid",
          description: "ID do canal de sugestões.",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
    {
      name: "messages",
      description: "Configure mensagens customizáveis.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "welcomemsg",
          description: "Configure a mensagem de boas-vindas.",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "exitmsg",
          description: "Configure a mensagem de saída.",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild || PermissionFlagsBits.ManageChannels)) {
      let warnEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("Você não possui permissão para utilizar este comando.")
        .setDescription(
          `Você precisa da permissão "Gerenciar Guilda" ou "Gerenciar Canais" para usar esse comando`
        );

      return interaction.reply({ embeds: [warnEmbed], ephemeral: true });
    }

    const serverId = interaction.guild.id;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "messages") {
      let welcomeMessage = interaction.options.getString("welcomemsg");
      let exitMessage = interaction.options.getString("exitmsg");

      try {
        if (welcomeMessage !== null) await updateMessage(serverId, "welcomeMessage", welcomeMessage);
        if (exitMessage !== null) await updateMessage(serverId, "exitMessage", exitMessage);

        let embed = new EmbedBuilder()
          .setColor(hxmaincolor)
          .setTitle("Sucesso ao customizar as mensagens!")
          .setDescription(`As mensagens foram customizadas!`);

        let logEmbed = new EmbedBuilder()
          .setColor(hxmaincolor)
          .setTitle("Alteração nas mensagens customizáveis")
          .setDescription(`O usuário ${interaction.user} mudou as mensagens.`);
        sendLogEmbed(client, interaction.guild.id, logEmbed);

        interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (e) {
        console.log(error("Erro ") + `ao customizar as mensagens devido à:\n ${e}`);
        logger.error(`Erro ao customizar as mensagens devido à: ${e}`);
        let errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Erro ao customizar mensagem!")
          .setDescription(`Erro ao customizar mensagem de boas-vindas, tente novamente mais tarde!`);

        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    } else if (subcommand === "channels") {
      let logchannelId = interaction.options.getString("logchannelid");
      let adschannelId = interaction.options.getString("adschannelid");
      let exitchannelId = interaction.options.getString("exitchannelid");
      let ruleschannelId = interaction.options.getString("ruleschannelid");
      let gameschannelId = interaction.options.getString("gameschannelid");
      let welcomechannelId = interaction.options.getString("welcomechannelid");
      let suggestionchannelId = interaction.options.getString("suggestionchannelid");

      try {
        if (logchannelId !== null) await updateChannel(serverId, "logchannelId", logchannelId);
        if (adschannelId !== null) await updateChannel(serverId, "adschannelId", adschannelId);
        if (exitchannelId !== null) await updateChannel(serverId, "exitchannelId", exitchannelId);
        if (ruleschannelId !== null) await updateChannel(serverId, "ruleschannelId", ruleschannelId);
        if (gameschannelId !== null) await updateChannel(serverId, "gameschannelId", gameschannelId);
        if (welcomechannelId !== null) await updateChannel(serverId, "welcomechannelId", welcomechannelId);
        if (suggestionchannelId !== null) await updateChannel(serverId, "suggestionchannelId", suggestionchannelId);

        let embed = new EmbedBuilder()
          .setColor(hxmaincolor)
          .setTitle("Sucesso ao definir os IDs")
          .setDescription(`IDs dos canais foram definidos com sucesso! Use /serverinfo para ver as configurações`);

        let logEmbed = new EmbedBuilder()
          .setColor(hxmaincolor)
          .setTitle("Alteração nos Ids dos canais")
          .setDescription(`O usuário ${interaction.user} mudou os IDs dos canais.`);
        sendLogEmbed(client, interaction.guild.id, logEmbed);

        interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (e) {
        console.log(error("Erro ") + `ao definir os IDs dos canais devido à:\n ${e}`);
        logger.error(`Erro ao definir os IDs dos canais devido à: ${e}`);
        let errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Erro ao definir os IDs.")
          .setDescription(`Erro ao definir os IDs dos canais.`);

        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  },
};
