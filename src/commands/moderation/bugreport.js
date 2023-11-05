const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { owner } = require("../../config.json");
const { logger } = require("../../methods/loggers");
const { hxmaincolor, error } = require("../../themes/main");

module.exports = {
  name: "bugreport",
  description: "Reporte um bug para o desenvolvedor.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "bug",
      description: "Descreva o bug encontrado.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "image",
      description: "Print do bug",
      type: ApplicationCommandOptionType.Attachment,
      required: false,
    },
  ],

  run: async (client, interaction) => {
    if (
      !interaction.member.permissions.has(
        PermissionFlagsBits.PrioritySpeaker || PermissionFlagsBits.ManageGuild
      )
    ) {
      let warnEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("Você não possui permissão para utilizar este comando.")
        .setDescription(
          `Você precisa da permissão "Voz prioritária" ou "Gerenciar servidor" para usar esse comando!`
        );

      return interaction.reply({ embeds: [warnEmbed], ephemeral: true });
    }

    const bugDescription = interaction.options.getString("bug");
    const bugImage = interaction.options.getAttachment("image", true);
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    const fileName = bugImage.name.toLowerCase();

    if (!allowedExtensions.some((extension) => fileName.endsWith(extension))) {
      let errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Erro ao enviar a imagem")
        .setDescription(
          `Os únicos formatos de arquivos aceitos são os seguintes:\n${allowedExtensions.join(
            ", "
          )}`
        );

      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }

    const devUser = await client.users.fetch(owner);

    if (!devUser) {
      let errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Usuário do desenvolvedor não encontrado.")
        .setDescription(
          `O ID do dono/desenvolvedor não foi configurado no bot, infelizmente até que o ID seja configurado você não poderá utilizar esse comando para reportar bugs do bot.`
        );
      interaction.reply({ embeds: [errorEmbed], ephemeral: true });

      console.log(error("Erro ") + `ID do dono/desenvolvedor não configurado.`);
      logger.error(`Erro ID do dono/desenvolvedor não configurado.`);
      return;
    }

    try {
      let reportEmbed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle("Bug Report")
        .setDescription(`Bug report enviado por ${interaction.user}.`)
        .setImage(bugImage.url)
        .addFields({
          name: "Descrição do Bug",
          value: bugDescription,
          inline: true,
        });
      await devUser.send({ embeds: [reportEmbed] });
      let embed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle("Bug Report enviado!")
        .setDescription(
          `Obrigado por relatar um bug! Seu report foi enviado ao desenvolvedor.`
        );

      interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (e) {
      let errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Erro ao enviar o bug report.")
        .setDescription(
          `Erro ao enviar o bug report para a DM do desenvolvedor.`
        );

      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      console.log(
        error("Erro ") + `ao enviar o bug report para a DM do desenvolvedor.`
      );
      logger.error(`Erro ao enviar o bug report para a DM do desenvolvedor.`);
    }
  },
};
