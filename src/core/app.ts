import net from "node:net";
import "reflect-metadata";

import { HttpError } from "@/core/http/httpError";
import { logger } from "@/util/logger";
import { CONTENT_TYPE } from "@/core/http/contentType.enum";
import { Request } from "@/core/http/request";
import { Response } from "@/core/http/response";
import { Router } from "@/core/util/router";
import { ConnectionBuffer } from "@/core/util/connectionBuffer";
import { RouteDefinition } from "@/core/util/decorators";
import { MiddlewareFunction } from "@/core/util/middleware";
import { dataSource } from "@/core/util/dataSource";

class WasApplication {
  private router: Router;
  private globalMiddlewares: MiddlewareFunction[] = [];
  private server?: net.Server;

  constructor() {
    this.router = new Router();
    //TODO: 서버 초기화 로직 개선
    this.init();
  }

  registerControllers(...controllers: any[]) {
    controllers.forEach((controller) => {
      const prefix = Reflect.getMetadata("prefix", controller) || "";
      const routes: RouteDefinition[] =
        Reflect.getMetadata("routes", controller) || [];

      const instance = new controller();

      routes.forEach((route) => {
        const { method, path, handlerName } = route;
        const fullPath = prefix + path;
        const handler =
          instance[handlerName as keyof typeof instance].bind(instance);
        const middlewares =
          Reflect.getMetadata("middlewares", instance, handlerName) || [];

        this.router.addRoute(method, fullPath, [...middlewares, handler]);
        logger.info(`라우터 등록: ${method} ${fullPath}`);
      });
    });
  }

  use(middleware: MiddlewareFunction) {
    this.globalMiddlewares.push(middleware);
  }

  init() {
    dataSource.initialize().then(() => {
      logger.info("데이터베이스 연결 성공");
    });

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
        if (connectionBuffer.addChunk(chunk) === -1) {
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
        if (connectionBuffer.size > 0) {
          logger.error(
            `Connection End ${socket.remoteAddress}:${socket.remotePort}`
          );
        }
      });
    });
  }

  private async runGlobalMiddlewares(request: Request, response: Response) {
    let index = 0;
    const next = async (err?: Error) => {
      if (err) {
        throw err;
      }
      if (index >= this.globalMiddlewares.length || response.isSent) {
        return;
      }
      const middleware = this.globalMiddlewares[index++];
      await middleware.call(this, request, response, next);
    };
    await next();
  }

  private async processHttpRequest(
    socket: net.Socket,
    connectionBuffer: ConnectionBuffer
  ) {
    const request = new Request(connectionBuffer.toString());
    const response = new Response(socket);

    logger.info(request.toString());

    try {
      await this.runGlobalMiddlewares(request, response);
      if (!response.isSent) {
        await this.router.handle(request, response);
      }
    } catch (e) {
      const {
        status = 500,
        message = "Internal Server Error",
        stack,
      } = e as HttpError;

      if (status === 404) {
        response.redirect("/404.html").send();
        return;
      }
      response
        .status(status)
        .message(message)
        .contentType(CONTENT_TYPE["txt"])
        .data(message)
        .send();

      logger.error(`${request.method} ${request.path}\n${stack}`);
    } finally {
      if (socket.writable) socket.end();
    }
  }

  listen(port: number) {
    this.server?.listen(port, () => {
      logger.info(`${port}번 포트에서 서버 대기 중`);
    });
  }
}

export { WasApplication };
