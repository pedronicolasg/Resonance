const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const ServerSettings = require("../../database/models/servercfg");
const { hxmaincolor, success, error } = require("../../themes/main");
const { logger } = require("../../events/client/logger");

module.exports = {
  name: "rpb",
  description: "Ganhe cargos clicando nos botões.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "cargo",
      description: "Mencione o cargo que deseja ser adicionado no botão.",
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      let permembed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Você não possui permissão para utilizar este comando.")
        .setDescription(
          `Você precisa da permissão "Gerencias Cargos" para usar esse comando`
        );

      return interaction.reply({ embeds: [permembed], ephemeral: true });
    }

    const serverSettings = await ServerSettings.findOne({
      serverId: interaction.guild.id,
    });

    const role = interaction.options.getRole("cargo");

    let embed = new EmbedBuilder()
      .setColor(hxmaincolor)
      .setAuthor({
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      })
      .setDescription(
        `Clique no botão abaixo para resgatar o cargo **${role.name}**.`
      );

    let botao = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("cargo_b" + interaction.id)
        .setLabel("Clique Aqui!")
        .setStyle(ButtonStyle.Secondary)
    );

    interaction.reply({ embeds: [embed], components: [botao] }).then(() => {
      const channelId = serverSettings.logchannelId;
      const logchannel = client.channels.cache.get(channelId);
      if (logchannel) {
        const logembed = new EmbedBuilder()
          .setColor("#48deff")
          .setDescription(
            `${interaction.user} criou uma interação de cargo por botão pro cargo ${role} no canal <#${interaction.channel.id}>`
          );
        logchannel.send({ embeds: [logembed] });
      }

      let coletor = interaction.channel.createMessageComponentCollector();
      coletor.on("collect", (c) => {
        if (!c.member.roles.cache.get(role.id)) {
          try {
            c.member.roles.add(role.id);
            c.reply({
              content: `Olá **${c.user.username}**, você resgatou o cargo **${role.name}**.`,
              ephemeral: true,
            });
          } catch (e) {
            console.log(
              error("Erro ") +
                `ao adicionar o cargo ${role.name} para ${c.user.username} devido à: ${e}`
            );
            logger.error(
              `Erro ao adicionar o cargo ${role.name} para ${c.user.username} devido à: ${e}`
            );
          }
        } else if (c.member.roles.cache.get(role.id)) {
          try {
            c.member.roles.remove(role.id);
            c.reply({
              content: `Olá **${c.user.username}**, você perdeu o cargo **${role.name}**.`,
              ephemeral: true,
            });
          } catch (e) {
            console.log(
              error("Erro ") +
                `ao remover o cargo ${role.name} de ${c.user.username}`
            );
            logger.error(
              `Erro ao remover o cargo ${role.name} de ${c.user.username}`
            );
          }
        }
      });
    });
  },
};
