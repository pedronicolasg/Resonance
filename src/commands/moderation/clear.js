const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { hxmaincolor, success, error } = require("../../themes/main");
const { sendLogEmbed, logger } = require("../../methods/loggers");
const ServerSettings = require("../../database/models/servercfg");

module.exports = {
  name: "clear",
  description: "Limpa o canal de texto",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "quantidade",
      description: "Número de mensagens para serem apagadas.",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)
    ) {
      let warnEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("Você não possui permissão para utilizar este comando.")
        .setDescription(
          `Você precisa da permissão "Gerenciar Mensagens" para usar esse comando`
        );

      return interaction.reply({ embeds: [warnEmbed], ephemeral: true });
    }

    let number = interaction.options.getNumber("quantidade");

    try {
      const messages = await interaction.channel.messages.fetch({
        limit: number,
      });
      const oldMessages = messages.filter(
        (msg) => Date.now() - msg.createdTimestamp >= 1209600000
      );

      if (oldMessages.size > 0) {
        oldMessages.forEach(async (msg) => {
          await msg.delete();
        });
      }

      const remainingMessages = messages.filter(
        (msg) => !oldMessages.has(msg.id)
      );
      await interaction.channel.bulkDelete(remainingMessages);
      let user = interaction.user;
      let embed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setAuthor({
          name: user.username,
          iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(
          `O canal de texto ${interaction.channel} teve \`${number}\` mensagens deletadas por ${interaction.user}.`
        );

      interaction.reply({ embeds: [embed], ephemeral: true });
      sendLogEmbed(client, interaction.guild.id, embed)
    } catch (e) {
      console.log(
        error(`Erro `) +
          `ao usuário ${interaction.user.username} tentar deletar ${number} mensagens do canal de texto ${interaction.channel} devido à: \n ${e}`
      );
      logger.error(
        `Erro ao usuário ${interaction.user.username} tentar deletar ${number} mensagens do canal de texto ${interaction.channel} devido à: \n ${e}`
      );

      let embed = new EmbedBuilder()
        .setColor("Red")
        .setAuthor({
          name: interaction.guild.name,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        })
        .setDescription(
          `Erro ao usuário ${interaction.user.username} tentar deletar ${number} mensagens do canal de texto ${interaction.channel} devido à: \n ${e}`
        );

      interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
