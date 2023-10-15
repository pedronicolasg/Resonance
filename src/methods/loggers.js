const winston = require("winston");
const { format } = winston;
const path = require("path");
const logsDirectory = path.join(__dirname, "../logs");
const { name } = require("../config.json");
const ServerSettings = require("../database/models/servercfg");

// LogChannel
async function sendLogEmbed(client, guildId, embed, files) {
  let serverSettings = await ServerSettings.findOne({
    serverId: guildId,
  });
  if (!serverSettings?.logchannelId) return;

  let logChannelId = serverSettings.logchannelId;
  let logChannel = client.channels.cache.get(logChannelId);

  if (logChannel) {
    if (files) {
      logChannel.send({ embeds: [embed], files: [files] });
    } else logChannel.send({ embeds: [embed] });
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
  defaultMeta: { service: name },
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
  defaultMeta: { service: name },
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
