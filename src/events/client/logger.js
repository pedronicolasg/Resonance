const winston = require("winston");
const { format } = winston;
const path = require("path");
const logsDirectory = path.join(__dirname, "../../logs");
const { name } = require("../../config.json");

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
  logger,
  logger_economy,
};
