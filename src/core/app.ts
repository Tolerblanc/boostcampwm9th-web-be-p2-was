import net from "node:net";

import { HttpError, NotFoundError } from "@/util/httpError";
import { logger } from "@/util/logger";
import { CONTENT_TYPE } from "@/constants/contentType.enum";
import { Middleware, MiddlewareHandler } from "@/core/middleware";
import { Request } from "@/core/request";
import { Response } from "@/core/response";
import { Router } from "@/core/router";
import { handleStaticFileRoute } from "@/core/builtin/staticFile.middleware";

// TODO: 클래스로 분리
type ConnectionBuffer = {
  data: Buffer;
  size: number;
  maxSize: number;
};

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
      const connectionBuffer: ConnectionBuffer = {
        data: Buffer.alloc(0),
        size: 0,
        maxSize: 1024 * 1024 * 10, // TODO: 환경변수로 관리
      };

      socket.on("timeout", () => {
        logger.error(
          `Connection Timeout ${socket.remoteAddress}:${socket.remotePort}`
        );
        socket.end();
      });

      socket.on("data", async (chunk) => {
        if (connectionBuffer.size + chunk.length > connectionBuffer.maxSize) {
          logger.error(
            `Connection Buffer Overflow ${socket.remoteAddress}:${socket.remotePort}`
          );
          socket.end();
          return;
        }

        connectionBuffer.data = Buffer.concat([connectionBuffer.data, chunk]);
        connectionBuffer.size += chunk.length;

        if (this.isCompleteHttpRequest(connectionBuffer)) {
          this.processHttpRequest(socket, connectionBuffer);
          connectionBuffer.data = Buffer.alloc(0);
          connectionBuffer.size = 0;
        }
      });

      socket.on("end", () => {
        if (connectionBuffer.size > 0) {
          logger.error(
            `Connection End ${socket.remoteAddress}:${socket.remotePort}`
          );
        }
      });
    });
  }

  private isCompleteHttpRequest(connectionBuffer: ConnectionBuffer) {
    const str = connectionBuffer.data.toString();
    const headerEnd = str.indexOf("\r\n\r\n");

    if (headerEnd === -1) return false;

    const contentLengthMatch = str.match(/Content-Length: (\d+)/i);
    if (contentLengthMatch) {
      const contentLength = parseInt(contentLengthMatch[1], 10);
      return connectionBuffer.data.length >= headerEnd + 4 + contentLength;
    }

    // * Content-Length 헤더가 없는 경우, 헤더의 끝을 요청의 끝으로 간주
    return true;
  }

  private async processHttpRequest(
    socket: net.Socket,
    connectionBuffer: ConnectionBuffer
  ) {
    const request = new Request(connectionBuffer.data.toString());
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
