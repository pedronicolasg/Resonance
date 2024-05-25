require('dotenv').config();
const winston = require("winston");
const { format } = winston;
const path = require("path");
const logsDirectory = path.join(__dirname, "../logs");
const { getServerConfig } = require("../methods/DB/server");

async function sendLogEmbed(client, guildId, embed, files) {
  const logChannelId = await getServerConfig(guildId, 'logchannelId');
  const logChannel = client.channels.cache.get(logChannelId);

  if (logChannel) {
    if (files) {
      logChannel.send({ embeds: [embed], files: [files] });
    } else {
      logChannel.send({ embeds: [embed] });
    }
  }
}

// Winston loggers
const logger = winston.createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.json()
  ),
  defaultMeta: { service: process.env.NAME },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDirectory, "error.json"),
      level: "error",
      format: format.combine(
        format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        format.json()
      ),
    }),
    new winston.transports.File({
      filename: path.join(logsDirectory, "combined.json"),
      format: format.combine(
        format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        format.json()
      ),
    }),
  ],
});

const logger_economy = winston.createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.json()
  ),
  defaultMeta: { service: process.env.NAME },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDirectory, "economy.json"),
      format: format.combine(
        format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        format.json()
      ),
    }),
  ],
});

module.exports = {
  sendLogEmbed,
  logger,
  logger_economy,
};
