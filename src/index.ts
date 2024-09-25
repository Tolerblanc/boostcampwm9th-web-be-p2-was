import net from "node:net";
import { extname } from "node:path";

import {
  HttpError,
  MethodNotAllowedError,
  NotFoundError,
  UnsupportedMediaTypeError,
} from "@/util/httpError";
import { logger } from "@/util/logger";
import { parseRequestData } from "@/util/requestParser";
import { CONTENT_TYPE, EXT_NAME, ExtName } from "@/constants/contentType.enum";
import { sendResponse } from "@/util/sendResponse";
import { serveStaticFile } from "@/util/serveStatic";
import { createUser } from "@/users/createUser";

const server = net.createServer((socket) => {
  socket.on("data", async (data) => {
    const { protocol, method, uri, endpoint, query } = parseRequestData(
      data.toString()
    );

    logger.info(`${protocol} ${method} ${uri}`);

    try {
      if (method === "GET") {
        const ext = extname(endpoint).slice(1).toLowerCase() as ExtName;

        if (ext) {
          if (!EXT_NAME.includes(ext)) {
            throw new UnsupportedMediaTypeError();
          }

          await serveStaticFile(socket, uri);
        } else {
          if (endpoint === "/create") {
            const newUser = createUser(query);

            sendResponse(socket, {
              status: 200,
              message: "OK",
              contentType: "json",
              data: JSON.stringify(newUser),
            });
          } else {
            throw new NotFoundError();
          }
        }
      } else {
        throw new MethodNotAllowedError();
      }
    } catch (e) {
      const {
        status = 500,
        message = "Internal Server Error",
        stack,
      } = e as HttpError;

      sendResponse(socket, {
        status,
        message,
        data: message,
        contentType: CONTENT_TYPE["txt"],
      });

      logger.error(`${method} ${uri}\n${stack}`);
    } finally {
      if (socket.writable) socket.end();
    }
  });
});

server.listen(3000, () => {
  logger.info("3000번 포트에서 서버 대기 중");
});
