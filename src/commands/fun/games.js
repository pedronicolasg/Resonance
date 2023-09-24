const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const { TwoZeroFourEight, Snake, Minesweeper } = require("discord-gamecord");
const { hxmaincolor, success, error } = require("../../themes/main");
const { economy } = require("../../config.json");
const { logger } = require("../../events/client/logger");
const Wallet = require("../../database/models/wallet");
const ServerSettings = require("../../database/models/servercfg");

module.exports = {
  name: "game",
  description: "Escolha um jogo e divirta-se :)",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "2048",
      description: `Aumente os números para ganhar ${economy.coinname}s!`,
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "snake-game",
      description: `Coma as frutas sem bater nas bordas para ganhar ${economy.coinname}s!`,
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "minesweeper",
      description: `Evite as minas para ganhar 500 ${economy.coinname}s, se não perde 250!`,
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],

  run: async (client, interaction) => {
    const serverSettings = await ServerSettings.findOne({
      serverId: interaction.guild.id,
    });
    const gameschannel = client.channels.cache.get(
      serverSettings.gameschannelId
    );
    if (!gameschannel) {
      let embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Canal não configurado")
        .setDescription(
          `O canal de jogos ainda não foi configurado nesse servidor.`
        );
      interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    } else if (interaction.channel.id == !gameschannel) {
      let embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Canal incorreto")
        .setDescription(`Você só pode jogar no canal: ${gameschannel}`);
      interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    } else {
      const subcommand = interaction.options.getSubcommand();
      const playerOnlyMsg = "Só {player} pode usar esses botões.";
      const userId = interaction.user.id;
      const user = await Wallet.findOne({ userId });

      const tzfe = new TwoZeroFourEight({
        message: interaction,
        isSlashGame: true,
        embed: {
          title: "2048",
          color: "#5865F2",
        },
        emojis: {
          up: "⬆️",
          down: "⬇️",
          left: "⬅️",
          right: "➡️",
        },
        timeoutTime: 60000,
        buttonStyle: "PRIMARY",
        playerOnlyMessage: playerOnlyMsg,
      });

      const snake = new Snake({
        message: interaction,
        isSlashGame: true,
        embed: {
          title: "Jogo da cobrinha",
          overTitle: "Game Over",
          color: "#5865F2",
        },
        emojis: {
          board: "⬛",
          food: "🍎",
          up: "⬆️",
          down: "⬇️",
          left: "⬅️",
          right: "➡️",
        },
        snake: { head: "🟢", body: "🟩", tail: "🟢", skull: "⛔" },
        foods: ["🍎", "🍇", "🍊", "🥕", "🥝", "🌽"],
        stopButton: "Stop",
        timeoutTime: 60000,
        playerOnlyMessage: playerOnlyMsg,
      });

      const minesweeper = new Minesweeper({
        message: interaction,
        isSlashGame: true,
        embed: {
          title: "Campo Minado",
          color: "#5865F2",
          description:
            "Clique nos botões para revelar os blocos, exceto as minas.",
        },
        emojis: { flag: "🚩", mine: "💣" },
        mines: 5,
        timeoutTime: 65000,
        winMessage: `Você ganhou o jogo! Você evitou com sucesso todas as minas, como recompensa você recebeu ${economy.coinsymb}:500!`,
        loseMessage: `Você perdeu o jogo! Cuidado com as minas da próxima vez, e como consequência perdeu ${economy.coinsymb}:250.`,
        playerOnlyMessage: playerOnlyMsg,
      });

      switch (subcommand) {
        case "2048":
          tzfe.startGame();
          tzfe.on("gameOver", (result) => {
            let score = result.score;
            let amount = score / 2;
            let finalAmount = Math.round(amount);
            const tzfeEmbed = new EmbedBuilder()
              .setColor(hxmaincolor)
              .setTitle(`**Game Over**`)
              .setFields(
                {
                  name: "Pontos:",
                  value: `${score}`,
                  inline: true,
                },
                {
                  name: `${economy.coinname}s:`,
                  value: `${finalAmount}`,
                  inline: true,
                }
              );
            user.coins = (user.coins || 0) + finalAmount;
            user.save();
            interaction.channel.send({ embeds: [tzfeEmbed], ephemeral: true });
          });
          break;

        case "snake-game":
          snake.startGame();
          snake.on("gameOver", (result) => {
            let score = result.score;
            let amount = score / 2;
            let finalAmount = Math.round(amount);
            const tzfeEmbed = new EmbedBuilder()
              .setColor(hxmaincolor)
              .setTitle(`**Game Over**`)
              .setFields(
                {
                  name: "Pontos:",
                  value: `${score}`,
                  inline: true,
                },
                {
                  name: `${economy.coinname}s:`,
                  value: `${finalAmount}`,
                  inline: true,
                }
              );
            user.coins = (user.coins || 0) + finalAmount;
            user.save();
            interaction.channel.send({ embeds: [tzfeEmbed], ephemeral: true });
          });
          break;

        case "minesweeper":
          minesweeper.startGame();
          minesweeper.on("gameOver", (result) => {
            if (result.result == "lose") {
              if (user.coins == 0) return;
              user.coins = user.coins - 250;
              return;
            }
            if (result.result == "win") {
              user.coins = (user.coins || 0) + 500;
              user.save();
            }
          });
          break;
      }
    }
  },
};
