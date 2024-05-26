const { Events } = require("discord.js");
const { warning, info, error } = require("../../themes/main");
const { logger } = require("../../methods/loggers");
const { dumpServerSettings } = require("../../methods/DB/server");
const client = require("../../index");

client.on(Events.GuildDelete, async (guild) => {
  try {
    const deleteResult = dumpServerSettings(guild.id);

    if (deleteResult.deletedCount > 0) {
      console.log(
        info("Fui removido ") +
        `do servidor ${guild.name} e os documentos relacionados ao servidor foram ` +
        warning(`excluídos do banco de dados.`)
      );
      logger.info(
        `Fui removido do servidor: ${guild.name} e os documentos relacionados ao servidor foram excluídos do banco de dados.`
      );
    } else {
      console.log(info("Fui removido ") + `do servidor ${guild.name}.`);
      logger.info(`Fui removido do servidor: ${guild.name}.`);
    }
  } catch (e) {
    console.log(
      error("Erro ") +
      `ao excluir os documentos do servidor ${guild.name} ao sair devido à:\n ${e}`
    );
    logger.error(
      `Erro ao excluir os documentos do servidor ${guild.name} ao sair devido à: ${e}`
    );
  }
});
