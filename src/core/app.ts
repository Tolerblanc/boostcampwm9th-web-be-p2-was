import net from "node:net";

import { HttpError, NotFoundError } from "@/util/httpError";
import { logger } from "@/util/logger";
import { CONTENT_TYPE } from "@/constants/contentType.enum";
import { Middleware, MiddlewareHandler } from "@/core/middleware";
import { Request } from "@/core/request";
import { Response } from "@/core/response";
import { Router } from "@/core/router";
import { handleStaticFileRoute } from "@/core/builtin/staticFile.middleware";
import { ConnectionBuffer } from "@/core/connectionBuffer";

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
    //TODO: 존재하는 파일을 모두 라우터에 등록하는 로직 고려해보기
    this.middleware.use(handleStaticFileRoute);

    this.server = net.createServer((socket) => {
      const connectionBuffer = new ConnectionBuffer();

      socket.setTimeout(30000);

      socket.on("timeout", () => {
        logger.error(
          `Connection Timeout ${socket.remoteAddress}:${socket.remotePort}`
        );
        socket.end();
      });

      socket.on("data", async (chunk) => {
        if (!connectionBuffer.addChunk(chunk)) {
          logger.error(
            `Connection Buffer Overflow ${socket.remoteAddress}:${socket.remotePort}`
          );
          socket.end();
          return;
        }

        if (connectionBuffer.isCompleteHttpRequest()) {
          await this.processHttpRequest(socket, connectionBuffer);
          connectionBuffer.clear();
        }
      });

      socket.on("end", () => {
        if (connectionBuffer.getData().length > 0) {
          logger.error(
            `Connection End ${socket.remoteAddress}:${socket.remotePort}`
          );
        }
      });
    });
  }

  private async processHttpRequest(
    socket: net.Socket,
    connectionBuffer: ConnectionBuffer
  ) {
    const request = new Request(connectionBuffer.getData().toString());
    const response = new Response(socket);

    logger.info(request.toString());

    try {
      await this.middleware.handle(request, response);
      await this.router.handle(request, response);
      if (!response.isSent) {
        throw new NotFoundError();
      }
    } catch (e) {
      const {
        status = 500,
        message = "Internal Server Error",
        stack,
      } = e as HttpError;

      response
        .status(status)
        .message(message)
        .contentType(CONTENT_TYPE["txt"])
        .data(message)
        .send();

      logger.error(`${request.method} ${request.uri}\n${stack}`);
    } finally {
      if (socket.writable) socket.end();
    }
  }

  use(handler: Router) {
    this.router = handler;
  }

  get(path: string, handler: MiddlewareHandler) {
    this.router.get(path, handler);
  }

  post(path: string, handler: MiddlewareHandler) {
    this.router.post(path, handler);
  }

  listen(port: number) {
    this.server?.listen(port, () => {
      logger.info(`${port}번 포트에서 서버 대기 중`);
    });
  }
}

export { WasApplication };
