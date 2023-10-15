const { success, error } = require("./themes/main");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { logger } = require("./methods/loggers");
const mongoose = require("mongoose");

console.log(success("Sucesso ") + "ao carregar as configurações do bot.");
logger.info(`Sucesso ao carregar as configurações do bot.`);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildInvites,
  ],
});

require("dotenv").config();
let token = process.env.TOKEN;
let connString = process.env.MONGODB_URI;
console.log(success("Sucesso ") + "ao carregar os segredos do bot.");
logger.info(`Sucesso ao carregar os segredos do bot.`);

(async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(connString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(success("Sucesso ") + "ao conectar ao banco de dados.");
    logger.info(`Sucesso ao conectar ao banco de dados.`);

    require("./handler")(client);
    console.log(success("Sucesso ") + "ao carregar a Command handler.");
    logger.info(`Sucesso ao carregar a Command handler.`);

    client.login(token);
    console.log(success("Sucesso ") + "ao logar o bot.");
    logger.info(`Sucesso ao logar o bot.`);
  } catch (e) {
    console.error(error("Erro ") + `ao conectar ao banco de dados: ${e}`);
    logger.error(`Erro ao conectar ao banco de dados: ${e}`);
  }
})();

client.slashCommands = new Collection();
module.exports = client;
