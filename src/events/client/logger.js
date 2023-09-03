const winston = require("winston");
const { format } = winston;
const path = require("path");
const logsDirectory = path.join(__dirname, "../../logs");
const config = require("../../config.json");

const logger = winston.createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.json()
  ),
  defaultMeta: { service: config.name },
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
  defaultMeta: { service: config.name },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDirectory, "economy.json"),
      level: "info",
      format: format.combine(
        format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        format.json()
      ),
    }),
    new winston.transports.File({
      filename: path.join(logsDirectory, "economyWarns.json"),
      level: "warn",
      format: format.combine(
        format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        format.json()
      ),
    }),
    new winston.transports.File({
      filename: path.join(logsDirectory, "economyErrors.json"),
      level: "error",
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
  logger,
  logger_economy,
};
