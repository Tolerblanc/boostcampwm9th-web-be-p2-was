import net from "node:net";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
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
