const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");
require('dotenv').config();
const { hxmaincolor } = require("../../themes/main");
const { transferCoins } = require("../../methods/DB/economy");

module.exports = {
  name: "transfer",
  description: `Transfere ${process.env.ECONOMY_COINNAME}s para outro usuário.`,
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "usuário",
      description: `Mencione o usuário para enviar ${process.env.ECONOMY_COINNAME}s.`,
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "quantidade",
      description: `Quantidade de ${process.env.ECONOMY_COINNAME}s para enviar.`,
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const senderId = interaction.user.id;
    const recipientId = interaction.options.getUser("usuário").id;
    const amount = interaction.options.getInteger("quantidade");

    try {
      const result = await transferCoins(senderId, recipientId, amount);

      let embed = new EmbedBuilder()
        .setColor(hxmaincolor)
        .setTitle(result.title)
        .setDescription(result.description);

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
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
