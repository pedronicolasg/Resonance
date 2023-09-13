const fs = require("fs");
const themes = require('../themes/chalk-themes');
const { logger } = require('../events/app/logger');

module.exports = async (client) => {
  const SlashsArray = [];

  fs.readdir(`./src/commands`, (error, folder) => {
    folder.forEach((subfolder) => {
      fs.readdir(`./src/commands/${subfolder}/`, (error, files) => {
        files.forEach((files) => {
          if (!files?.endsWith(".js")) return;
          files = require(`../commands/${subfolder}/${files}`);
          if (!files?.name) return;
          client.slashCommands.set(files?.name, files);

          SlashsArray.push(files);
        });
      });
    });
    console.log(themes.success("Sucesso ") + "ao carregar os comandos.")
    logger.info(`Sucesso ao carregar os comandos.`);
  });

  fs.readdir(`./src/events/`, (erro, folder) => {
    folder.forEach((subfolder) => {
      fs.readdir(`./src/events/${subfolder}/`, (erro, files) => {
        files.forEach((file) => {
          if (!file.endsWith(".js")) return;
          require(`../events/${subfolder}/${file}`);
        });
      });
    });
    console.log(themes.success("Sucesso ") + "ao carregar os eventos.")
    logger.info(`Sucesso ao carregar os eventos.`);
  });
  client.on("ready", async () => {
    client.guilds.cache.forEach((guild) => guild.commands.set(SlashsArray));
    console.log(themes.success("Sucesso ") + "ao adicionar a lista de comandos no cache do servidor.")
    logger.info(`Sucesso ao adicionar a lista de comandos no cache do servidor.`);
  });
};
