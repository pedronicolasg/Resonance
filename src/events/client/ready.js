const fs = require('fs');
const client = require("../../index");
const config = require("../../config.json");
const themes = require('../../themes/chalk-themes');
const { logger } = require('../app/logger');

client.on("ready", () => {
    fs.readFile('./src/images/ascii.txt', 'utf8', function (err, data) {
        if (err) {
            console.log(err);
            console.log(`${config.name} online na versão ${config.version}!`);
        } else {
            console.log(themes.maincolor(data) + themes.secondcolor(' V' + config.version) + '\n');
        }
    });
    logger.info(`${config.name} online na versão ${config.version}!`);
});
