const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const { TwoZeroFourEight, Snake, Minesweeper } = require("discord-gamecord");
const { hxmaincolor, error } = require("../../themes/main");
require("dotenv").config();
const { logger } = require("../../methods/loggers");
const Wallet = require("../../methods/DB/models/wallet");
const ServerSettings = require("../../methods/DB/models/servercfg");

module.exports = {
  name: "game",
  description: "Escolha um jogo e divirta-se :)",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "2048",
      description: `Aumente os números para ganhar ${process.env.ECONOMY_COINNAME}s!`,
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "snake-game",
      description: `Coma as frutas sem bater nas bordas para ganhar ${process.env.ECONOMY_COINNAME}s!`,
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "minesweeper",
      description: `Evite as minas para ganhar ${process.env.ECONOMY_COINNAME}s, se não perderá eles!`,
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],

  run: async (client, interaction) => {
    try {
      const serverSettings = await ServerSettings.findOne({ serverId: interaction.guild.id });
      const gamesChannelId = serverSettings?.gameschannelId;

      if (!gamesChannelId) {
        const errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Canal não configurado")
          .setDescription("O canal de jogos ainda não foi configurado nesse servidor.");
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      if (interaction.channelId !== gamesChannelId) {
        const errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Comando não permitido neste canal")
          .setDescription(`Este comando só pode ser usado no canal <#${gamesChannelId}>`);
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      const subcommand = interaction.options.getSubcommand();
      const playerOnlyMsg = "Só {player} pode usar esses botões.";
      const userId = interaction.user.id;
      let user = await Wallet.findOne({ userId }) || new Wallet({ userId });

      switch (subcommand) {
        case "2048":
          await start2048Game(interaction, playerOnlyMsg, user);
          break;
        case "snake-game":
          await startSnakeGame(interaction, playerOnlyMsg, user);
          break;
        case "minesweeper":
          await startMinesweeperGame(interaction, playerOnlyMsg, user);
          break;
        default:
          const errorEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Comando inválido")
            .setDescription("O comando escolhido é inválido.");
          interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    } catch (e) {
      console.log(error("Erro ") + `ao executar o comando de Games devido à:\n ${e}`);
      logger.error(`Erro ao executar o comando Games devido à: ${e}`);
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Erro na execução.")
        .setDescription("Não foi possível executar o comando de games, tente novamente mais tarde.");
      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};

async function start2048Game(interaction, playerOnlyMsg, user) {
  const game = new TwoZeroFourEight({
    message: interaction,
    isSlashGame: true,
    embed: { title: "2048", color: hxmaincolor },
    emojis: { up: "⬆️", down: "⬇️", left: "⬅️", right: "➡️" },
    timeoutTime: 60000,
    buttonStyle: "PRIMARY",
    playerOnlyMessage: playerOnlyMsg,
  });

  game.startGame();
  game.on("gameOver", async (result) => {
    const score = result.score;
    const finalAmount = Math.round(score / 2);
    const embed = new EmbedBuilder()
      .setColor(hxmaincolor)
      .setTitle("**Game Over**")
      .addFields(
        { name: "Pontos:", value: `${score}`, inline: true },
        { name: `${process.env.ECONOMY_COINNAME}s:`, value: `${finalAmount}`, inline: true }
      );

    user.coins = (user.coins || 0) + finalAmount;
    await user.save();
    interaction.channel.send({ embeds: [embed], ephemeral: true });
  });
}

async function startSnakeGame(interaction, playerOnlyMsg, user) {
  const game = new Snake({
    message: interaction,
    isSlashGame: true,
    embed: { title: "Jogo da cobrinha", overTitle: "Game Over", color: hxmaincolor },
    emojis: { board: "⬛", food: "🍎", up: "⬆️", down: "⬇️", left: "⬅️", right: "➡️" },
    snake: { head: "🟢", body: "🟩", tail: "🟢", skull: "⛔" },
    foods: ["🍎", "🍇", "🍊", "🥕", "🥝", "🌽"],
    stopButton: "Stop",
    timeoutTime: 60000,
    playerOnlyMessage: playerOnlyMsg,
  });

  game.startGame();
  game.on("gameOver", async (result) => {
    const score = result.score;
    const finalAmount = Math.round(score / 2);
    const embed = new EmbedBuilder()
      .setColor(hxmaincolor)
      .setTitle("**Game Over**")
      .addFields(
        { name: "Pontos:", value: `${score}`, inline: true },
        { name: `${process.env.ECONOMY_COINNAME}s:`, value: `${finalAmount}`, inline: true }
      );

    user.coins = (user.coins || 0) + finalAmount;
    await user.save();
    interaction.channel.send({ embeds: [embed], ephemeral: true });
  });
}

async function startMinesweeperGame(interaction, playerOnlyMsg, user) {
  const reward = 475;
  const lose = 250;
  const game = new Minesweeper({
    message: interaction,
    isSlashGame: true,
    embed: {
      title: "Campo Minado",
      color: hxmaincolor,
      description: "Clique nos botões para revelar os blocos, exceto as minas.",
    },
    emojis: { flag: "🚩", mine: "💣" },
    mines: 5,
    timeoutTime: 65000,
    winMessage: `Você ganhou o jogo! Você evitou com sucesso todas as minas, como recompensa você recebeu ${process.env.ECONOMY_COINSYMB}:${reward}!`,
    loseMessage: `Você perdeu o jogo! Cuidado com as minas da próxima vez, e como consequência perdeu ${process.env.ECONOMY_COINSYMB}:${lose}.`,
    playerOnlyMessage: playerOnlyMsg,
  });

  game.startGame();
  game.on("gameOver", async (result) => {
    if (result.result === "lose") {
      user.coins = Math.max(0, user.coins - lose);
    } else if (result.result === "win") {
      user.coins += reward;
    }
    await user.save();
  });
}
