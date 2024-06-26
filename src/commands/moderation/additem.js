const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { hxmaincolor, error } = require("../../themes/main");
const { sendLogEmbed, logger } = require("../../methods/loggers");

const { addItemToStore } = require("../../methods/DB/economy");

module.exports = {
  name: "additem",
  description: "Adicione um item à loja do servidor.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "name",
      description: "Nome do item.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "description",
      description: "Descrição do item.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "cargo",
      description: "Cargo a ser adicionado à loja.",
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
    {
      name: "price",
      description: "Preço do item em moedas.",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      let warnEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("Permissão Necessária")
        .setDescription(
          `Você precisa da permissão de "Gerenciar Guilda" para usar este comando.`
        );

      return interaction.reply({ embeds: [warnEmbed], ephemeral: true });
    }

    const serverId = interaction.guild.id;
    const role = interaction.options.getRole("cargo");
    const name = interaction.options.getString("name");
    const description = interaction.options.getString("description");
    const price = interaction.options.getInteger("price");
    const addedBy = interaction.user.id;
    const itemId = role.id;
    const buyItemId = Math.floor(Math.random() * 900) + 100;

    try {
      const { success, newItem, message } = await addItemToStore(serverId, itemId, buyItemId, name, description, price, addedBy);

      if (!success) {
        let limitEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Limite Atingido")
          .setDescription(message);

        return interaction.reply({ embeds: [limitEmbed], ephemeral: true });
      }

      let embed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle("Item Adicionado à Loja!")
        .setDescription(
          `O item "${name}" foi adicionado à loja com sucesso.\nID do Item: ${newItem.buyItemId}`
        );

      interaction.reply({ embeds: [embed] });

      let logEmbed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle("Item Adicionado à Loja!")
        .setDescription(
          `O item "${name}" foi adicionado à loja por ${interaction.user}.\nID do Item: ${newItem.buyItemId}`
        );
      sendLogEmbed(client, interaction.guild.id, logEmbed);
    } catch (e) {
      console.log(error("Erro ") + `ao adicionar o item à loja devido à: ${e}`);
      logger.error(`Erro ao adicionar o item à loja devido à: ${e}`);
      let errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Erro ao Adicionar o Item à Loja")
        .setDescription("Não foi possível adicionar o item à loja.");

      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
