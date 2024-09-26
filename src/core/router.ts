import { MiddlewareHandler } from "@/core/middleware";
import { Request } from "@/core/request";
import { Response } from "@/core/response";

class Router {
  private routeTable: Map<string, Map<string, MiddlewareHandler>>; // URI, <Method, Handler>

  constructor() {
    this.routeTable = new Map();
  }

  private addRoute(uri: string, method: string, handler: MiddlewareHandler) {
    if (!this.routeTable.has(uri)) {
      this.routeTable.set(uri, new Map());
    }
    this.routeTable.get(uri)?.set(method, handler);
  }

  get(path: string, handler: MiddlewareHandler) {
    this.addRoute(path, "GET", handler);
  }

  post() {
    //TODO: POST 메서드 라우팅
  }

  put() {
    //TODO: PUT 메서드 라우팅
  }

  patch() {
    //TODO: PATCH 메서드 라우팅
  }

  delete() {
    //TODO: DELETE 메서드 라우팅
  }

  handle = async (req: Request, res: Response) => {
    const method = req.method.toUpperCase();
    const endpoint = req.endpoint;

    const handler = this.routeTable.get(endpoint)?.get(method);
    if (handler) {
      await handler(req, res, () => {});
    }
  };
}

export { Router };
