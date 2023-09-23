const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const { owner } = require("../../config.json");
const { hxmaincolor, success, error } = require("../../themes/main");
const { logger } = require("../../events/client/logger");

module.exports = {
  name: "setstatus",
  description: "Configure meu status.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "status-type",
      description:
        "Qual estilo você deseja aplicar (online, dnd, idle, invisible)?",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "descrição",
      description: "Qual será a descrição do status?",
      required: true,
    },
  ],

  run: async (client, interaction) => {
    if (interaction.user.id !== owner) {
      const permembed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Você não possui permissão para utilizar este comando.")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setDescription("Somente meu dono pode usar esse comando!");

      interaction.reply({ embeds: [permembed], ephemeral: true });
      return;
    }

    try {
      const status = interaction.options.getString("status-type");
      const desc = interaction.options.getString("descrição");

      client.user.setStatus(status);

      client.user.setPresence({
        activities: [
          {
            name: desc,
          },
        ],
      });

      const embed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle("Status atualizado!")
        .addFields(
          {
            name: "🔮 Mudei meu status para:",
            value: `\`${status}\`.`,
            inline: false,
          },
          {
            name: "📝 Mudei minha descrição para:",
            value: `\`${desc}\`.`,
            inline: false,
          }
        );

      await interaction.reply({ embeds: [embed], ephemeral: true });
      console.log(
        success("Sucesso ") + `ao mudar status do bot para: ${status}`
      );
      logger.error(`Sucesso ao mudar status do bot para: ${status}`);
    } catch (e) {
      console.log(error("Erro ") + "ao mudar status do bot: " + e);
      logger.error(`Erro ao mudar status do bot: ${e}`);
    }
  },
};
