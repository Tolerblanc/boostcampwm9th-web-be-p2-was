import { createLogger, format, transports } from "winston";

const { printf, combine, timestamp, label, colorize } = format;

const logFormat = printf(({ level, message, label, timestamp }) => {
  return `[${level}] ${timestamp} | ${label}: ${message}`;
});

const logger = createLogger({
  level: "info",
  format: combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    label({ label: "Web-BE-P1 WAS" }),
    logFormat
  ),
  transports: [new transports.Console()],
});

export { logger };
