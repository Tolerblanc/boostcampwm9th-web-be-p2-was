import { MiddlewareFunction } from "@/core/util/middleware";
import { Request } from "@/core/http/request";
import { Response } from "@/core/http/response";
import { NotFoundError } from "../http/httpError";

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

  private getOrCreateChildNode(currentNode: Node, part: string): Node {
    if (this.isDynamicRoute(part)) {
      return this.getOrCreateParamChild(currentNode, part);
    }
    return this.getOrCreateStaticChild(currentNode, part);
  }

  private isDynamicRoute(part: string): boolean {
    return part.startsWith(":");
  }

  private getOrCreateParamChild(node: Node, part: string): Node {
    if (!node.paramChild) {
      node.paramChild = new Node();
      node.paramChild.paramName = part.slice(1);
    }
    return node.paramChild;
  }

  private getOrCreateStaticChild(node: Node, part: string): Node {
    if (!node.children[part]) {
      node.children[part] = new Node();
    }
    return node.children[part];
  }

  private addHandlersToNode(
    node: Node,
    method: string,
    handlers: RouteHandler[]
  ) {
    if (!node.handlers) {
      node.handlers = {};
    }
    if (!node.handlers[method]) {
      node.handlers[method] = [];
    }
    node.handlers[method].push(...handlers);
  }

  addRoute(method: string, path: string, handlers: RouteHandler[]) {
    let currentNode = this.root;
    const parts = path.split("/").filter(Boolean);

    for (const part of parts) {
      currentNode = this.getOrCreateChildNode(currentNode, part);
    }

    this.addHandlersToNode(currentNode, method, handlers);
  }

  async handle(req: Request, res: Response) {
    const parts = req.path.split("/").filter((p) => p);
    const params: { [key: string]: string } = {};

    const node = this.findNode(this.root, parts, params);

    if (node?.handlers && node.handlers[req.method]) {
      req.params = params;
      await this.runMiddleware(req, res, node.handlers[req.method]);
      return;
    }
    throw new NotFoundError();
  }

  private async runMiddleware(
    req: Request,
    res: Response,
    handlers: MiddlewareFunction[]
  ) {
    let index = 0;
    const next = async (err?: Error) => {
      if (err) {
        throw err;
      }
      if (index >= handlers.length || res.isSent) {
        return;
      }
      const handler = handlers[index++];
      try {
        await handler.call(this, req, res, next);
      } catch (e) {
        await next(e as Error);
      }
    };
    await next();
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
