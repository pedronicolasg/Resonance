const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { hxmaincolor, error } = require("../../themes/main");
const { logger } = require("../../methods/loggers");

module.exports = {
  name: "dm",
  description: "Envie uma mensagem no privado de um usuário.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "usuário",
      description: "Mencione um usuário.",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "mensagem",
      description: "Escreva algo para ser enviado.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  run: async (interaction) => {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)
    ) {
      let warnEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("Você não possui permissão para utilizar este comando.")
        .setDescription(
          `Você precisa da permissão "Gerencias Mensagens" para usar esse comando`
        );

      return interaction.reply({ embeds: [warnEmbed], ephemeral: true });
    }
    let user = interaction.options.getUser("usuário");
    let msg = interaction.options.getString("mensagem");

    let embed = new EmbedBuilder()
      .setColor(hxmaincolor)
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(`${msg}`);

    user
      .send({ embeds: [embed] })
      .then(() => {
        let emb = new EmbedBuilder()
          .setColor(hxmaincolor)
          .setDescription(`A mensagem foi enviada para ${user} com sucesso!`);

        interaction.reply({ embeds: [emb] });
      })
      .catch((e) => {
        let emb = new EmbedBuilder()
          .setColor("Red")
          .setDescription(
            `Erro, a mensagem não foi enviada para ${user}, pois o usuário está com a DM fechada!`
          );
        interaction.reply({ embeds: [emb] });
        console.log(error("Erro ") + "ao enviar DM: " + e);
        logger.error(`Erro ao enviar DM: ${e}`);
      });
  },
};
