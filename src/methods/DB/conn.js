const mongoose = require("mongoose");
const { logger } = require("../loggers");
const { success, error } = require("../../themes/main");

async function conn(connString) {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(connString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(success("Sucesso ") + "ao conectar ao banco de dados.");
    logger.info(`Sucesso ao conectar ao banco de dados.`);
  } catch (e) {
    console.error(error("Erro ") + `ao conectar ao banco de dados: ${e}`);
    logger.error(`Erro ao conectar ao banco de dados: ${e}`);
    throw e;
  }
}

module.exports = { conn };
