const Discord = require("discord.js");
const StoreItem = require('../../models/storeItem');
const ServerSettings = require('../../models/servercfg');
const themes = require('../../themes/chalk-themes');
const { logger } = require('../../events/app/logger');

module.exports = {
  name: "additem",
  description: "Adicione um item à loja do servidor.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "name",
      description: "Nome do item.",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "description",
      description: "Descrição do item.",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "cargo",
      description: "Cargo a ser adicionado à loja.",
      type: Discord.ApplicationCommandOptionType.Role,
      required: true,
    },
    {
      name: "price",
      description: "Preço do item em moedas.",
      type: Discord.ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],

  run: async (client, interaction, args) => {
    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageGuild)) {
      const permembed = new Discord.EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Permissão Necessária")
        .setDescription(`Você precisa da permissão de "Gerenciar Guilda" para usar este comando.`);

      return interaction.reply({ embeds: [permembed], ephemeral: true });
    }

    const serverSettings = await ServerSettings.findOne({ serverId: interaction.guild.id });

    const role = interaction.options.getRole("cargo")

    const serverId = interaction.guild.id;
    const name = interaction.options.getString("name");
    const description = interaction.options.getString("description");
    const price = interaction.options.getInteger("price");
    const addedBy = interaction.user.id
    const itemId = role.id;



    try {
      const newItem = await StoreItem.create({
        serverId,
        itemId,
        name,
        description,
        price,
        addedBy,
      });

      const embed = new Discord.EmbedBuilder()
        .setColor("#48deff")
        .setTitle("Item Adicionado à Loja!")
        .setDescription(`O item "${name}" foi adicionado à loja com sucesso.\nID do Item: ${newItem.itemId}`);

      interaction.reply({ embeds: [embed] });

      const channelId = serverSettings.logchannelId;
      const logchannel = client.channels.cache.get(channelId);
      if (logchannel) {
        const logembed = new Discord.EmbedBuilder()
          .setColor("#48deff")
          .setTitle("Item Adicionado à Loja!")
          .setDescription(`O item "${name}" foi adicionado à loja por ${interaction.user}.\nID do Item: ${newItem.itemId}`);
        logchannel.send({ embeds: [logembed] });
      }
    } catch (e) {
      console.log(themes.error("Erro ") + `ao adicionar o item à loja devido à: ${e}`)
      logger.error(`Erro ao adicionar o item à loja devido à: ${e}`);
      const errorembed = new Discord.EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Erro ao Adicionar o Item à Loja")
        .setDescription("Não foi possível adicionar o item à loja.");

      interaction.reply({ embeds: [errorembed], ephemeral: true });
    }
  },
};
