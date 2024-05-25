const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const StoreItem = require("../../methods/DB/models/storeItem");
const Wallet = require("../../methods/DB/models/wallet");
const { hxmaincolor, error } = require("../../themes/main");
const { sendLogEmbed, logger } = require("../../methods/loggers");
const { formatItemID } = require("../../methods/idFormater");

module.exports = {
  name: "removeitem",
  description: "Remova um item da loja do servidor.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "item_ids",
      description:
        "IDs dos itens que você deseja remover (separados por vírgula)",
      type: ApplicationCommandOptionType.String,
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
    const buyitemIds = interaction.options.getString("item_ids").split(",");
    const trimmedIds = buyitemIds.map((id) => id.trim());

    try {
      const deletedItems = await StoreItem.find({
        serverId,
        buyItemId: { $in: trimmedIds },
      });

      const items = await StoreItem.deleteMany({
        serverId,
        buyItemId: { $in: trimmedIds },
      });

      if (items.deletedCount === 0) {
        let embed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Itens não Encontrados")
          .setDescription(
            "Nenhum dos itens com os IDs especificados foi encontrado na loja."
          );

        interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      for (let deletedItem of deletedItems) {
        let users = await Wallet.find({ "items": formatItemID(serverId, deletedItem.buyItemId) });

        for (let user of users) {
          user.items = user.items.filter((item) => item !== formatItemID(serverId, deletedItem.buyItemId));
          await user.save();

          let memberId = user.userId;
          let member = interaction.guild.members.cache.get(memberId);

          if (member) {
            let roleId = deletedItem.itemId;
            let role = interaction.guild.roles.cache.get(roleId);

            if (role) {
              try {
                await member.roles.remove(role);
              } catch (e) {
                console.log(
                  error("Erro ") +
                  `ao remover o cargo do usuário ${memberId} devido à: ${e}`
                );
              }
            }
          }
        }
      }
      
      let embed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle("Itens Removidos da Loja!")
        .setDescription(
          `Os itens com os IDs ${buyitemIds.join(
            ", "
          )} foram removidos da loja e das carteiras dos usuários com sucesso.`
        );

      interaction.reply({ embeds: [embed] });

      let logEmbed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle("Itens Removidos da Loja!")
        .setDescription(
          `Os itens com os IDs ${buyitemIds.join(
            ", "
          )} foram removidos da loja e das carteiras dos usuários por ${interaction.user}.`
        );
      sendLogEmbed(client, interaction.guild.id, logEmbed);
    } catch (e) {
      console.log(
        error("Erro ") + `ao remover os itens da loja devido à: ${e}`
      );
      logger.error(`Erro ao remover os itens da loja devido à: ${e}`);
      let errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Erro ao Remover os Itens da Loja")
        .setDescription("Não foi possível remover os itens da loja.");

      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
