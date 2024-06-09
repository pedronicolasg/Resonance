const fs = require("fs").promises;
const { success, error } = require("../themes/main");
const { logger } = require("./loggers");

module.exports = async (client) => {
  const SlashsArray = [];

  try {
    // Carregar comandos
    const commandFolders = await fs.readdir('./src/commands');
    for (const subfolder of commandFolders) {
      const commandFiles = await fs.readdir(`./src/commands/${subfolder}`);
      for (const file of commandFiles) {
        if (!file.endsWith(".js")) continue;
        const command = require(`../commands/${subfolder}/${file}`);
        if (!command.name) continue;
        client.slashCommands.set(command.name, command);
        SlashsArray.push(command);
      }
    }
    console.log(success("Sucesso ") + "ao carregar os comandos.");
    logger.info(`Sucesso ao carregar os comandos.`);

    // Carregar eventos
    const eventFolders = await fs.readdir('./src/events');
    for (const subfolder of eventFolders) {
      const eventFiles = await fs.readdir(`./src/events/${subfolder}`);
      for (const file of eventFiles) {
        if (!file.endsWith(".js")) continue;
        require(`../events/${subfolder}/${file}`);
      }
    }
    console.log(success("Sucesso ") + "ao carregar os eventos.");
    logger.info(`Sucesso ao carregar os eventos.`);

    client.on("ready", async () => {
      for (const guild of client.guilds.cache.values()) {
        await guild.commands.set(SlashsArray);
      }
      console.log(success("Sucesso ") + "ao adicionar a lista de comandos no cache do servidor.");
      logger.info(`Sucesso ao adicionar a lista de comandos no cache do servidor.`);
    });

  } catch (err) {
    console.error(error("Erro ") + "ao carregar comandos ou eventos:", err);
    logger.error(`Erro ao carregar comandos ou eventos: ${err.message}`);
  }

  client.on("guildCreate", registerCommandsOnGuildCreate);

  async function registerCommandsOnGuildCreate(guild) {
    try {
      await guild.commands.set(SlashsArray);
      console.log(success("Sucesso ") + `ao registrar comandos no servidor: ${guild.name}.`);
      logger.info(`Sucesso ao registrar os comandos no servidor: ${guild.name}!`);
    } catch (err) {
      console.log(error("Erro ") + `ao registrar comandos no servidor ${guild.name} devido à:\n ${err}`);
      logger.error(`Erro ao registrar comandos no servidor ${guild.name} devido à: ${err}`);
    }
  }

  return { registerCommandsOnGuildCreate };
};
