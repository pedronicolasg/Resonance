const fs = require("fs");
const client = require("../../index");
const { name, version } = require("../../config.json");
const { maincolor, secondcolor } = require("../../themes/main");
const { logger } = require("../client/logger");

client.on("ready", () => {
  fs.readFile("./src/images/ascii.txt", "utf8", function (e, data) {
    if (e) {
      console.log(e);
      console.log(`${name} online na versão ${version}!`);
    } else {
      console.log(maincolor(data) + secondcolor(` V${version}`) + "\n");
    }
  });
  logger.info(`${name} online na versão ${version}!`);
});
