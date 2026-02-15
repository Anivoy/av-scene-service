import winston from "winston";
import util from "util";

function safeSerialize(meta) {
  try {
    return util.inspect(meta, {
      depth: 5,
      breakLength: 120,
      compact: false,
    });
  } catch (err) {
    return "[Unserializable metadata]";
  }
}

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: false }),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      const hasMeta = meta && Object.keys(meta).length > 0;

      const metaString = hasMeta
        ? `\n${safeSerialize(meta)}`
        : "";

      return `${timestamp} [${level.toUpperCase()}]: ${message}${metaString}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

export const stream = {
  write: (message) => logger.info(message.trim()),
};
