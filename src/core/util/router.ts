import { MiddlewareFunction } from "@/core/util/middleware";
import { Request } from "@/core/http/request";
import { Response } from "@/core/http/response";
import { handleStaticFileRoute } from "@/core/builtin/staticFile.middleware";

type RouteHandler = MiddlewareFunction;

/**
 * 라우팅 트리의 노드
 * @class Node
 * @property {Object} children - 자식 노드들
 * @property {Node} paramChild - 동적 라우팅 노드
 * @property {Object} handlers - 메서드별 핸들러 목록
 * @property {string} paramName - 동적 라우팅 노드의 이름
 */
class Node {
  children: { [key: string]: Node } = {};
  paramChild: Node | null = null;
  handlers: { [method: string]: RouteHandler[] } | null = null;
  paramName: string | null = null;
}

class Router {
  private root: Node = new Node();

  addRoute(method: string, path: string, handlers: RouteHandler[]) {
    let node = this.root;
    const parts = path.split("/").filter((part) => part.length > 0);
    for (const part of parts) {
      // 동적 라우팅 경로라면
      // ? 더 깔끔하게 작성할 수 없을까?
      if (part.startsWith(":")) {
        if (!node.paramChild) {
          node.paramChild = new Node();
          node.paramChild.paramName = part.slice(1);
        }
        node = node.paramChild;
      } else {
        if (!node.children[part]) {
          node.children[part] = new Node();
        }
        node = node.children[part];
      }
    }
    if (!node.handlers) {
      node.handlers = {};
    }
    if (!node.handlers[method]) {
      node.handlers[method] = [];
    }
    node.handlers[method].push(...handlers);
  }

  async handle(req: Request, res: Response) {
    const parts = req.path.split("/").filter((p) => p);
    const params: { [key: string]: string } = {};

    const node = this.findNode(this.root, parts, params);

    if (node?.handlers && node.handlers[req.method]) {
      req.params = params;
      await this.runMiddleware(req, res, node.handlers[req.method]);
    } else {
      await this.runMiddleware(req, res, [handleStaticFileRoute]);
    }
  }

  private async runMiddleware(
    req: Request,
    res: Response,
    handlers: MiddlewareFunction[]
  ) {
    for (const handler of handlers) {
      await handler(req, res, () => {});
      if (res.isSent) break;
    }
  }

  private findNode(
    node: Node,
    parts: string[],
    params: { [key: string]: string }
  ): Node | null {
    if (parts.length === 0) {
      return node;
    }

    const part = parts[0];
    const remainingParts = parts.slice(1);

    if (node.children[part]) {
      return this.findNode(node.children[part], remainingParts, params);
    }

    if (node.paramChild) {
      params[node.paramChild.paramName!] = part;
      return this.findNode(node.paramChild, remainingParts, params);
    }

    return null;
  }
}

export { Router };
