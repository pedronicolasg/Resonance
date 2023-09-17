const Discord = require("discord.js");
const themes = require('../../themes/chalk-themes');
const apptheme = require('../../themes/theme.json');
const { logger } = require('../../events/client/logger');
const ServerSettings = require('../../database/models/servercfg');

module.exports = {
  name: 'announce',
  description: 'Anuncie algo em uma embed.',
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'título',
      description: 'Escreva algo.',
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'descrição',
      description: 'Escreva algo.',
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'cor',
      description: 'Coloque uma cor em hexadecimal.',
      type: Discord.ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
      let permembed = new Discord.EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Você não possui permissão para utilizar este comando.")
        .setDescription(`Você precisa da permissão "Administrador" para usar esse comando`);

      return interaction.reply({ embeds: [permembed], ephemeral: true });
    }

    let title = interaction.options.getString('título');
    let description = interaction.options.getString('descrição');
    let color = interaction.options.getString('cor');
    let error = new Discord.EmbedBuilder()
      .setColor("Red")
      .setTitle("❌ Erro ao enviar o anúncio.")
      .setDescription(
        `O canal de anúncios não foi configurado corretamente para este servidor.`
      );
    if (!color) color = '#48deff';

    try {
      const serverSettings = await ServerSettings.findOne({ serverId: interaction.guild.id });

      if (!serverSettings || !serverSettings.adschannelId) {
        return interaction.reply({ embeds: [error], ephemeral: true });
      }

      const channelId = serverSettings.adschannelId;
      const channel = client.channels.cache.get(channelId);
      if (!channel.isTextBased()) {
        let nottextchannelembed = new Discord.EmbedBuilder()
          .setColor("Red")
          .setTitle("❌ Algo deu errado ao enviar o anúncio.")
          .setDescription(`O canal não é de texto.`);
        return interaction.reply({
          embeds: [nottextchannelembed],
          ephemeral: true
        });
      }

      let embed = new Discord.EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color);

      channel.send({ embeds: [embed] }).then(() => {
        let successEmbed = new Discord.EmbedBuilder()
          .setColor(apptheme.maincolor)
          .setTitle("✅ Anúncio enviado!")
          .setDescription(`Seu anúncio foi enviado em ${channel} com sucesso.`);

        interaction.reply({ embeds: [successEmbed], ephemeral: true });
        const logchannelId = serverSettings.logchannelId;
        const logchannel = client.channels.cache.get(logchannelId);
        if (logchannel) {
          const logembed = new Discord.EmbedBuilder()
            .setColor('#48deff')
            .setDescription(`Um anúncio foi enviado em ${channel} por ${interaction.user}`);
          logchannel.send({ embeds: [logembed] });
        }
      }).catch((e) => {
        let errorembed = new Discord.EmbedBuilder()
          .setColor("Red")
          .setTitle("❌ Algo deu errado ao enviar o anúncio.")
          .setDescription(`Não foi possível enviar seu anúncio, tente novamente mais tarde.`);

        interaction.reply({ embeds: [errorembed], ephemeral: true });
        console.log(themes.error('Erro ') + 'ao enviar um anúncio: ' + e);
        logger.error('Erro ao enviar um anúncio: ', e);
      });
    } catch (e) {
      console.log(themes.error('Erro ') + 'ao buscar as configurações no MongoDB: ' + e);
      logger.error('Erro ao buscar as configurações no MongoDB: ', e);
      let errorembed = new Discord.EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Ocorreu um erro ao buscar as configurações no banco de dados.")
        .setDescription(`Não foi possível enviar seu anúncio, tente novamente mais tarde.`);

      interaction.reply({ embeds: [errorembed], ephemeral: true });
    }
  },
};
