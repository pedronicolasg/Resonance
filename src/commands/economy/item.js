const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const { hxmaincolor } = require("../../themes/main");
const { sendLogEmbed } = require("../../methods/loggers");
const { inventory, purchase, sell } = require("../../methods/DB/economy");
require('dotenv').config();

module.exports = {
  name: "item",
  description: `Gerencie seu inventário. Compre, venda e explore itens.`,
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "buy",
      description: `Compra um item`,
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "item_id",
          description: "ID do item que você deseja comprar.",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: "sell",
      description: `Vende um item`,
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "item_id",
          description: "ID do item que você deseja vender.",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: "inventory",
      description: `Lista todos os seus itens comprados.`,
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],

  run: async (client, interaction) => {
    let subCommand = interaction.options.getSubcommand();
    let userId = interaction.user.id;
    let serverId = interaction.guild.id;
    let buyItemId = interaction.options.getString("item_id");
    let member = interaction.guild.members.cache.get(userId);

    if (subCommand === "inventory") {
      try {
        let result = await inventory(userId, serverId);
        let foundItems = result;

        if (foundItems && foundItems.length > 0) {
          const itemDescriptions = foundItems.map(item => `**${item.name}**: ${item.description}`);
          const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("Itens que você possui neste servidor:")
            .setDescription(itemDescriptions.join("\n"));
          interaction.reply({ embeds: [embed] });
        } else {
          const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("Você não possui nenhum item.")
            .setDescription("Você ainda não comprou nenhum item na loja.");
          interaction.reply({ embeds: [embed] });
        }
      } catch (error) {
        console.error("Erro ao buscar o inventário:", error);
        const embed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Erro ao processar o comando")
          .setDescription("Ocorreu um erro ao processar o comando.");
        interaction.reply({ embeds: [embed] });
      }

    } else if (subCommand === "buy") {
      try {
        const purchaseResult = await purchase(userId, serverId, interaction.guild, buyItemId, member);

        if (purchaseResult.success) {
          const embed = new EmbedBuilder()
            .setColor(hxmaincolor)
            .setTitle("Compra Realizada!")
            .setDescription(`Você comprou o item "${purchaseResult.item.name}" da loja com sucesso.`);
          interaction.reply({ embeds: [embed] });

          const logEmbed = new EmbedBuilder()
            .setColor(hxmaincolor)
            .setTitle("Compra Realizada!")
            .setDescription(`${interaction.user} comprou o item "${purchaseResult.item.name}"! @${purchaseResult.addedByUserId} ganhou ${process.env.ECONOMY_COINSYMB}:${purchaseResult.rewardAmount} de comissão.`);
          sendLogEmbed(client, interaction.guild.id, logEmbed);
        }
      } catch (error) {
        console.error("Erro ao comprar o item:", error);
        const errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Erro ao Comprar Item")
          .setDescription("Ocorreu um erro ao tentar comprar o item.");
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

    } else if (subCommand === "sell") {
      try {
        const result = await sell(userId, serverId, interaction.guild.id, buyItemId, member);

        if (result === 'saleSuccessfull') {
          const embed = new EmbedBuilder()
            .setColor(hxmaincolor)
            .setTitle("Venda Realizada!")
            .setDescription(`Você vendeu o item com sucesso.\nVocê recebeu ${result.amountGained} ${process.env.ECONOMY_COINNAME}s.`);
          interaction.reply({ embeds: [embed] });

          const logEmbed = new EmbedBuilder()
            .setColor(hxmaincolor)
            .setTitle("Venda Realizada!")
            .setDescription(`${interaction.user} vendeu o item e ganhou ${process.env.ECONOMY_COINSYMB}:${result.amountGained} de volta!`);
          sendLogEmbed(client, interaction.guild.id, logEmbed);
        }
      } catch (error) {
        console.error("Erro ao vender o item:", error);
        const embed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Erro ao Vender Item")
          .setDescription("Ocorreu um erro ao tentar vender o item.");
        interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }
  },
};
