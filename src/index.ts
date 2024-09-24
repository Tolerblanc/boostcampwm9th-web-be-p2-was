import net from "node:net";
import { logger } from "./util/logger";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    logger.info(data.toString());
    socket.end();
  });
});

server.listen(3000, () => {
  logger.info("3000번 포트에서 서버 대기 중");
});
