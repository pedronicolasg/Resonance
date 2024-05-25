const fs = require("fs");
const { success, error } = require("../themes/main");
const { logger } = require("./loggers");

module.exports = async (client) => {
  const SlashsArray = [];

  fs.readdir(`./src/commands`, (e, folder) => {
    folder.forEach((subfolder) => {
      fs.readdir(`./src/commands/${subfolder}/`, (e, files) => {
        files.forEach((files) => {
          if (!files?.endsWith(".js")) return;
          files = require(`../commands/${subfolder}/${files}`);
          if (!files?.name) return;
          client.slashCommands.set(files?.name, files);

          SlashsArray.push(files);
        });
      });
    });
    console.log(success("Sucesso ") + "ao carregar os comandos.");
    logger.info(`Sucesso ao carregar os comandos.`);
  });

  fs.readdir(`./src/events/`, (e, folder) => {
    folder.forEach((subfolder) => {
      fs.readdir(`./src/events/${subfolder}/`, (e, files) => {
        files.forEach((file) => {
          if (!file.endsWith(".js")) return;
          require(`../events/${subfolder}/${file}`);
        });
      });
    });
    console.log(success("Sucesso ") + "ao carregar os eventos.");
    logger.info(`Sucesso ao carregar os eventos.`);
  });
  
  client.on("ready", async () => {
    client.guilds.cache.forEach((guild) => guild.commands.set(SlashsArray));
    console.log(
      success("Sucesso ") +
        "ao adicionar a lista de comandos no cache do servidor."
    );
    logger.info(
      `Sucesso ao adicionar a lista de comandos no cache do servidor.`
    );
  });

  function registerCommandsOnGuildCreate(guild) {
    return new Promise(async () => {
      try {
        await guild.commands.set(SlashsArray);
        console.log(
          success("Sucesso ") +
            `ao registrar comandos no servidor: ${guild.name}.`
        );
        logger.info(
          `Sucesso ao registrar os comandos no servidor: ${guild.name}!`
        );
      } catch (e) {
        console.log(
          error("Erro ") +
            `ao registrar comandos no servidor ${guild.name} devido à:\n ${e}`
        );
        logger.error(
          `Erro ao registrar comandos no servidor ${guild.name} devido à: ${e}`
        );
      }
    });
  }

  module.exports = {
    registerCommandsOnGuildCreate,
  };
};
