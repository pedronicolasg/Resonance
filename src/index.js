const fs = require("fs");
const themes = require("./themes/chalk-themes");
const Discord = require("discord.js");
const { logger } = require("./events/client/logger");
const mongoose = require("mongoose");

console.log(
  themes.success("Sucesso ") + "ao carregar as configurações do bot."
);
logger.info(`Sucesso ao carregar as configurações do bot.`);

const client = new Discord.Client({
  intents: [Discord.GatewayIntentBits.Guilds],
});

require("dotenv").config();
let token = process.env.TOKEN;
let conn_string = process.env.MONGODB_URI;
console.log(themes.success("Sucesso ") + "ao carregar os segredos do bot.");
logger.info(`Sucesso ao carregar os segredos do bot.`);

module.exports = client;

client.slashCommands = new Discord.Collection();

(async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(conn_string, { keepAlive: true });
    console.log(themes.success("Sucesso ") + "ao conectar ao banco de dados.");
    logger.info(`Sucesso ao conectar ao banco de dados.`);

    require("./handler")(client);
    console.log(themes.success("Sucesso ") + "ao carregar a Command handler.");
    logger.info(`Sucesso ao carregar a Command handler.`);

    client.login(token);
    console.log(themes.success("Sucesso ") + "ao logar o bot.");
    logger.info(`Sucesso ao logar o bot.`);
  } catch (err) {
    console.error(
      themes.error("Erro ") + "ao conectar ao banco de dados: " + err
    );
    logger.error(`Erro ao conectar ao banco de dados: ` + err);
  }
})();
