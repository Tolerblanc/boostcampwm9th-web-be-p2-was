import net from "node:net";
import { logger } from "./util/logger";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";

function getDirname(importMetaUrl: string) {
  return dirname(fileURLToPath(importMetaUrl));
}

const __dirname = getDirname(import.meta.url);

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    logger.info(data.toString());
    const [requestHeader, body] = data.toString().split("\r\n\r\n");
    const [firstLine, ...options] = requestHeader.split("\r\n");
    const [method, uri, protocol] = firstLine.split(" ");

    if (method === "GET") {
      try {
        const ext = extname(uri);

        if (ext) {
          const rootDir = join(__dirname, "../");
          const filePath = join(rootDir, "/views", uri);

          if (!existsSync(filePath)) {
            const error = new Error("Not Found");
            error.status = 404;
            throw error;
          }

          const data = readFileSync(filePath);

          socket.write("HTTP/1.1 200 OK\r\n");
          socket.write("Content-Type: text/html\r\n");
          socket.write("\r\n");
          socket.write(data);
        } else {
          // TODO: 라우트요청
        }
      } catch (e) {
        socket.write(`HTTP/1.1 ${e.status} ${e.message}`);
        socket.write("Content-Type: text/plain\r\n");
        socket.write("\r\n");
        socket.write(e.message);
        logger.error(`${method} ${uri} ${e.message}`);
      } finally {
        socket.end();
      }
    }
  });
});

server.listen(3000, () => {
  logger.info("3000번 포트에서 서버 대기 중");
});
