import net from "node:net";
import { createLogger, format, transports } from "winston";

const { printf, combine, timestamp, label, colorize } = format;

const logFormat = printf(({ level, message, label, timestamp }) => {
  return `[${level}] ${timestamp} | ${label}: ${message}`; // [level] timestamp label: message
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

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    logger.info(data.toString());
    socket.end();
  });
});

server.listen(3000, () => {
  logger.info("3000번 포트에서 서버 대기 중");
});
