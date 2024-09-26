import { MiddlewareHandler } from "@/core/middleware";
import { Request } from "@/core/request";
import { Response } from "@/core/response";
import { NotFoundError } from "@/util/httpError";

class Router {
  // 라우팅 어떻게 하죠?? ㅜㅜ
  // 메서드 기준 / URI 기준
  // 메서드 기준이면 key:value 중 value 가 너무 비대해진다? 동의합니다
  // URI 기준이면 빠르게 탐색 되면서 value가 최대 5개?
  // 근데 만약 /user/:id 같은 동적 라우팅이 있으면 어떻게 하죠??
  // 일단 URI 기준으로 구현해보고, 나중에 생각해봅시다

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

  handle: MiddlewareHandler = async (req, res) => {
    const method = req.method.toUpperCase();
    const uri = req.uri;

    const handler = this.routeTable.get(uri)?.get(method);
    if (handler) {
      await handler(req, res, () => {});
    }
  };
}

export { Router };
