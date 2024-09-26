import net from "node:net";
import { extname } from "node:path";

import { HttpError, UnsupportedMediaTypeError } from "@/util/httpError";
import { logger } from "@/util/logger";
import { CONTENT_TYPE, EXT_NAME, ExtName } from "@/constants/contentType.enum";
import { serveStaticFile } from "@/util/serveStatic";
import { Middleware, MiddlewareHandler } from "@/core/middleware";
import { Request } from "@/core/request";
import { Response } from "@/core/response";
import { Router } from "./router";

class WasApplication {
  private middleware: Middleware;
  private router: Router;
  private server?: net.Server;

  constructor() {
    this.middleware = new Middleware();
    this.router = new Router();
    //TODO: 서버 초기화 로직 개선
    this.init();
  }

  init() {
    this.middleware.use(async (request, response) => {
      const ext = extname(request.endpoint).slice(1).toLowerCase() as ExtName;
      if (ext) {
        if (!EXT_NAME.includes(ext)) {
          throw new UnsupportedMediaTypeError();
        }

        await serveStaticFile(request, response);
      }
    });

    this.server = net.createServer((socket) => {
      socket.on("data", async (data) => {
        const request = new Request(data.toString());
        const response = new Response(socket);
        logger.info(request.toString());

        try {
          await this.middleware.handle(request, response);
          await this.router.handle(request, response);
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
  }

  use(handler: Router) {
    this.router = handler;
  }

  get(path: string, handler: MiddlewareHandler) {
    this.router.get(path, handler);
  }

  listen(port: number) {
    this.server?.listen(port, () => {
      logger.info(`${port}번 포트에서 서버 대기 중`);
    });
  }
}

export { WasApplication };
