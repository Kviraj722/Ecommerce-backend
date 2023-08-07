const { createLogger, transports, format, info } = require("winston");

const logger = createLogger({
  transports: [
    new transports.File({
      filename: "logs/logs.log",
      level: "info",
      format: format.combine(format.timestamp(), format.json()),
    }),
    new transports.File({
      filename: "logs/errLogs.log",
      level: "error",
      format: format.combine(format.timestamp(), format.json()),
    }),
    new transports.Console({
      level: "info",
      format: format.combine(format.timestamp(), format.simple()),
    }),

    new transports.Console({
      level: "error",
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});

module.exports = { logger };
