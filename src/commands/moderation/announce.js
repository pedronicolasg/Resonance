const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { hxmaincolor } = require("../../themes/main");
const { sendLogEmbed, logger } = require("../../methods/loggers");
const ServerSettings = require("../../methods/DB/models/servercfg");

module.exports = {
  name: "announce",
  description: "Anuncie algo em uma embed.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "título",
      description: "Escreva algo.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "descrição",
      description: "Escreva algo.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "cor",
      description: "Coloque uma cor em hexadecimal.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "mention",
      description: "Marque o cargo que deve ser notificado",
      type: ApplicationCommandOptionType.Role,
      required: false,
    },
  ],

  run: async (client, interaction) => {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      let warnEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("Você não possui permissão para utilizar este comando.")
        .setDescription(
          `Você precisa da permissão "Administrador" para usar esse comando`
        );

      return interaction.reply({ embeds: [warnEmbed], ephemeral: true });
    }

    let title = interaction.options.getString("título");
    let description = interaction.options.getString("descrição");
    let color = interaction.options.getString("cor");
    let mention = interaction.options.getRole("mention");
    let error = new EmbedBuilder()
      .setColor("Red")
      .setTitle("Erro ao enviar o anúncio.")
      .setDescription(
        `O canal de anúncios não foi configurado corretamente para este servidor.`
      );
    if (!color) color = hxmaincolor;

    try {
      const serverSettings = await ServerSettings.findOne({
        serverId: interaction.guild.id,
      });

      if (!serverSettings?.adschannelId) {
        return interaction.reply({ embeds: [error], ephemeral: true });
      }

      const channelId = serverSettings.adschannelId;
      const channel = client.channels.cache.get(channelId);
      if (!channel.isTextBased()) {
        let errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Algo deu errado ao enviar o anúncio.")
          .setDescription(`O canal não é de texto.`);
        return interaction.reply({
          embeds: [errorEmbed],
          ephemeral: true,
        });
      }

      let embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color);

      channel
        .send({ embeds: [embed] })
        .then(() => {
          let embed = new EmbedBuilder()
            .setColor(hxmaincolor)
            .setTitle("✅ Anúncio enviado!")
            .setDescription(
              `Seu anúncio foi enviado em ${channel} com sucesso.`
            );

          interaction.reply({ embeds: [embed], ephemeral: true });
          let logEmbed = new EmbedBuilder()
            .setColor(hxmaincolor)
            .setDescription(
              `Um anúncio foi enviado em ${channel} por ${interaction.user}`
            );
          sendLogEmbed(client, interaction.guild.id, logEmbed);
        })
        .catch((e) => {
          let errorEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Algo deu errado ao enviar o anúncio.")
            .setDescription(
              `Não foi possível enviar seu anúncio, tente novamente mais tarde.`
            );

          interaction.reply({ embeds: [errorEmbed], ephemeral: true });
          console.log(error("Erro ") + `ao enviar um anúncio:\n ${e}`);
          logger.error(`Erro ao enviar um anúncio: ${e}`);
        });
    } catch (e) {
      console.log(
        `Erro ao buscar as configurações no MongoDB:\n ${e}`
      );
      logger.error("Erro ao buscar as configurações no MongoDB: ", e);
      let errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(
          "Ocorreu um erro ao buscar as configurações no banco de dados."
        )
        .setDescription(
          `Não foi possível enviar seu anúncio, tente novamente mais tarde.`
        );

      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
