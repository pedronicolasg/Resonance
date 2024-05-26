const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { hxmaincolor, error } = require("../../themes/main");
const { saveInteraction } = require("../../methods/DB/server"); // Serviço para lidar com interações no banco de dados
const { sendLogEmbed, logger } = require("../../methods/loggers");

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
      let warnEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("Você não possui permissão para utilizar este comando.")
        .setDescription(
          `Você precisa da permissão "Gerenciar Cargos" para usar esse comando`
        );

      return interaction.reply({ embeds: [warnEmbed], ephemeral: true });
    }

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

    try {
      await interaction.reply({ embeds: [embed], components: [botao] });

      // Salvar a interação no banco de dados
      await saveInteraction({
        customId: "cargo_b" + interaction.id,
        roleId: role.id,
        channelId: interaction.channel.id,
        guildId: interaction.guild.id,
      });

      let logEmbed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setDescription(
          `${interaction.user} criou uma interação de cargo por botão para o cargo ${role} no canal <#${interaction.channel.id}>`
        );
      sendLogEmbed(client, interaction.guild.id, logEmbed);
    } catch (e) {
      console.error("Erro ao criar interação de cargo:", e);
      let errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Erro ao criar interação de cargo")
        .setDescription("Ocorreu um erro ao tentar criar a interação de cargo.");
      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },

  handleInteraction: async (interaction, role) => {
    try {
      if (!interaction.member.roles.cache.has(role.id)) {
        await interaction.member.roles.add(role.id);
        interaction.reply({
          content: `Olá **${interaction.user.username}**, você resgatou o cargo **${role.name}**.`,
          ephemeral: true,
        });
      } else {
        await interaction.member.roles.remove(role.id);
        interaction.reply({
          content: `Olá **${interaction.user.username}**, você perdeu o cargo **${role.name}**.`,
          ephemeral: true,
        });
      }
    } catch (e) {
      console.log(
        error("Erro ") +
        `ao modificar o cargo ${role.name} para ${interaction.user.username} devido à: ${e}`
      );
      logger.error(
        `Erro ao modificar o cargo ${role.name} para ${interaction.user.username} devido à: ${e}`
      );
      interaction.reply({
        content: `Erro ao modificar o cargo **${role.name}**.`,
        ephemeral: true,
      });
    }
  }
};
