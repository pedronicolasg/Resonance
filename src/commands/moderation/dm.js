const Discord = require("discord.js");
const themes = require('../../themes/chalk-themes');
const apptheme = require('../../themes/theme.json');
const { logger } = require('../../events/client/logger');

module.exports = {
  name: "dm",
  description: "Envie uma mensagem no privado de um usuário.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "usuário",
      description: "Mencione um usuário.",
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "mensagem",
      description: "Escreva algo para ser enviado.",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageMessages)) {
      let permembed = new Discord.EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Você não possui permissão para utilizar este comando.")
        .setDescription(`Você precisa da permissão "Gerencias Mensagens" para usar esse comando`);

      return interaction.reply({ embeds: [permembed], ephemeral: true });
    }
    let user = interaction.options.getUser("usuário");
    let msg = interaction.options.getString("mensagem");

    let embed = new Discord.EmbedBuilder()
      .setColor(apptheme.maincolor)
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(`${msg}`);

    user
      .send({ embeds: [embed] })
      .then(() => {
        let emb = new Discord.EmbedBuilder()
          .setColor(apptheme.maincolor)
          .setDescription(
            `A mensagem foi enviada para ${user} com sucesso!`
          );

        interaction.reply({ embeds: [emb] });
      })
      .catch((e) => {
        let emb = new Discord.EmbedBuilder()
          .setColor("Red")
          .setDescription(
            `❌ Erro, a mensagem não foi enviada para ${user}, pois o usuário está com a DM fechada!`
          );
        interaction.reply({ embeds: [emb] });
        console.log(themes.error("Erro ") + "ao enviar DM: " + e)
        logger.error(`Erro ao enviar DM: ${e}`);
      });
  },
};
