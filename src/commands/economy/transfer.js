const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const { economy } = require("../../config.json");
const { hxmaincolor, success, error } = require("../../themes/main");
const { logger, logger_economy } = require("../../events/client/logger");
const Wallet = require("../../database/models/wallet");

module.exports = {
  name: "transfer",
  description: `Transfere ${economy.coinname}s para outro usuário.`,
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "usuário",
      description: `Mencione o usuário para enviar ${economy.coinname}s.`,
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "quantidade",
      description: `Quantidade de ${economy.coinname}s para enviar.`,
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],

  run: async (client, interaction, args) => {
    const senderId = interaction.user.id;
    const recipientId = interaction.options.getUser("usuário").id;

    const recipientUser = await interaction.client.users.fetch(recipientId);

    if (recipientUser.bot) {
      let warnEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("Destinatário é um bot!")
        .setDescription("Você não pode enviar moedas para um bot.");

      interaction.reply({ embeds: [warnEmbed], ephemeral: true });
      return;
    }

    const amount = interaction.options.getInteger("quantidade");

    if (amount <= 0) {
      let errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Quantidade inválida!")
        .setDescription("A quantidade de moedas deve ser maior que 0.");

      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }

    try {
      let sender = await Wallet.findOne({ userId: senderId });
      let recipient = await Wallet.findOne({ userId: recipientId });

      if (!sender || sender.coins < amount) {
        let errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Saldo insuficiente!")
          .setDescription(
            "Você não possui moedas suficientes para enviar essa quantidade."
          );

        interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
      }

      sender.coins -= amount;
      recipient = recipient || new Wallet({ userId: recipientId });
      recipient.coins = (recipient.coins || 0) + amount;

      await sender.save();
      await recipient.save();

      let embed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle("Pagamento realizado!")
        .setDescription(
          `Você enviou \`${amount} ${economy.coinname}s\` para <@${recipientId}>.\nSeu saldo atual: \`${sender.coins} ${economy.coinname}s\``
        );

      interaction.reply({ embeds: [embed] });
      logger_economy.info(
        `${interaction.user.id} transferiu ${economy.coinsymb}:${amount} para ${recipientId} no servidor ${interaction.guild.id}`
      );
    } catch (e) {
      console.log(
        error("Erro ") +
          `ao enviar ${economy.coinsymb}:${amount} de ${senderId} para ${recipientId} devido à:\n ${e}`
      );
      logger.error(
        `Erro ao enviar ${economy.coinsymb}:${amount} de ${senderId} para ${recipientId} devido à:\n ${e}`
      );

      let errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Erro ao enviar moedas!")
        .setDescription(
          "Não foi possível completar a transação, tente novamente mais tarde."
        );

      interaction.reply({ embeds: [errorEmbed] });
    }
  },
};
