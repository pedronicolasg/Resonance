const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const ServerCfg = require("../../database/models/servercfg.js");
const { hxmaincolor } = require("../../themes/main");

module.exports = {
  name: "serverinfo",
  description: "Envia as informações do atual servidor.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "geral",
      description: "Informações gerais do servidor",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "channels",
      description: "Mostra a configuração dos IDs dos canais",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "custommessages",
      description: "Mostra as mensagens customizadas para esse servidor",
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],

  run: async (client, interaction) => {
    const subCommand = interaction.options.getSubcommand();
    const permissionsArray = [
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.ManageMessages,
    ];
    const hasPermission = permissionsArray.some((permission) =>
      interaction.member.permissions.has(permission)
    );
    const warnEmbed = new EmbedBuilder()
      .setColor("Yellow")
      .setTitle("Você não possui permissão para acessar essa lista.");

    let guildId = interaction.guild.id;
    let guildName = interaction.guild.name;
    let guildIcon = interaction.guild.iconURL({ dynamic: true });

    let embedPanel = new EmbedBuilder()
      .setColor(hxmaincolor)
      .setAuthor({ name: guildName, iconURL: guildIcon })
      .setThumbnail(guildIcon);

    const serverConfig = await ServerCfg.findOne({ serverId: guildId });
    let embedChannels = new EmbedBuilder()
      .setColor(hxmaincolor)
      .setTitle("Canais")
      .setAuthor({ name: guildName, iconURL: guildIcon });

    let embedMessages = new EmbedBuilder()
      .setColor(hxmaincolor)
      .setTitle("Mensagens customizáveis")
      .setAuthor({ name: guildName, iconURL: guildIcon });

    if (subCommand === "geral") {
      let guildMembers = interaction.guild.memberCount;
      let guildOwner = interaction.guild.ownerId;
      let guildCreateDay =
        interaction.guild.createdAt.toLocaleDateString("pt-br");

      let totalChannels = interaction.guild.channels.cache.size;
      let textChannels = interaction.guild.channels.cache.filter(
        (c) => c.type === ChannelType.GuildText
      ).size;
      let voiceChannels = interaction.guild.channels.cache.filter(
        (c) => c.type === ChannelType.GuildVoice
      ).size;
      let categories = interaction.guild.channels.cache.filter(
        (c) => c.type === ChannelType.GuildCategory
      ).size;

      embedPanel.addFields(
        {
          name: `💻 Nome:`,
          value: `\`${guildName}\``,
          inline: true,
        },
        {
          name: `🆔 ID:`,
          value: `\`${guildId}\``,
          inline: true,
        },
        {
          name: `👥 Membros:`,
          value: `\`${guildMembers}\``,
          inline: true,
        },
        {
          name: `👑 Dono`,
          value: `<@${guildOwner}>`,
          inline: true,
        },
        {
          name: `🔧 Criação:`,
          value: `\`${guildCreateDay}\``,
          inline: true,
        },
        {
          name: `📤 Canais Totais:`,
          value: `\`${totalChannels}\``,
          inline: true,
        },
        {
          name: `📄 Canais de Texto:`,
          value: `\`${textChannels}\``,
          inline: true,
        },
        {
          name: `🔊 Canais de Voz:`,
          value: `\`${voiceChannels}\``,
          inline: true,
        },
        {
          name: `📅 Categorias:`,
          value: `\`${categories}\``,
          inline: true,
        }
      );

      interaction.reply({ embeds: [embedPanel], ephemeral: true });
    } else if (
      (subCommand === "channels" && hasPermission) ||
      (subCommand === "custommessages" && hasPermission)
    ) {
      if (subCommand === "channels") {
        if (serverConfig) {
          let logChannelId = serverConfig.logchannelId;
          let adsChannelId = serverConfig.adschannelId;
          let exitChannelId = serverConfig.exitchannelId;
          let rulesChannelId = serverConfig.ruleschannelId;
          let gamesChannelId = serverConfig.gameschannelId;
          let welcomeChannelId = serverConfig.welcomechannelId;
          let suggestionChannelId = serverConfig.suggestionchannelId;

          embedChannels.addFields(
            {
              name: "Canal de Logs",
              value: `<#${logChannelId}>`,
              inline: true,
            },
            {
              name: "Canal de Anúncios",
              value: `<#${adsChannelId}>`,
              inline: true,
            },
            {
              name: "Canal de Saídas",
              value: `<#${exitChannelId}>`,
              inline: true,
            },
            {
              name: "Canal de Regras",
              value: `<#${rulesChannelId}>`,
              inline: true,
            },
            {
              name: "Canal de Boas-Vindas",
              value: `<#${welcomeChannelId}>`,
              inline: true,
            },
            {
              name: "Canal de Sugestões",
              value: `<#${suggestionChannelId}>`,
              inline: true,
            },
            {
              name: "Canal de Jogos",
              value: `<#${gamesChannelId}>`,
              inline: true,
            }
          );
        } else {
          embedChannels.addFields({
            name: "Não configurado",
            value: "Use **/setup channels** para configurar.",
            inline: true,
          });
        }
        await interaction.reply({ embeds: [embedChannels], ephemeral: true });
      } else {
        let welcomeMessage = serverConfig.welcomeMessage;
        let exitMessage = serverConfig.exitMessage;
        if (serverConfig?.welcomeMessage && serverConfig?.exitMessage) {
          embedMessages.addFields(
            {
              name: "Mensagem de boas vindas",
              value: welcomeMessage,
              inline: true,
            },
            {
              name: "Mensagem de saída",
              value: exitMessage,
              inline: true,
            }
          );
        } else {
          embedMessages.addFields({
            name: "Não configurado",
            value: "Use **/setup messages** para configurar.",
            inline: true,
          });
        }
        await interaction.reply({ embeds: [embedMessages], ephemeral: true });
      }
    } else {
      await interaction.reply({ embeds: [warnEmbed], ephemeral: true });
    }
  },
};
