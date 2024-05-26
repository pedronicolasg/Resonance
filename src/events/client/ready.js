const fs = require("fs");
const client = require("../../index");
require('dotenv').config();
const { maincolor, secondcolor } = require("../../themes/main");
const { logger } = require("../../methods/loggers");
const { success } = require("../../themes/main");
const { reloadInteractions } = require("../../methods/DB/server")

client.on("ready", async () => {
  await reloadInteractions(client);
  console.log(success("Sucesso ") + "ao recarregar as interações.");
  logger.info(`Sucesso ao recarregar as interações.`);
  fs.readFile("./src/assets/ascii.txt", "utf8", function (e, data) {
    if (e) {
      console.log(e);
      console.log(`${process.env.NAME} online na versão ${process.env.VERSION}!`);
    } else {
      console.log(maincolor(data) + secondcolor(` V${process.env.VERSION}`) + "\n");
    }
  });
  logger.info(`${process.env.NAME} online na versão ${process.env.VERSION}!`);
});
