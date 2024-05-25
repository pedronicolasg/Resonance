const fs = require("fs");
const client = require("../../index");
require('dotenv').config();
const { maincolor, secondcolor } = require("../../themes/main");
const { logger } = require("../../methods/loggers");

client.on("ready", () => {
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
