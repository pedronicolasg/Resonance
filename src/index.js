const { success, error } = require("./themes/main");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { logger } = require("./methods/loggers");
const { conn } = require("./methods/DB/conn");
require("dotenv").config();

const token = process.env.TOKEN;
const mongoUri = process.env.MONGODB_URI;

console.log(success("Sucesso ") + "ao carregar as configurações do bot.");
logger.info("Sucesso ao carregar as configurações do bot.");

console.log(success("Sucesso ") + "ao carregar os segredos do bot.");
logger.info("Sucesso ao carregar os segredos do bot.");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildInvites,
  ],
});

client.slashCommands = new Collection();

(async () => {
  try {
    await conn(mongoUri);
    console.log(success("Sucesso ") + "ao conectar ao banco de dados.");
    logger.info("Sucesso ao conectar ao banco de dados.");

    require("./methods/handler.js")(client);
    console.log(success("Sucesso ") + "ao carregar a Command handler.");
    logger.info("Sucesso ao carregar a Command handler.");

    await client.login(token);
    console.log(success("Sucesso ") + "ao logar o bot.");
    logger.info("Sucesso ao logar o bot.");
  } catch (e) {
    console.error(error("Erro ") + `ao conectar ao banco de dados ou logar o bot: ${e}`);
    logger.error(`Erro ao conectar ao banco de dados ou logar o bot: ${e}`);
  }
})();

module.exports = client;
