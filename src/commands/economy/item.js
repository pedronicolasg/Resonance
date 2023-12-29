const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const StoreItem = require("../../database/models/storeItem");
const Wallet = require("../../database/models/wallet");
const { hxmaincolor, error } = require("../../themes/main");
const { sendLogEmbed, logger } = require("../../methods/loggers");
const { economy } = require("../../config.json");

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
    const subCommand = interaction.options.getSubcommand();

    const userId = interaction.user.id;
    const serverId = interaction.guild.id;
    const buyItemId = interaction.options.getString("item_id");
    const member = interaction.guild.members.cache.get(userId);

    if (subCommand === "inventory") {
      return interaction.reply("soon...");
    } else if (subCommand === "buy") {
      try {
        const item = await StoreItem.findOne({
          serverId,
          buyItemId: buyItemId,
        });
        if (!item) {
          let errorEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Item não encontrado")
            .setDescription(
              "O item que você deseja comprar não foi encontrado na loja."
            );

          interaction.reply({ embeds: [errorEmbed], ephemeral: true });
          return;
        }

        const user = await Wallet.findOne({ userId });

        if (!user || user.coins < item.price) {
          let errorEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Saldo Insuficiente")
            .setDescription(
              "Você não possui moedas suficientes para comprar este item."
            );

          interaction.reply({ embeds: [errorEmbed], ephemeral: true });
          return;
        }

        if (!member) {
          let errorEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Usuário não encontrado")
            .setDescription(
              "Não foi possível encontrar o seu usuário no servidor."
            );

          interaction.reply({ embeds: [errorEmbed], ephemeral: true });
          return;
        }

        const itemId = item.itemId;

        if (member.roles.cache.has(itemId)) {
          let warnEmbed = new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("Você já possui o cargo")
            .setDescription("Você já possui o cargo associado a este item.");

          interaction.reply({ embeds: [warnEmbed], ephemeral: true });
          return;
        }

        const role = interaction.guild.roles.cache.get(itemId);

        if (!role) {
          let errorEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Cargo não encontrado")
            .setDescription(
              "O cargo associado a este item não foi encontrado no servidor."
            );

          interaction.reply({ embeds: [errorEmbed], ephemeral: true });
          return;
        }

        try {
          await member.roles.add(role);
        } catch (e) {
          console.log("Erro ao adicionar cargo ao usuário:", e);
          let errorEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Erro ao Adicionar Cargo")
            .setDescription(
              "Não foi possível adicionar o cargo ao seu usuário."
            );

          interaction.reply({ embeds: [errorEmbed], ephemeral: true });
          return;
        }

        const rewardAmount = Math.round(item.price * 0.25);

        const addedByUserId = item.addedBy;
        const addedByUser = await Wallet.findOne({ userId: addedByUserId });

        if (addedByUser) {
          addedByUser.coins += rewardAmount;
          await addedByUser.save();
        } else {
          console.log(
            `Usuário com ID ${addedByUserId} não encontrado na carteira.`
          );
        }

        user.coins -= item.price;
        await user.save();

        let embed = new EmbedBuilder()
          .setColor(hxmaincolor)
          .setTitle("Compra Realizada!")
          .setDescription(
            `Você comprou o item "${item.name}" da loja com sucesso.`
          );

        interaction.reply({ embeds: [embed] });

        let logEmbed = new EmbedBuilder()
          .setColor(hxmaincolor)
          .setTitle("Compra Realizada!")
          .setDescription(
            `${interaction.user} comprou o item "${item.name}"! @${addedByUserId} ganhou ${economy.coinsymb}:${rewardAmount} de comissão.`
          );
        sendLogEmbed(client, interaction.guild.id, logEmbed);
      } catch (e) {
        let errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Erro ao Comprar Item")
          .setDescription("Ocorreu um erro ao tentar comprar o item.");
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        console.log(
          error("Erro ") + `ao comprar o item da loja devido à: ${e}`
        );
        logger.error(`Erro ao comprar o item da loja devido à: ${e}`);
      }
    } else {
      try {
        const item = await StoreItem.findOne({
          serverId,
          buyItemId: buyItemId,
        });

        if (!item) {
          let errorEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Item não encontrado")
            .setDescription(
              "O item que você deseja vender não foi encontrado na loja."
            );

          interaction.reply({ embeds: [errorEmbed], ephemeral: true });
          return;
        }

        const itemId = item.itemId;

        if (member && member.roles.cache.has(itemId)) {
          const role = interaction.guild.roles.cache.get(itemId);

          if (role) {
            try {
              await member.roles.remove(role);
            } catch (e) {
              let errorEmbed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("Erro ao Remover Cargo")
                .setDescription(
                  "Não foi possível remover o cargo do seu usuário."
                );

              interaction.reply({ embeds: [errorEmbed], ephemeral: true });
              return;
            }

            const user = await Wallet.findOne({ userId });

            if (user) {
              const amountGained = Math.round(item.price * 0.25);

              user.coins += amountGained;
              await user.save();

              let embed = new EmbedBuilder()
                .setColor(hxmaincolor)
                .setTitle("Venda Realizada!")
                .setDescription(
                  `Você vendeu o item "${item.name}" da loja com sucesso.\nVocê recebeu ${amountGained} ${economy.coinname}s.`
                );

              interaction.reply({ embeds: [embed] });

              let logEmbed = new EmbedBuilder()
                .setColor(hxmaincolor)
                .setTitle("Venda Realizada!")
                .setDescription(
                  `${interaction.user} vendeu o item "${item.name}" e ganhou ${economy.coinsymb}:${amountGained} de volta!`
                );
              sendLogEmbed(client, interaction.guild.id, logEmbed);
            } else {
              let errorEmbed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("Usuário não encontrado")
                .setDescription(
                  `Usuário com ID ${userId} não encontrado na carteira.`
                );
              interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
          } else {
            let errorEmbed = new EmbedBuilder()
              .setColor("Red")
              .setTitle("Cargo não encontrado")
              .setDescription(
                "O cargo associado a este item não foi encontrado no servidor."
              );

            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
          }
        } else {
          let warnEmbed = new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("Você não possui o Cargo")
            .setDescription("Você não possui o cargo associado a este item.");

          interaction.reply({ embeds: [warnEmbed], ephemeral: true });
        }
      } catch (e) {
        let errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Erro ao Vender Item")
          .setDescription("Ocorreu um erro ao tentar vender o item.");
        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        console.log(error("Erro ") + `ao vender o item da loja devido à: ${e}`);
        logger.error(`Erro ao vender o item da loja devido à: ${e}`);
      }
    }
  },
};
