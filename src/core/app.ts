import net from "node:net";
import { extname } from "node:path";

import {
  HttpError,
  MethodNotAllowedError,
  NotFoundError,
  UnsupportedMediaTypeError,
} from "@/util/httpError";
import { logger } from "@/util/logger";
import { CONTENT_TYPE, EXT_NAME, ExtName } from "@/constants/contentType.enum";
import { serveStaticFile } from "@/util/serveStatic";
import { createUser } from "@/users/createUser";
import { Middleware, MiddlewareHandler } from "@/core/middleware";
import { Request } from "@/core/request";
import { Response } from "@/core/response";

class WasApplication {
  private middleware: Middleware;
  private server: net.Server;

  constructor(server: net.Server) {
    this.middleware = new Middleware();
    this.server = server;
  }

  static create() {
    const server = net.createServer((socket) => {
      socket.on("data", async (data) => {
        const request = new Request(data.toString());
        const response = new Response(socket);
        logger.info(request.toString());

        try {
          if (request.method === "GET") {
            const ext = extname(request.endpoint)
              .slice(1)
              .toLowerCase() as ExtName;

            if (ext) {
              if (!EXT_NAME.includes(ext)) {
                throw new UnsupportedMediaTypeError();
              }

              await serveStaticFile(request, response);
            } else {
              if (request.endpoint === "/create") {
                const newUser = await createUser(request.query);

                response.contentType = "json";
                response.data = JSON.stringify(newUser);
                response.send();
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

          response.status = status;
          response.message = message;
          response.contentType = CONTENT_TYPE["txt"];
          response.data = message;
          response.send();

          logger.error(`${request.method} ${request.uri}\n${stack}`);
        } finally {
          if (socket.writable) socket.end();
        }
      });
    });

    return new WasApplication(server);
  }

  use(handler: MiddlewareHandler) {
    this.middleware.use(handler);
  }

  listen(port: number) {
    this.server.listen(port, () => {
      logger.info(`${port}번 포트에서 서버 대기 중`);
    });
  }
}

export { WasApplication };
